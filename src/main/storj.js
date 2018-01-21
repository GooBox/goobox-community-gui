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
import EventEmitter from "events";
import jre from "node-jre";
import path from "path";
import readLine from "readline";

const DefaultTimeout = 60000;

export default class Storj extends EventEmitter {

  constructor() {
    super();
    this._wd = path.normalize(path.join(__dirname, "../../goobox-sync-storj/"));
    this._cmd = "goobox-sync-storj";
    if (process.platform === "win32") {
      this._cmd += ".bat";
    }
    this._javaHome = path.join(jre.driver(), "../../");
    log.debug(`new storj instance: cmd = ${this._cmd}, wd = ${this._wd}, java-home = ${this._javaHome}`);
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

    log.info(`starting ${this._cmd} in ${this._wd} with ${args}`);
    this.proc = spawn(this._cmd, args, {
      cwd: this._wd,
      env: {
        JAVA_HOME: this._javaHome,
      },
      shell: true,
      windowsHide: true,
    });

    readLine.createInterface({input: this.proc.stdout}).on("line", line => {
      try {
        const e = JSON.parse(line);
        if (e.method) {
          log.debug(`received a storj event: ${e.method}`);
          this.emit(e.method, e.args);
        } else {
          log.debug(`received a response from sync-storj`);
          this.emit("response", e);
        }
      } catch (err) {
        log.error(`could not handle a message from sync-storj: ${line}`);
      }
    });

    readLine.createInterface({input: this.proc.stderr}).on("line", log.verbose);

    this.proc.on("close", (code, signal) => {
      log.debug(`storj closed: code = ${code}, signal = ${signal}`);
      if (this.proc && !this.proc._closing) {
        this.proc = null;
        this.start(dir);
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
        this.once("response", resolve);
        const req = JSON.stringify(request);
        log.debug(`sending a request to sync storj: ${req}`);
        this.proc.stdin.write(`${req}\n`);
      }),
      new Promise((_, reject) => setTimeout(reject.bind(null, `${name} request timed out`), DefaultTimeout))
    ]).then(res => {
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
    this.proc._closing = true;
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
    ]).then(() => {
      this.proc = null;
    });

  }

}
