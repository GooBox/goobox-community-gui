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
import {execSync, spawn} from "child_process";
import yaml from "js-yaml";
import jre from "node-jre";
import path from "path";
import {PassThrough, Readable} from "stream";
import {Idle, Synchronizing} from "../../src/constants";
import Sia from "../../src/main/sia";

jest.mock("child_process");
jest.useFakeTimers();

describe("Sia class", () => {

  const syncFolder = "/tmp";
  const oldPlatform = process.platform;
  beforeAll(() => {
    Object.defineProperty(process, "platform", {
      value: "darwin"
    });
    jre.driver.mockReturnValue("/tmp/jre/bin/java");
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: oldPlatform
    });
  });

  let sia, stdin, stdout, stderr, on;
  beforeEach(() => {
    sia = new Sia();
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

  describe("instance fields", () => {

    it("has cmd which describes the path to the sync sia app", () => {
      const sia = new Sia();
      const cmd = "goobox-sync-sia";
      expect(sia._cmd).toEqual(cmd);
    });

    it("has wd which describes the directory containing the sync sia app", () => {
      expect(sia._wd).toEqual(path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin")));
    });

    it("has javaHome where the home directory of a JRE", () => {
      expect(sia._javaHome).toEqual(path.join(jre.driver(), "../../"));
    });

  });

  describe("start method", () => {

    it("spawns sync-sia", () => {
      sia.start(syncFolder);
      expect(spawn).toBeCalledWith(sia._cmd, ["--sync-dir", `"${syncFolder}"`, "--output-events"], {
        cwd: sia._wd,
        env: expect.objectContaining({
          JAVA_HOME: sia._javaHome,
          GOOBOX_SYNC_SIA_OPTS: `-Dgoobox.resource=${path.resolve(__dirname, "../../resources/mac")}`,
          PATH: `${sia._wd}:${process.env.PATH}`,
        }),
        shell: true,
        windowsHide: true,
      });
    });

    it("spawns sync-sia with --reset-db flag when reset is true", () => {
      sia.start(syncFolder, true);
      expect(spawn).toBeCalledWith(sia._cmd, ["--sync-dir", `"${syncFolder}"`, "--output-events", "--reset-db"], {
        cwd: sia._wd,
        env: expect.objectContaining({
          JAVA_HOME: sia._javaHome,
          GOOBOX_SYNC_SIA_OPTS: `-Dgoobox.resource=${path.resolve(__dirname, "../../resources/mac")}`,
          PATH: `${sia._wd}:${process.env.PATH}`,
        }),
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
      sia.start(syncFolder);
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
      sia.start(syncFolder);
      expect(sia.proc).toEqual({
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
        on: expect.any(Function),
      });
    });

    it("doesn't start a new process if this.proc is not null", () => {
      sia.proc = "some-object";
      sia.start(syncFolder);
      expect(spawn).not.toHaveBeenCalled();
    });

    it("starts listening close events and restarts sync-storj", () => {
      on.mockImplementationOnce((event, callback) => {
        if (event === "close") {
          callback();
        }
      });
      sia.start(syncFolder);
      jest.runOnlyPendingTimers();
      expect(spawn).toHaveBeenCalledTimes(2);
      expect(spawn).toHaveBeenLastCalledWith(sia._cmd, ["--sync-dir", `"${syncFolder}"`, "--output-events"], {
        cwd: sia._wd,
        env: expect.objectContaining({
          JAVA_HOME: sia._javaHome,
          GOOBOX_SYNC_SIA_OPTS: `-Dgoobox.resource=${path.resolve(__dirname, "../../resources/mac")}`,
          PATH: `${sia._wd}:${process.env.PATH}`,
        }),
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
      sia.start(syncFolder);
      expect(spawn).toHaveBeenCalledTimes(1);
    });

    it("starts listening syncState event and updates state property", () => {
      sia.start(syncFolder);
      sia.emit("syncState", {newState: Synchronizing});
      expect(sia.syncState).toEqual(Synchronizing);

      sia.emit("syncState", {newState: Idle});
      expect(sia.syncState).toEqual(Idle);
    });

  });

  describe("close method", () => {

    beforeEach(() => {
      sia.closeProc = jest.fn().mockReturnValue(Promise.resolve());
    });

    it("calls closeProc with proc and walletProc", async () => {
      await sia.close();
      expect(sia.closeProc).toHaveBeenCalledWith("proc");
      expect(sia.closeProc).toHaveBeenCalledWith("walletProc");
    });

  });

  describe("closeProc method", () => {

    beforeEach(() => {
      execSync.mockReset();
    });

    it("sends SIGTERM and waits exit event is emitted", async () => {
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
      await sia.closeProc("proc");
      expect(sia.proc).toBeNull();
      expect(proc._closing).toBeTruthy();
    });

    it("does nothing if proc is null", async () => {
      const sia = new Sia();
      await sia.closeProc("proc");
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
      await expect(sia.wallet()).rejects.toEqual(expect.any(String));
    });

    it("adds process object for the wallet command as walletProc attribute, and deletes it after the command ends", async () => {
      stdout = new Readable();
      spawn.mockReturnValue({
        stdout: stdout,
        stderr: stderr,
        on: on,
      });
      expect(sia.walletProc).not.toBeDefined();

      const promise = sia.wallet();
      expect(sia.walletProc).toBeDefined();

      stdout.push(yaml.dump({
        "wallet address": address,
        "primary seed": seed
      }));
      stdout.push(null);
      await promise;

      expect(sia.walletProc).toBeNull();
    });

  });

  describe("closed property", () => {

    it("returns true if the proc is null", () => {
      expect(sia.closed).toBeTruthy();
    });

    it("returns false if the proc is not null", () => {
      sia.proc = "some process";
      expect(sia.closed).toBeFalsy();
    });

  });

  describe("in Windows", () => {

    let oldPlatform;
    beforeAll(() => {
      oldPlatform = process.platform;
      Object.defineProperty(process, "platform", {
        value: "win32"
      });
    });

    afterAll(() => {
      Object.defineProperty(process, "platform", {
        value: oldPlatform
      });
    });

    it("has cmd which describes the path to the bat file of sync sia app", () => {
      const sia = new Sia();
      const cmd = "goobox-sync-sia.bat";
      expect(sia._cmd).toEqual(cmd);
    });

    // noinspection SpellCheckingInspection
    it("executes taskkill and waits exit event is emitted to close", async () => {
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

      await sia.closeProc("proc");
      expect(sia.proc).toBeNull();
      expect(execSync).toHaveBeenCalledWith(`taskkill /pid ${proc.pid} /T /F`);
      expect(proc._closing).toBeTruthy();
    });

    it("spawns sync-sia", () => {
      sia.start(syncFolder);
      expect(spawn).toBeCalledWith(sia._cmd, ["--sync-dir", `"${syncFolder}"`, "--output-events"], {
        cwd: sia._wd,
        env: expect.objectContaining({
          JAVA_HOME: sia._javaHome,
          GOOBOX_SYNC_SIA_OPTS: `-Djava.library.path="${path.normalize(path.join(sia._wd, "../../../libraries"))}"`,
          PATH: `${path.normalize(path.join(sia._wd, "../../../libraries"))};${process.env.PATH}`,
        }),
        shell: true,
        windowsHide: true,
      });
    });

    it("spawns sync-sia with --reset-db flag when reset is true", () => {
      sia.start(syncFolder, true);
      expect(spawn).toBeCalledWith(sia._cmd, ["--sync-dir", `"${syncFolder}"`, "--output-events", "--reset-db"], {
        cwd: sia._wd,
        env: expect.objectContaining({
          JAVA_HOME: sia._javaHome,
          GOOBOX_SYNC_SIA_OPTS: `-Djava.library.path="${path.normalize(path.join(sia._wd, "../../../libraries"))}"`,
          PATH: `${path.normalize(path.join(sia._wd, "../../../libraries"))};${process.env.PATH}`,
        }),
        shell: true,
        windowsHide: true,
      });
    });

  });

});
