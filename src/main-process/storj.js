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
import {spawn} from "child_process";
import log from "electron-log";
import jre from "node-jre";
import path from "path";
import readline from "readline";

const DefaultTimeout = 60000;

export default class Storj {

  constructor() {
    this.wd = path.normalize(path.join(__dirname, "../../goobox-sync-storj/"));
    this.cmd = path.join(this.wd, "goobox-sync-storj");
    if (process.platform === "win32") {
      this.cmd += ".bat";
    }
    this.javaHome = path.join(jre.driver(), "../../");
    this.stdin = null;
    this.stdout = null;
    this.stderr = null;
    log.debug(`new storj instance: cmd = ${this.cmd}, java-home = ${this.javaHome}`);
  }

  start() {

    if (this.proc) {
      return;
    }

    log.info(`starting sync-storj app in ${this.cmd}`);
    this.proc = spawn(this.cmd, {
      cwd: this.wd,
      env: {
        JAVA_HOME: this.javaHome,
      },
      windowsHide: true,
    });
    this.stdin = this.proc.stdin;
    this.stdout = readline.createInterface({input: this.proc.stdout});
    this.stderr = readline.createInterface({input: this.proc.stderr});
    this.stderr.on("line", log.verbose);

  }

  async login(email, password, encryptionKey) {

    if (!this.proc) {
      throw "sync storj app is not running";
    }

    return Promise.race([
      new Promise(resolve => {
        this.stdout.once("line", line => resolve(JSON.parse(line)));
        this.stdin.write(JSON.stringify({
          method: "login",
          args: {
            email: email,
            password: password,
            encryptionKey: encryptionKey,
          }
        }));
      }),
      new Promise((_, reject) => setTimeout(reject.bind(null, "time out"), DefaultTimeout))
    ]).then(res => {
      if ("ok" !== res.status) {
        return Promise.reject(res.message);
      }
    });

  }

  async createAccount(email, password) {

    if (!this.proc) {
      throw "sync storj app is not running";
    }

    return Promise.race([
      new Promise(resolve => {
        this.stdout.once("line", line => resolve(JSON.parse(line)));
        this.stdin.write(JSON.stringify({
          method: "createAccount",
          args: {
            email: email,
            password: password,
          }
        }));
      }),
      new Promise((_, reject) => setTimeout(reject.bind(null, "time out"), DefaultTimeout))
    ]).then(res => {
      if ("ok" !== res.status) {
        return Promise.reject(res.message);
      }
      return res.encryptionKey;
    });

  }

  async close() {

    if (!this.proc) {
      return;
    }

    log.info("closing the sync-storj app");
    return new Promise(resolve => {

      this.proc.on("exit", () => {
        log.info("the sync-storj app is closed");
        this.proc = null;
        resolve();
      });

      this.proc.kill("SIGTERM");

    });

  }

}