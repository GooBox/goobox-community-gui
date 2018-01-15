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
jest.useFakeTimers();
jest.setTimeout(5 * 60000);

import {execSync, spawn} from "child_process";
import jre from "node-jre";
import path from "path";
import readline from "readline";
import {PassThrough, Readable} from "stream";
import Storj from "../../src/main/storj";


describe("Storj class", () => {

  let storj;
  beforeEach(() => {
    storj = new Storj();
    setTimeout.mockReset();
  });

  describe("instance fields", () => {

    it("has cmd which describes the path to the sync storj app", () => {
      const oldPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", {
          value: "darwin"
        });

        const storj = new Storj();
        const cmd = "goobox-sync-storj";
        expect(storj.cmd).toEqual(cmd);

      } finally {
        Object.defineProperty(process, "platform", {
          value: oldPlatform
        });
      }
    });

    it("has cmd which describes the path to the bat file of sync storj app in Windows", () => {
      const oldPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", {
          value: "win32"
        });

        const storj = new Storj();
        const cmd = "goobox-sync-storj.bat";
        expect(storj.cmd).toEqual(cmd);

      } finally {
        Object.defineProperty(process, "platform", {
          value: oldPlatform
        });
      }
    });


    it("has wd which describes the directory containing the sync storj app", () => {
      expect(storj.wd).toEqual(path.normalize(path.join(__dirname, "../../goobox-sync-storj/")));
    });

    it("has javaHome where the home directory of a JRE", () => {
      expect(storj.javaHome).toEqual(path.join(jre.driver(), "../../"));
    });

  });

  describe("start method", () => {

    const dir = "/tmp";
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

    it("spawns sync storj app", () => {
      storj.start(dir);
      expect(spawn).toBeCalledWith(storj.cmd, ["--sync-dir", `"${dir}"`], {
        cwd: storj.wd,
        env: {
          JAVA_HOME: storj.javaHome,
        },
        shell: true,
        windowsHide: true,
      });
    });

    it("adds --reset-db and --reset-auth-file flags when reset is true", () => {
      storj.start(dir, true);
      expect(spawn).toBeCalledWith(storj.cmd, ["--sync-dir", `"${dir}"`, "--reset-db", "--reset-auth-file"], {
        cwd: storj.wd,
        env: {
          JAVA_HOME: storj.javaHome,
        },
        shell: true,
        windowsHide: true,
      });
    });

    it("adds stdin field which is the spawned process's stdin", () => {
      storj.start();
      expect(storj.stdin).toEqual(stdin);
    });

    it("adds stdout field which is a readline interface of spawned process's stdout", () => {
      storj.start();
      expect(storj.stdout instanceof readline.Interface).toBeTruthy();
      expect(storj.stdout.input).toEqual(stdout);
    });

    it("adds stderr field which is a realine interface of spawned process's stderr", () => {
      storj.start();
      expect(storj.stderr instanceof readline.Interface).toBeTruthy();
      expect(storj.stderr.input).toEqual(stderr);
    });

    it("adds proc field which is the returned value of spawn", () => {
      storj.start();
      expect(storj.proc).toEqual({
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
        on: expect.any(Function),
        once: expect.any(Function),
      });
    });

    it("doesn't start a new process if this.proc is not null", () => {
      storj.proc = "some-object";
      storj.start();
      expect(spawn).not.toHaveBeenCalled();
    });

  });

  describe("close method", () => {

    it("sends SIGTERM and waits exit event is emitted", async () => {
      storj.proc = {
        kill(signal) {
          expect(signal).toEqual("SIGTERM");
          expect(this.onExit).toBeDefined();
          this.onExit();
          expect(this.onClose).toBeDefined();
          this.onClose();
        },
        once(event, callback) {
          switch (event) {
            case "exit":
              this.onExit = callback;
              break;
            case "close":
              this.onClose = callback;
              break;
          }
        }
      };
      await storj.close();
      expect(storj.proc).toBeNull();
    });

    it("executes taskkill and waits exit event is emitted in Windows", async () => {
      const oldPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", {
          value: "win32"
        });

        const storj = new Storj();
        let onExit, onClose;
        storj.proc = {
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

        await storj.close();
        expect(storj.proc).toBeNull();
        expect(execSync).toHaveBeenCalled();

      } finally {
        Object.defineProperty(process, "platform", {
          value: oldPlatform
        });
      }
    });

    it("does nothing if proc is null", async () => {
      const storj = new Storj();
      await storj.close();
    });

  });

  describe("_sendRequest method", () => {

    it("sends a given request as a JSON formatted string", async () => {
      const res = {
        status: "ok",
        message: "",
      };

      const stdout = new Readable();
      stdout.push(JSON.stringify(res));
      stdout.push("\n");
      stdout.push(null);

      storj.stdin = new PassThrough();
      storj.stdout = readline.createInterface({input: stdout});
      storj.proc = {
        stdin: storj.stdin,
        stdout: storj.stdout
      };

      const req = {
        method: "some method",
        args: {
          a: 1,
          b: 2,
        }
      };
      const reader = readline.createInterface({input: storj.stdin});
      reader.on("line", line => expect(JSON.parse(line)).toEqual(req));
      await expect(storj._sendRequest("test", req)).resolves.toEqual(res);
    });

    it("returns a rejected promise when the request fails", async () => {
      const error = "failed";
      const stdout = new Readable();
      stdout.push(JSON.stringify({
        status: "error",
        message: error,
      }));
      stdout.push("\n");
      stdout.push(null);

      storj.stdin = {
        write: jest.fn()
      };
      storj.stdout = readline.createInterface({input: stdout});
      storj.proc = {
        stdin: storj.stdin,
        stdout: storj.stdout
      };

      await expect(storj._sendRequest("test", null)).rejects.toEqual(error);
    });

    it("returns an error when no process is running", async () => {
      await expect(storj._sendRequest()).rejects.toEqual("sync storj app is not running");
    });

    it("times out and returns a rejected promise", async () => {
      storj.stdin = {
        write: jest.fn()
      };
      storj.stdout = {
        once: jest.fn()
      };
      storj.proc = {
        stdin: storj.stdin,
        stdout: storj.stdout
      };

      setTimeout.mockImplementation(cb => cb());
      const name = "test";
      await expect(storj._sendRequest(name)).rejects.toEqual(`${name} request timed out`);
    });

  });

  describe("login method", () => {

    const email = "abc@example.com";
    const password = "password";
    const key = "xxx xxx xxx";

    it("sends a login request", async () => {
      storj._sendRequest = jest.fn().mockReturnValue(Promise.resolve());
      await expect(storj.login(email, password, key)).resolves.not.toBeDefined();
      expect(storj._sendRequest).toHaveBeenCalledWith("Login", {
        method: "login",
        args: {
          email: email,
          password: password,
          encryptionKey: key,
        }
      });
    });

    it("returns a rejected promise when failed to log in", async () => {
      const error = "failed to log in";
      storj._sendRequest = jest.fn().mockReturnValue(Promise.reject(error));
      await expect(storj.login(email, password, key)).rejects.toEqual(error);
    });

  });

  describe("createAccount method", () => {

    const email = "abc@example.com";
    const password = "password";
    const key = "xxx xxx xxx";

    it("sends a create account request and receives an encryption key", async () => {
      storj._sendRequest = jest.fn().mockReturnValue(Promise.resolve({
        encryptionKey: key,
      }));
      await expect(storj.createAccount(email, password)).resolves.toEqual(key);
      expect(storj._sendRequest).toHaveBeenCalledWith("Registration", {
        method: "createAccount",
        args: {
          email: email,
          password: password,
        }
      });
    });

    it("returns a rejected promise when no storj process is running", async () => {
      await expect(storj.createAccount(email, password)).rejects.toEqual("sync storj app is not running");
    });

    it("returns a rejected promise when fails to create an account", async () => {
      const error = "failed to create an account";
      storj._sendRequest = jest.fn().mockReturnValue(Promise.reject(error));
      await expect(storj.createAccount(email, password)).rejects.toEqual(error);
    });

  });

  describe("checkMnemonic method", () => {

    const key = "xxx xxx xxx";

    it("sends a check mnemonic request", async () => {
      storj._sendRequest = jest.fn().mockReturnValue(Promise.resolve());
      await expect(storj.checkMnemonic(key)).resolves.not.toBeDefined();
      expect(storj._sendRequest).toHaveBeenCalledWith("Validate the encryption key", {
        method: "checkMnemonic",
        args: {
          encryptionKey: key,
        }
      });
    });

    it("returns a rejected promise when fails to create an account", async () => {
      const error = "invalid encryption key";
      storj._sendRequest = jest.fn().mockReturnValue(Promise.reject(error));
      await expect(storj.checkMnemonic(key)).rejects.toEqual(error);
    });

  });

});
