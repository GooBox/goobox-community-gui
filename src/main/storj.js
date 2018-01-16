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
import log from "electron-log";
import jre from "node-jre";
import path from "path";
import readline from "readline";

const DefaultTimeout = 60000;

export default class Storj {

  constructor() {
    this.wd = path.normalize(path.join(__dirname, "../../goobox-sync-storj/"));
    this.cmd = "goobox-sync-storj";
    if (process.platform === "win32") {
      this.cmd += ".bat";
    }
    this.javaHome = path.join(jre.driver(), "../../");
    this.stdin = null;
    this.stdout = null;
    this.stderr = null;
    log.debug(`new storj instance: cmd = ${this.cmd}, wd = ${this.wd}, java-home = ${this.javaHome}`);
  }

  start(dir, reset) {

    if (this.proc) {
      return;
    }

    const args = ["--sync-dir", `"${dir}"`];
    if (reset) {
      args.push("--reset-db");
      args.push("--reset-auth-file");
    }

    log.info(`starting ${this.cmd} in ${this.wd}`);
    this.proc = spawn(this.cmd, args, {
      cwd: this.wd,
      env: {
        JAVA_HOME: this.javaHome,
        PATH: `${this.javaHome}/bin/`
      },
      shell: true,
      windowsHide: true,
    });

    this.stdin = this.proc.stdin;
    this.stdout = readline.createInterface({input: this.proc.stdout});
    this.stderr = readline.createInterface({input: this.proc.stderr});
    this.stderr.on("line", log.verbose);

    this.proc.on("close", (code, signal) => {
      if (this.proc) {
        log.debug(`storj closed: code = ${code}, signal = ${signal}, proc = ${JSON.stringify(this.proc, null, " ")}`);
        this.proc = null;
      }
    });

  }

  /**
   * Send a given request to the Storj instance.
   *
   * @param name of this request, used in error massages,
   * @param request object to be sent
   * @returns {Promise<any>}
   */
  async _sendRequest(name, request) {

    if (!this.proc) {
      throw "sync storj app is not running";
    }

    return Promise.race([
      new Promise(resolve => {

        this.stdout.once("line", resolve);
        const req = `${JSON.stringify(request)}\n`;
        log.debug(`sending a request to sync storj: ${req}`);
        this.stdin.write(req);

      }),
      new Promise((_, reject) => setTimeout(reject.bind(null, `${name} request timed out`), DefaultTimeout))
    ]).then(line => {
      try {
        return JSON.parse(line);
      } catch (err) {
        return Promise.reject(`Cannot parse ${line}: ${err}`);
      }
    }).then(res => {
      if ("ok" !== res.status) {
        return Promise.reject(res.message);
      }
      return res;
    });

  }

  async login(email, password, encryptionKey) {

    await this._sendRequest("Login", {
      method: "login",
      args: {
        email: email,
        password: password,
        encryptionKey: encryptionKey,
      }
    });

  }

  async createAccount(email, password) {

    const res = await this._sendRequest("Registration", {
      method: "createAccount",
      args: {
        email: email,
        password: password,
      }
    });
    return res.encryptionKey;

  }

  async checkMnemonic(encryptionKey) {

    await this._sendRequest("Validate the encryption key", {
      method: "checkMnemonic",
      args: {
        encryptionKey: encryptionKey,
      }
    });

  }

  async close() {

    if (!this.proc) {
      return;
    }

    log.info("closing the sync-storj app");
    return Promise.race([
      this._sendRequest("Quit", {
        method: "quit",
      }),
      new Promise(resolve => {
        this.proc.once("close", () => {
          log.info("streams of sync-storj are closed");
          resolve();
        });
      })
    ]);

  }

}
