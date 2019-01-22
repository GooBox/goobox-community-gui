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
import {spawn} from "child_process";
import jre from "node-jre";
import path from "path";
import readLine from "readline";
import {PassThrough} from "stream";
import Storj from "../../src/main/storj";

jest.mock("child_process");
jest.useFakeTimers();

describe("Storj class", () => {
  const oldPlatform = process.platform;
  beforeAll(() => {
    Object.defineProperty(process, "platform", {
      value: "darwin",
    });
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: oldPlatform,
    });
  });

  let storj, stdin, stdout, stderr, on;
  beforeEach(() => {
    storj = new Storj();
    setTimeout.mockReset();
    stdin = "standard input";
    stdout = new PassThrough();
    stderr = new PassThrough();
    on = jest.fn();
    spawn.mockClear();
    spawn.mockReturnValue({
      stdin,
      stdout,
      stderr,
      on,
    });
  });

  describe("instance fields", () => {
    it("has cmd which describes the path to the sync storj app", () => {
      const storj = new Storj();
      const cmd = "goobox-sync-storj";
      expect(storj._cmd).toEqual(cmd);
    });

    it("has wd which describes the directory containing the sync storj app", () => {
      expect(storj._wd).toEqual(
        path.normalize(path.join(__dirname, "../../goobox-sync-storj/"))
      );
    });

    it("has javaHome where the home directory of a JRE", () => {
      expect(storj._javaHome).toEqual(path.join(jre.driver(), "../../"));
    });
  });

  describe("start method", () => {
    const dir = "/tmp";

    it("spawns sync-storj", () => {
      storj.start(dir);
      expect(spawn).toBeCalledWith(
        "java",
        [
          `-Dgoobox.resource=${path.resolve(__dirname, "../../resources/mac")}`,
          "-jar",
          "*.jar",
          "--sync-dir",
          `"${dir}"`,
        ],
        {
          cwd: storj._wd,
          env: expect.objectContaining({
            PATH: `${storj._wd}:${storj._javaHome}/bin:${process.env.PATH}`,
          }),
          shell: true,
          windowsHide: true,
        }
      );
    });

    it("spawns sync-storj with --reset-db and --reset-auth-file flags when reset is true", () => {
      storj.start(dir, true);
      expect(spawn).toBeCalledWith(
        "java",
        [
          `-Dgoobox.resource=${path.resolve(__dirname, "../../resources/mac")}`,
          "-jar",
          "*.jar",
          "--sync-dir",
          `"${dir}"`,
          "--reset-db",
          "--reset-auth-file",
        ],
        {
          cwd: storj._wd,
          env: expect.objectContaining({
            PATH: `${storj._wd}:${storj._javaHome}/bin:${process.env.PATH}`,
          }),
          shell: true,
          windowsHide: true,
        }
      );
    });

    it("starts listening stdout and emits syncState events", () => {
      const event = {
        method: "syncState",
        args: {
          newState: "paused",
        },
      };
      storj.start(dir);
      return new Promise((resolve, reject) => {
        storj.on(event.method, ({newState}) => {
          try {
            expect(newState).toEqual(event.args.newState);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        storj.proc.stdout.write(`${JSON.stringify(event)}\n`);
      });
    });

    it("starts listening stdout and emits response events", () => {
      const event = {
        status: "ok",
        message: "successful result",
      };
      storj.start(dir);
      return new Promise((resolve, reject) => {
        storj.on("response", res => {
          try {
            expect(res).toEqual(event);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        storj.proc.stdout.write(`${JSON.stringify(event)}\n`);
      });
    });

    it("adds proc field which is the returned value of spawn", () => {
      storj.start(dir);
      expect(storj.proc).toEqual({
        stdin,
        stdout,
        stderr,
        on: expect.any(Function),
      });
    });

    it("doesn't start a new process if this.proc is not null", () => {
      storj.proc = "some-object";
      storj.start(dir);
      expect(spawn).not.toHaveBeenCalled();
    });

    it("starts listening close events and restarts sync-storj", () => {
      on.mockImplementationOnce((event, callback) => {
        if (event === "close") {
          callback();
        }
      });
      storj.start(dir);
      // The first time is by start method, the second time is to restart.
      expect(spawn).toHaveBeenCalledTimes(1);
      // jest.runOnlyPendingTimers();
      setTimeout.mock.calls[0][0]();
      expect(spawn).toHaveBeenCalledTimes(2);
      expect(spawn).toHaveBeenLastCalledWith(
        "java",
        [
          `-Dgoobox.resource=${path.resolve(__dirname, "../../resources/mac")}`,
          "-jar",
          "*.jar",
          "--sync-dir",
          `"${dir}"`,
        ],
        {
          cwd: storj._wd,
          env: expect.objectContaining({
            PATH: `${storj._wd}:${storj._javaHome}/bin:${process.env.PATH}`,
          }),
          shell: true,
          windowsHide: true,
        }
      );
    });

    // _closing is true. It means this close event is expected and don't need to restart.
    it("starts listening close events and doesn't restart sync-storj if _closing is true", () => {
      on.mockImplementationOnce((event, callback) => {
        if (event === "close") {
          storj.proc._closing = true;
          callback();
        }
      });
      storj.start();
      expect(spawn).toHaveBeenCalledTimes(1);
    });
  });

  describe("_sendRequest method", () => {
    const req = {
      method: "some method",
      args: {
        a: 1,
        b: 2,
      },
    };

    it("sends a given request as a JSON formatted string", async () => {
      const res = {
        status: "ok",
        message: "",
      };
      storj.on = jest.fn().mockImplementation((event, callback) => {
        if (event === "response") {
          callback(res);
        }
      });

      storj.proc = {
        stdin: new PassThrough(),
      };
      const reader = readLine.createInterface({input: storj.proc.stdin});
      reader.on("line", line => expect(JSON.parse(line)).toEqual(req));

      await expect(storj._sendRequest("test", req)).resolves.toEqual(res);
    });

    it("returns a rejected promise when the request fails", async () => {
      const res = {
        status: "error",
        message: "expected error",
      };
      storj.on = jest.fn().mockImplementation((event, callback) => {
        if (event === "response") {
          callback(res);
        }
      });

      storj.proc = {
        stdin: new PassThrough(),
      };
      const reader = readLine.createInterface({input: storj.proc.stdin});
      reader.on("line", line => expect(JSON.parse(line)).toEqual(req));

      await expect(storj._sendRequest("test", req)).rejects.toEqual(
        res.message
      );
    });

    it("returns an error when no process is running", async () => {
      expect(storj.proc).toBeFalsy();
      await expect(storj._sendRequest()).rejects.toEqual(
        "sync storj app is not running"
      );
    });

    it("times out and returns a rejected promise", async () => {
      storj.proc = {
        stdin: {
          write: jest.fn(),
        },
      };
      setTimeout.mockImplementation(cb => cb());
      const name = "test";
      await expect(storj._sendRequest(name)).rejects.toEqual(
        `${name} request timed out`
      );
    });
  });

  describe("close method", () => {
    let proc;
    beforeEach(() => {
      proc = {
        once: jest.fn(),
      };
      storj.proc = proc;
    });

    it("sends quit request via _sendRequest", async () => {
      storj._sendRequest = jest.fn().mockReturnValue(Promise.resolve());
      await expect(storj.close()).resolves.not.toBeDefined();
      expect(storj._sendRequest).toHaveBeenCalledWith("Quit", {
        method: "quit",
      });
    });

    it("sends quit request and also waits a close event emitted", async () => {
      // After callback is registered to close event, it is called soon.
      storj.proc.once.mockImplementation((event, cb) => {
        cb();
      });
      // _sendRequest returns a promise never resolved.
      storj._sendRequest = jest.fn().mockReturnValue(new Promise(() => {}));
      await expect(storj.close()).resolves.not.toBeDefined();
      expect(storj._sendRequest).toHaveBeenCalledWith("Quit", {
        method: "quit",
      });
    });

    it("sets proc._closing true", async () => {
      storj._sendRequest = jest.fn().mockReturnValue(Promise.resolve());
      await expect(storj.close()).resolves.not.toBeDefined();
      expect(proc._closing).toBeTruthy();
    });

    it("sets proc null after the chile process closed", async () => {
      storj._sendRequest = jest.fn().mockReturnValue(Promise.resolve());
      await expect(storj.close()).resolves.not.toBeDefined();
      expect(storj.proc).toBeNull();
    });

    it("does nothing if proc is null", async () => {
      const storj = new Storj();
      await storj.close();
    });
  });

  describe("login method", () => {
    const email = "abc@example.com";
    const password = "password";
    const key = "xxx xxx xxx";

    it("sends a login request", async () => {
      storj._sendRequest = jest.fn().mockReturnValue(Promise.resolve());
      await expect(
        storj.login(email, password, key)
      ).resolves.not.toBeDefined();
      expect(storj._sendRequest).toHaveBeenCalledWith("Login", {
        method: "login",
        args: {
          email,
          password,
          encryptionKey: key,
        },
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
      storj._sendRequest = jest.fn().mockReturnValue(
        Promise.resolve({
          encryptionKey: key,
        })
      );
      await expect(storj.createAccount(email, password)).resolves.toEqual(key);
      expect(storj._sendRequest).toHaveBeenCalledWith("Registration", {
        method: "createAccount",
        args: {
          email,
          password,
        },
      });
    });

    it("returns a rejected promise when no storj process is running", async () => {
      await expect(storj.createAccount(email, password)).rejects.toEqual(
        "sync storj app is not running"
      );
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
      expect(storj._sendRequest).toHaveBeenCalledWith(
        "Validate the encryption key",
        {
          method: "checkMnemonic",
          args: {
            encryptionKey: key,
          },
        }
      );
    });

    it("returns a rejected promise when fails to create an account", async () => {
      const error = "invalid encryption key";
      storj._sendRequest = jest.fn().mockReturnValue(Promise.reject(error));
      await expect(storj.checkMnemonic(key)).rejects.toEqual(error);
    });
  });

  describe("generateMnemonic method", () => {
    const key = "xxx xxx xxx";

    it("sends a generate mnemonic request and returns a mnemonic code", async () => {
      storj._sendRequest = jest.fn().mockReturnValue(
        Promise.resolve({
          status: "ok",
          encryptionKey: key,
        })
      );
      await expect(storj.generateMnemonic()).resolves.toEqual(key);
      expect(storj._sendRequest).toHaveBeenCalledWith(
        "Generate encryption key",
        {
          method: "generateMnemonic",
        }
      );
    });

    it("returns a rejected promise when failing to generate a mnemonic key", async () => {
      const error = "failed to generate a mnemonic key";
      storj._sendRequest = jest.fn().mockReturnValue(Promise.reject(error));
      await expect(storj.generateMnemonic()).rejects.toEqual(error);
    });
  });

  describe("closed property", () => {
    it("returns true if the proc is null", () => {
      expect(storj.closed).toBeTruthy();
    });

    it("returns false if the proc is not null", () => {
      storj.proc = "some process";
      expect(storj.closed).toBeFalsy();
    });
  });

  describe("in Windows", () => {
    const dir = "/tmp";
    const oldPlatform = process.platform;
    beforeAll(() => {
      Object.defineProperty(process, "platform", {
        value: "win32",
      });
    });

    afterAll(() => {
      Object.defineProperty(process, "platform", {
        value: oldPlatform,
      });
    });

    it("has cmd which describes the path to the bat file of sync storj app", () => {
      const storj = new Storj();
      const cmd = "goobox-sync-storj.bat";
      expect(storj._cmd).toEqual(cmd);
    });

    it("spawns sync-storj", () => {
      storj.start(dir);
      expect(spawn).toBeCalledWith(storj._cmd, ["--sync-dir", `"${dir}"`], {
        cwd: storj._wd,
        env: expect.objectContaining({
          JAVA_HOME: storj._javaHome,
          GOOBOX_SYNC_STORJ_OPTS: `-Djava.library.path="${
            storj._wd
          };${path.normalize(path.join(storj._wd, "../../libraries"))}"`,
          PATH: `${path.normalize(path.join(storj._wd, "../../libraries"))};${
            process.env.PATH
          }`,
        }),
        shell: true,
        windowsHide: true,
      });
    });

    it("spawns sync-storj with --reset-db and --reset-auth-file flags when reset is true", () => {
      storj.start(dir, true);
      expect(spawn).toBeCalledWith(
        storj._cmd,
        ["--sync-dir", `"${dir}"`, "--reset-db", "--reset-auth-file"],
        {
          cwd: storj._wd,
          env: expect.objectContaining({
            JAVA_HOME: storj._javaHome,
            GOOBOX_SYNC_STORJ_OPTS: `-Djava.library.path="${
              storj._wd
            };${path.normalize(path.join(storj._wd, "../../libraries"))}"`,
            PATH: `${path.normalize(path.join(storj._wd, "../../libraries"))};${
              process.env.PATH
            }`,
          }),
          shell: true,
          windowsHide: true,
        }
      );
    });
  });
});
