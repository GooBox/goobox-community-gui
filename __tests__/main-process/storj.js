/*
 * Copyright (C) 2017 Junpei Kawamoto
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

import {spawn} from "child_process";
import jre from "node-jre";
import path from "path";
import readline from "readline";
import {Readable} from "stream";
import Sia from "../../src/main-process/sia";
import Storj from "../../src/main-process/storj";


describe("Storj class", () => {

  describe("instance fields", () => {

    it("has cmd which describes the path to the sync storj app", () => {
      const storj = new Storj();
      let cmd = path.normalize(path.join(__dirname, "../../goobox-sync-storj/goobox-sync-storj"));
      if (process.platform === "win32") {
        cmd += ".bat";
      }
      expect(storj.cmd).toEqual(cmd);
    });

    it("has wd which describes the directory containing the sync storj app", () => {
      const storj = new Storj();
      expect(storj.wd).toEqual(path.normalize(path.join(__dirname, "../../goobox-sync-storj/")));
    });

    it("has javaHome where the home directory of a JRE", () => {
      const storj = new Storj();
      expect(storj.javaHome).toEqual(path.join(jre.driver(), "../../"));
    });

  });

  describe("start method", () => {

    let stdin, stdout, stderr;
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
      spawn.mockClear();
      spawn.mockReturnValue({
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
      });
    });

    it("spawns sync sia app", () => {
      const storj = new Storj();
      storj.start();
      expect(spawn).toBeCalledWith(storj.cmd, {
        cwd: storj.wd,
        env: {
          JAVA_HOME: storj.javaHome,
        },
        windowsHide: true,
      });
    });

    it("adds stdin field which is the spawned process's stdin", () => {
      const storj = new Storj();
      storj.start();
      expect(storj.stdin).toEqual(stdin);
    });

    it("adds stdout field which is a readline interface of spawned process's stdout", () => {
      const storj = new Storj();
      storj.start();
      expect(storj.stdout instanceof readline.Interface).toBeTruthy();
      expect(storj.stdout.input).toEqual(stdout);
    });

    it("adds stderr field which is a realine interface of spawned process's stderr", () => {
      const storj = new Storj();
      storj.start();
      expect(storj.stderr instanceof readline.Interface).toBeTruthy();
      expect(storj.stderr.input).toEqual(stderr);
    });

    it("adds proc field which is the returned value of spawn", () => {
      const storj = new Storj();
      storj.start();
      expect(storj.proc).toEqual({
        stdin: stdin,
        stdout: stdout,
        stderr: stderr,
      });
    });

    it("doesn't start a new process if this.proc is not null", () => {
      const storj = new Sia();
      storj.proc = "some-object";
      storj.start();
      expect(spawn).not.toHaveBeenCalled();
    });

  });

  describe("close method", () => {

    it("sends SIGTERM and waits exit event is emitted", async () => {
      const storj = new Storj();
      storj.proc = {
        kill(signal) {
          expect(signal).toEqual("SIGTERM");
          this.callback();
        },
        on(event, callback) {
          expect(event).toEqual("exit");
          this.callback = callback;
        }
      };
      await storj.close();
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

    it("requests logging in", async () => {
      const storj = new Storj();
      const stdout = new Readable();
      stdout.push(JSON.stringify({
        status: "ok",
        message: "",
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

      await expect(storj.login(email, password, key)).resolves.not.toBeDefined();
      expect(storj.stdin.write).toHaveBeenCalledWith(JSON.stringify({
        method: "login",
        args: {
          email: email,
          password: password,
          encryptionKey: key,
        }
      }));
    });

    it("returns an error when no process is running", async () => {
      const storj = new Storj();
      await expect(storj.login(email, password, key)).rejects.toEqual("sync storj app is not running");
    });

    it("returns a rejected promise when failed to log in", async () => {
      const error = "failed to log in";
      const storj = new Storj();
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

      await expect(storj.login(email, password, key)).rejects.toEqual(error);
    });

    it("returns a rejected promise when no response is returned", async () => {
      const storj = new Storj();
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

      setTimeout.mockImplementationOnce(cb => cb());
      await expect(storj.login(email, password, key)).rejects.toEqual("time out");
    });

  });

  describe("createAccount method", () => {

    const email = "abc@example.com";
    const password = "password";
    const key = "xxx xxx xxx";

    it("sends a create account request and receives an encryption key", async () => {
      const storj = new Storj();
      const stdout = new Readable();
      stdout.push(JSON.stringify({
        status: "ok",
        message: "",
        encryptionKey: key,
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

      await expect(storj.createAccount(email, password)).resolves.toEqual(key);
      expect(storj.stdin.write).toHaveBeenCalledWith(JSON.stringify({
        method: "createAccount",
        args: {
          email: email,
          password: password,
        }
      }));
    });

    it("returns a rejected promise when no storj process is running", async () => {
      const storj = new Storj();
      await expect(storj.createAccount(email, password)).rejects.toEqual("sync storj app is not running");
    });

    it("returns a rejected promise when fails to create an account", async () => {
      const error = "failed to log in";
      const storj = new Storj();
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
      await expect(storj.createAccount(email, password)).rejects.toEqual(error);
    });

    it("returns a rejected promise when the request is time out", async () => {
      const storj = new Storj();
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

      setTimeout.mockImplementationOnce(cb => cb());
      await expect(storj.createAccount(email, password)).rejects.toEqual("time out");
    });

  });

});