/*
 * Copyright (C) 2017-2018 Junpei Kawamoto
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
jest.mock("child_process");

import {execFile, execSync, spawn} from "child_process";
import yaml from "js-yaml";
import jre from "node-jre";
import path from "path";
import readline from "readline";
import {Readable} from "stream";
import Sia from "../../src/main-process/sia";

describe("Sia class", () => {

  beforeAll(() => {
    jre.driver.mockReturnValue("/tmp/jre/bin/java");
  });

  describe("instance fields", () => {

    it("has cmd which describes the path to the sync sia app", () => {
      const oldPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", {
          value: "darwin"
        });

        const sia = new Sia();
        const cmd = "goobox-sync-sia";
        expect(sia.cmd).toEqual(cmd);

      } finally {
        Object.defineProperty(process, "platform", {
          value: oldPlatform
        });
      }
    });

    it("has cmd which describes the path to the bat file of sync sia app in Windows", () => {
      const oldPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", {
          value: "win32"
        });

        const sia = new Sia();
        const cmd = "goobox-sync-sia.bat";
        expect(sia.cmd).toEqual(cmd);

      } finally {
        Object.defineProperty(process, "platform", {
          value: oldPlatform
        });
      }
    });

    it("has wd which describes the directory containing the sync sia app", () => {
      const sia = new Sia();
      expect(sia.wd).toEqual(path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin")));
    });

    it("has javaHome where the home directory of a JRE", () => {
      const sia = new Sia();
      expect(sia.javaHome).toEqual(path.join(jre.driver(), "../../"));
    });

  });

  describe("start method", () => {

    let stdin, stdout, stderr, on, once;
    beforeEach(() => {
      stdin = "standard input";
      stdout = new Readable();
      stdout.push("standard\n");
      stdout.push("utput\n");
      stdout.push(null);
      stderr = new Readable();
      stderr.push("standard\n");
      stderr.push("utput\n");
      stderr.push(null);
      on = jest.fn();
      once = jest.fn();
      spawn.mockClear();
      spawn.mockReturnValue({
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
        on: on,
        once: once,
      });
    });

    it("spawns sync sia app", () => {
      const dir = "/tmp";
      const sia = new Sia();
      sia.start(dir);
      expect(spawn).toBeCalledWith(sia.cmd, ["--sync-dir", `"${dir}"`, "--output-events"], {
        cwd: sia.wd,
        env: {
          JAVA_HOME: sia.javaHome,
        },
        shell: true,
        windowsHide: true,
      });
    });

    it("adds --reset-db flag when reset is true", () => {
      const dir = "/tmp";
      const sia = new Sia();
      sia.start(dir, true);
      expect(spawn).toBeCalledWith(sia.cmd, ["--sync-dir", `"${dir}"`, "--output-events", "--reset-db"], {
        cwd: sia.wd,
        env: {
          JAVA_HOME: sia.javaHome,
        },
        shell: true,
        windowsHide: true,
      });

    });

    it("adds stdin field which is the spawned process's stdin", () => {
      const sia = new Sia();
      sia.start();
      expect(sia.stdin).toEqual(stdin);
    });

    it("adds stdout field which is a readline interface of spawned process's stdout", () => {
      const sia = new Sia();
      sia.start();
      expect(sia.stdout instanceof readline.Interface).toBeTruthy();
      expect(sia.stdout.input).toEqual(stdout);
    });

    it("adds stderr field which is a realine interface of spawned process's stderr", () => {
      const sia = new Sia();
      sia.start();
      expect(sia.stderr instanceof readline.Interface).toBeTruthy();
      expect(sia.stderr.input).toEqual(stderr);
    });

    it("adds proc field which is the returned value of spawn", () => {
      const sia = new Sia();
      sia.start();
      expect(sia.proc).toEqual({
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
        on: expect.any(Function),
        once: expect.any(Function),
      });
    });

    it("doesn't start a new process if this.proc is not null", () => {
      const sia = new Sia();
      sia.proc = "some-object";
      sia.start();
      expect(spawn).not.toHaveBeenCalled();
    });

  });

  describe("close method", () => {

    beforeEach(() => {
      execSync.mockReset();
    });

    it("sends SIGTERM and waits exit event is emitted", async () => {
      const sia = new Sia();
      sia.proc = {
        kill(signal) {
          expect(signal).toEqual("SIGTERM");
          expect(this.onExit).toBeDefined();
          this.onExit();
          expect(this.onClose).toBeDefined();
          this.onClose();
        },
        once(event, callback) {
          if (event === "exit") {
            this.onExit = callback;
          } else if (event === "close") {
            this.onClose = callback;
          }
        }
      };
      await sia.close();
      expect(sia.proc).toBeNull();
    });

    it("executes taskkill and waits exit event is emitted in Windows", async () => {
      const oldPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", {
          value: "win32"
        });

        const sia = new Sia();
        let onExit, onClose;
        sia.proc = {
          once(event, callback) {
            if (event === "exit") {
              onExit = callback;
            } else if (event === "close") {
              onClose = callback;
            }
          }
        };
        execSync.mockImplementation(() => {
          onExit();
          onClose();
        });

        await sia.close();
        expect(sia.proc).toBeNull();
        expect(execSync).toHaveBeenCalled();

      } finally {
        Object.defineProperty(process, "platform", {
          value: oldPlatform
        });
      }
    });

    it("does nothing if proc is null", async () => {
      const sia = new Sia();
      await sia.close();
    });

  });

  describe("wallet method", () => {

    const address = "0x01234567890";
    const seed = "hello world";
    beforeEach(() => {
      execFile.mockClear();
    });

    it("executes wallet command of sync sia app and returns the result via Promise", async () => {
      execFile.mockImplementation((file, args, opts, callback) => {
        callback(null, yaml.dump({
          "wallet address": address,
          "primary seed": seed
        }));
      });

      const sia = new Sia();
      const res = await sia.wallet();
      expect(res["wallet address"]).toEqual(address);
      expect(res["primary seed"]).toEqual(seed);
      expect(execFile).toHaveBeenCalledWith(sia.cmd, ["wallet"], {
          cwd: sia.wd,
          env: {
            JAVA_HOME: sia.javaHome,
          },
        shell: true,
        timeout: 5 * 60 * 1000,
          windowsHide: true,
        }, expect.any(Function)
      );
    });

    it("returns a rejected promise when execFile returns an error", async () => {
      const msg = "expected error";
      execFile.mockImplementation((file, args, opts, callback) => {
        callback(msg, null);
      });

      const sia = new Sia();
      await expect(sia.wallet()).rejects.toEqual(msg);
    });

    it("returns a rejected promise when the output of wallet command doesn't have enough information", async () => {
      execFile.mockImplementation((file, args, opts, callback) => {
        callback(null, "");
      });

      const sia = new Sia();
      await expect(sia.wallet()).rejects.toBeDefined();
    });

  });

});
