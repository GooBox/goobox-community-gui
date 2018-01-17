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
import yaml from "js-yaml";
import jre from "node-jre";
import path from "path";
import readline from "readline";
import toString from "stream-to-string";


export default class Sia {

  constructor() {
    this.wd = path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin"));
    this.cmd = "goobox-sync-sia";
    if (process.platform === "win32") {
      this.cmd += ".bat";
    }
    this.javaHome = path.join(jre.driver(), "../../");
    this.stdin = null;
    this.stdout = null;
    this.stderr = null;
    log.debug(`new sia instance: cmd = ${this.cmd}, java-home = ${this.javaHome}`);
  }

  start(dir, reset) {

    if (this.proc) {
      return;
    }

    log.info(`starting sync-sia app in ${this.cmd}`);
    const args = ["--sync-dir", `"${dir}"`, "--output-events"];
    if (reset) {
      args.push("--reset-db");
    }
    this.proc = spawn(this.cmd, args, {
      cwd: this.wd,
      env: {
        JAVA_HOME: this.javaHome,
      },
      shell: true,
      windowsHide: true,
    });
    this.stdin = this.proc.stdin;
    this.stdout = readline.createInterface({input: this.proc.stdout});
    this.stderr = readline.createInterface({input: this.proc.stderr});
    this.stderr.on("line", log.verbose);

    this.proc.on("close", (code, signal) => {
      log.debug(`sia closed: code = ${code}, signal = ${signal}, proc = ${JSON.stringify(this.proc, null, " ")}`);
    });

  }

  async close() {

    if (!this.proc) {
      return;
    }

    const promise = Promise.all([
      new Promise(resolve => {
        // TODO: Exit handler takes code and signal argument.
        this.proc.once("exit", () => {
          log.info("the sync-sia app is exited");
          this.proc = null;
          resolve();
        });
      }),
      new Promise(resolve => {
        this.proc.once("close", () => {
          log.info("the streams of sync-sia app is closed");
          resolve();
        });
      }),
    ]);

    log.info("closing the sync-sia app");
    if (process.platform === "win32") {
      execSync(`taskkill /pid ${this.proc.pid} /T /F`);
    } else {
      this.proc.kill("SIGTERM");
    }
    return promise;

  }

  async wallet() {

    log.info(`requesting the wallet info to ${this.cmd}`);
    return new Promise((resolve, reject) => {

      const proc = spawn(this.cmd, ["wallet"], {
        cwd: this.wd,
        env: {
          JAVA_HOME: this.javaHome,
        },
        timeout: 5 * 60 * 1000,
        shell: true,
        windowsHide: true,
      });

      const stderr = readline.createInterface({input: proc.stderr});
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

