/*
 * Copyright (C) 2017-2019 Junpei Kawamoto
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

import {execSync, spawn} from "child_process";
import log from "electron-log";
import EventEmitter from "events";
import yaml from "js-yaml";
import jre from "node-jre";
import path from "path";
import readLine from "readline";
import toString from "stream-to-string";
import util from "util";
import {Synchronizing} from "../constants";

export default class Sia extends EventEmitter {
  constructor() {
    super();
    this._wd = path.normalize(
      path.join(__dirname, "../../goobox-sync-sia/bin")
    );
    this._cmd = "goobox-sync-sia";
    if (process.platform === "win32") {
      this._cmd += ".bat";
    } else if (process.platform !== "darwin") {
      this._cmd = `./${this._cmd}`;
    }
    this._javaHome = path.join(jre.driver(), "../../");
    this._state = Synchronizing;
    log.debug(
      `[GUI main] New sia instance: cmd = ${this._cmd} in ${
        this._wd
      }, java-home = ${this._javaHome}`
    );
  }

  start(dir, reset) {
    if (this.proc) {
      return;
    }

    const args = ["--sync-dir", `"${dir}"`, "--output-events"];
    if (reset) {
      args.push("--reset-db");
    }

    const env = {
      ...process.env,
      JAVA_HOME: this._javaHome,
    };

    if (process.platform === "win32") {
      const lib = path.normalize(path.join(this._wd, "../../../libraries"));
      env.PATH = `${lib};${env.PATH || env.Path}`;
      env.GOOBOX_SYNC_SIA_OPTS = `-Djava.library.path="${lib}"`;
    } else {
      env.PATH = `${this._wd}:${env.PATH || env.Path}`;
      env.GOOBOX_SYNC_SIA_OPTS = `-Dgoobox.resource=${path.resolve(
        __dirname,
        "../../resources/mac"
      )}`;
    }

    log.info(`[GUI main] Starting ${this._cmd} in ${this._wd} with ${args}`);
    this.proc = spawn(this._cmd, args, {
      cwd: this._wd,
      env,
      shell: true,
      windowsHide: true,
    });

    // Attach a root event handler to stdout.
    readLine.createInterface({input: this.proc.stdout}).on("line", line => {
      log.debug(`[GUI main] Received a sia event: ${line}`);
      try {
        const e = JSON.parse(line);
        this.emit(e.method, e.args);
      } catch (err) {
        log.error(
          `[GUI main] Could not handle a message from sync-sia: ${line}`
        );
      }
    });

    // Attach a logger to stderr.
    readLine.createInterface({input: this.proc.stderr}).on("line", log.verbose);

    // Attach a sync state event handler.
    this.on("syncState", payload => {
      this._state = payload.newState;
    });

    // Attach a close event handler.
    this.proc.on("close", (code, signal) => {
      if (this.proc && !this.proc._closing) {
        log.debug(
          `[GUI main] sync-sia closed: code = ${code}, signal = ${signal}`
        );
        this.proc = null;
        setTimeout(() => this.start(dir), 5000);
      }
    });
  }

  get syncState() {
    return this._state;
  }

  get closed() {
    return !this.proc;
  }

  async close() {
    return Promise.all(["proc", "walletProc"].map(p => this.closeProc(p)));
  }

  async closeProc(proc) {
    if (!this[proc]) {
      return;
    }

    this[proc]._closing = true;
    return Promise.all([
      new Promise(resolve => {
        this[proc].once("exit", () => {
          log.info("[GUI main] sync-sia app is exited");
          this[proc] = null;
          resolve();
        });
      }),
      new Promise(resolve => {
        this[proc].once("close", () => {
          log.info("[GUI main] Streams of sync-sia app are closed");
          resolve();
        });
      }),
      new Promise(resolve => {
        log.info("[GUI main] Closing the sync-sia app");
        if (process.platform === "win32") {
          // noinspection SpellCheckingInspection
          execSync(`taskkill /pid ${this[proc].pid} /T /F`);
        } else {
          this[proc].kill("SIGTERM");
        }
        resolve();
      }),
    ]);
  }

  async wallet() {
    log.info(`[GUI main] Requesting the wallet info to ${this._cmd}`);
    return new Promise((resolve, reject) => {
      this.walletProc = spawn(this._cmd, ["wallet"], {
        cwd: this._wd,
        env: {
          JAVA_HOME: this._javaHome,
        },
        timeout: 5 * 60 * 1000,
        shell: true,
        windowsHide: true,
      });

      const stderr = readLine.createInterface({input: this.walletProc.stderr});
      stderr.on("line", log.verbose);

      this.walletProc.on("error", err => {
        if (!err) {
          log.warn("[GUI main] wallet command returned an empty error");
          return;
        }
        log.error(`[GUI main] Failed to obtain the wallet information: ${err}`);
        this.walletProc = null;
        reject(
          util.isString(err) ? err : "Failed to obtain the wallet information"
        );
      });

      toString(this.walletProc.stdout).then(res => {
        this.walletProc = null;
        const info = yaml.safeLoad(res);
        log.debug(`[GUI main] wallet info: ${res}`);
        if (!info || !info["wallet address"]) {
          log.error(
            `[GUI main] Failed to obtain the wallet information: ${info}`
          );
          reject("Failed to obtain the wallet information");
        } else {
          log.info(
            `[GUI main] Received the wallet info: address = ${
              info["wallet address"]
            }`
          );
          resolve(info);
        }
      });
    });
  }
}
