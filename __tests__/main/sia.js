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

import {execSync, spawn} from "child_process";
import yaml from "js-yaml";
import jre from "node-jre";
import path from "path";
import {PassThrough, Readable} from "stream";
import Sia from "../../src/main/sia";

describe("Sia class", () => {

  beforeAll(() => {
    jre.driver.mockReturnValue("/tmp/jre/bin/java");
  });

  let sia;
  beforeEach(() => {
    sia = new Sia();
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
        expect(sia._cmd).toEqual(cmd);

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
        expect(sia._cmd).toEqual(cmd);

      } finally {
        Object.defineProperty(process, "platform", {
          value: oldPlatform
        });
      }
    });

    it("has wd which describes the directory containing the sync sia app", () => {
      expect(sia._wd).toEqual(path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin")));
    });

    it("has javaHome where the home directory of a JRE", () => {
      expect(sia._javaHome).toEqual(path.join(jre.driver(), "../../"));
    });

  });

  describe("start method", () => {

    const dir = "/tmp";
    let stdin, stdout, stderr, on;
    beforeEach(() => {
      stdin = "standard input";
      stdout = new PassThrough();
      stderr = new PassThrough();
      on = jest.fn();
      spawn.mockClear();
      spawn.mockReturnValue({
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
        on: on,
      });
    });

    it("spawns sync-sia", () => {
      sia.start(dir);
      expect(spawn).toBeCalledWith(sia._cmd, ["--sync-dir", `"${dir}"`, "--output-events"], {
        cwd: sia._wd,
        env: {
          JAVA_HOME: sia._javaHome,
        },
        shell: true,
        windowsHide: true,
      });
    });

    it("spawns sync-sia with --reset-db flag when reset is true", () => {
      sia.start(dir, true);
      expect(spawn).toBeCalledWith(sia._cmd, ["--sync-dir", `"${dir}"`, "--output-events", "--reset-db"], {
        cwd: sia._wd,
        env: {
          JAVA_HOME: sia._javaHome,
        },
        shell: true,
        windowsHide: true,
      });
    });

    it("starts listening stdout and emits new events", () => {
      const event = {
        method: "syncState",
        args: {
          newState: "paused",
        }
      };
      sia.start(dir);
      return new Promise((resolve, reject) => {
        sia.on(event.method, ({newState}) => {
          try {
            expect(newState).toEqual(event.args.newState);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        sia.proc.stdout.write(`${JSON.stringify(event)}\n`);
      });
    });

    it("adds proc field which is the returned value of spawn", () => {
      expect(sia.proc).not.toBeDefined();
      sia.start(dir);
      expect(sia.proc).toEqual({
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
        on: expect.any(Function),
      });
    });

    it("doesn't start a new process if this.proc is not null", () => {
      sia.proc = "some-object";
      sia.start(dir);
      expect(spawn).not.toHaveBeenCalled();
    });

    it("starts listening close events and restarts sync-storj", () => {
      on.mockImplementationOnce((event, callback) => {
        if (event === "close") {
          callback();
        }
      });
      sia.start(dir);
      expect(spawn).toHaveBeenCalledTimes(2);
      expect(spawn).toHaveBeenLastCalledWith(sia._cmd, ["--sync-dir", `"${dir}"`, "--output-events"], {
        cwd: sia._wd,
        env: {
          JAVA_HOME: sia._javaHome,
        },
        shell: true,
        windowsHide: true,
      });
    });

    // _closing is true. It means this close event is expected and don't need to restart.
    it("starts listening close events and doesn't restart sync-storj if _closing is true", () => {
      on.mockImplementationOnce((event, callback) => {
        if (event === "close") {
          sia.proc._closing = true;
          callback();
        }
      });
      sia.start(dir);
      expect(spawn).toHaveBeenCalledTimes(1);
    });

  });

  describe("close method", () => {

    beforeEach(() => {
      execSync.mockReset();
    });

    it("sends SIGTERM and waits exit event is emitted", async () => {
      const oldPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", {
          value: "darwin"
        });

        let onExit, onClose;
        const proc = {
          kill(signal) {
            expect(signal).toEqual("SIGTERM");
            expect(onExit).toBeDefined();
            onExit();
            expect(onClose).toBeDefined();
            onClose();
          },
          once(event, callback) {
            if (event === "exit") {
              onExit = callback;
            } else if (event === "close") {
              onClose = callback;
            }
          }
        };
        sia.proc = proc;
        await sia.close();
        expect(sia.proc).toBeNull();
        expect(proc._closing).toBeTruthy();

      } finally {
        Object.defineProperty(process, "platform", {
          value: oldPlatform
        });
      }
    });

    // noinspection SpellCheckingInspection
    it("executes taskkill and waits exit event is emitted in Windows", async () => {
      const oldPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", {
          value: "win32"
        });

        let onExit, onClose;
        const proc = {
          once(event, callback) {
            if (event === "exit") {
              onExit = callback;
            } else if (event === "close") {
              onClose = callback;
            }
          },
          pid: 12345,
        };
        sia.proc = proc;
        execSync.mockImplementation(() => {
          onExit();
          onClose();
        });

        await sia.close();
        expect(sia.proc).toBeNull();
        expect(execSync).toHaveBeenCalledWith(`taskkill /pid ${proc.pid} /T /F`);
        expect(proc._closing).toBeTruthy();

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
    let stdout, stderr, on;
    beforeEach(() => {
      stdout = new Readable();
      stdout.push(yaml.dump({
        "wallet address": address,
        "primary seed": seed
      }));
      stdout.push(null);
      stderr = new Readable();
      stderr.push(null);
      on = jest.fn();
      spawn.mockReset();
      spawn.mockReturnValue({
        stdout: stdout,
        stderr: stderr,
        on: on,
      });
    });

    it("spawns the wallet command and returns a promise with the result", async () => {
      const sia = new Sia();
      await expect(sia.wallet()).resolves.toEqual({
        "wallet address": address,
        "primary seed": seed,
      });
      expect(spawn).toHaveBeenCalledWith(sia._cmd, ["wallet"], {
        cwd: sia._wd,
        env: {
          JAVA_HOME: sia._javaHome,
        },
        shell: true,
        timeout: 5 * 60 * 1000,
        windowsHide: true,
      });
    });

    it("returns a rejected promise when an error event is emitted", async () => {
      const msg = "expected error";
      on.mockImplementation((event, callback) => {
        if (event === "error") {
          callback(msg);
        }
      });
      const sia = new Sia();
      await expect(sia.wallet()).rejects.toEqual(msg);
    });

    it("returns a rejected promise when the output of wallet command doesn't have enough information", async () => {
      stdout = new Readable();
      stdout.push(yaml.dump({
        "wrong wallet address": address,
        "wrong primary seed": seed
      }));
      stdout.push(null);
      spawn.mockReturnValue({
        stdout: stdout,
        stderr: stderr,
        on: on,
      });
      const sia = new Sia();
      await expect(sia.wallet()).rejects.toEqual(expect.any(String));
    });

    // TODO: sync sia app returns an error if initializing wallets twice.

  });

});
