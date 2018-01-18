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

import {execSync, spawn} from "child_process";
import log from "electron-log";
import EventEmitter from "events";
import yaml from "js-yaml";
import jre from "node-jre";
import path from "path";
import readLine from "readline";
import toString from "stream-to-string";

export default class Sia extends EventEmitter {

  constructor() {
    super();
    this._wd = path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin"));
    this._cmd = "goobox-sync-sia";
    if (process.platform === "win32") {
      this._cmd += ".bat";
    }
    this._javaHome = path.join(jre.driver(), "../../");
    this.stdin = null;
    this.stdout = null;
    this.stderr = null;
    log.debug(`new sia instance: cmd = ${this._cmd}, java-home = ${this._javaHome}`);
  }

  start(dir, reset) {

    if (this.proc) {
      return;
    }

    log.info(`starting sync-sia app in ${this._cmd}`);
    const args = ["--sync-dir", `"${dir}"`, "--output-events"];
    if (reset) {
      args.push("--reset-db");
    }
    this.proc = spawn(this._cmd, args, {
      cwd: this._wd,
      env: {
        JAVA_HOME: this._javaHome,
      },
      shell: true,
      windowsHide: true,
    });

    // Attach a root event handler to stdout.
    readLine.createInterface({input: this.proc.stdout}).on("line", line => {
      log.debug(`Received a sia event: ${line}`);
      try {
        const e = JSON.parse(line);
        this.emit(e.method, e.args);
      } catch (err) {
        log.error(`could not handle a message from sync-sia: ${line}`);
      }
    });

    // Attach a logger to stderr.
    readLine.createInterface({input: this.proc.stderr}).on("line", log.verbose);

    this.proc.on("close", (code, signal) => {
      if (this.proc && !this.proc._closing) {
        log.debug(`sia closed: code = ${code}, signal = ${signal}, proc = ${JSON.stringify(this.proc, null, " ")}`);
        this.proc = null;
        this.start(dir);
      }
    });

  }

  async close() {

    if (!this.proc) {
      return;
    }

    this.proc._closing = true;
    return Promise.all([
      new Promise(resolve => {
        this.proc.once("exit", () => {
          log.info("the sync-sia app is exited");
          this.proc = null;
          resolve();
        });
      }),
      new Promise(resolve => {
        this.proc.once("close", () => {
          log.info("streams of sync-sia app is closed");
          resolve();
        });
      }),
      new Promise(resolve => {
        log.info("closing the sync-sia app");
        if (process.platform === "win32") {
          // noinspection SpellCheckingInspection
          execSync(`taskkill /pid ${this.proc.pid} /T /F`);
        } else {
          this.proc.kill("SIGTERM");
        }
        resolve();
      })
    ]);

  }

  async wallet() {

    log.info(`requesting the wallet info to ${this._cmd}`);
    return new Promise((resolve, reject) => {

      const proc = spawn(this._cmd, ["wallet"], {
        cwd: this._wd,
        env: {
          JAVA_HOME: this._javaHome,
        },
        timeout: 5 * 60 * 1000,
        shell: true,
        windowsHide: true,
      });

      const stderr = readLine.createInterface({input: proc.stderr});
      stderr.on("line", log.verbose);

      proc.on("error", (err) => {
        log.error(err);
        reject(err);
      });

      toString(proc.stdout).then(res => {
        const info = yaml.safeLoad(res);
        if (!info || !info["wallet address"]) {
          log.error(`failed to obtain the wallet information: ${info}`);
          reject("failed to obtain the wallet information");
        } else {
          log.info(`the wallet info is received: ${info["wallet address"]}`);
          resolve(info);
        }
      });

    });

  }

}

