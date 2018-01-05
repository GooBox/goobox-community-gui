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

import {execFile, spawn} from "child_process";
import log from "electron-log";
import yaml from "js-yaml";
import jre from "node-jre";
import path from "path";
import readline from "readline";


export default class Sia {

  constructor() {
    this.wd = path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin"));
    this.cmd = path.join(this.wd, "goobox-sync-sia");
    if (process.platform === "win32") {
      this.cmd += ".bat";
    }
    this.javaHome = path.join(jre.driver(), "../../");
    this.stdin = null;
    this.stdout = null;
    this.stderr = null;
    log.debug(`new sia instance: cmd = ${this.cmd}, java-home = ${this.javaHome}`);
  }

  start(dir) {

    if (this.proc) {
      return;
    }

    log.info(`starting sync-sia app in ${this.cmd}`);
    this.proc = spawn(this.cmd, ["--sync-dir", `"${dir}"`, "--output-events"], {
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

  async close() {

    if (!this.proc) {
      return;
    }

    log.info("closing the sync-sia app");
    return new Promise(resolve => {

      this.proc.on("exit", () => {
        log.info("the sync-sia app is closed");
        this.proc = null;
        resolve();
      });

      this.proc.kill("SIGTERM");

    });

  }

  async wallet() {

    log.info(`requesting the wallet info to ${this.cmd}`);
    return new Promise((resolve, reject) => {

      execFile(this.cmd, ["wallet"], {
        cwd: this.wd,
        env: {
          JAVA_HOME: this.javaHome,
        },
        timeout: 5 * 60 * 1000,
        windowsHide: true,
      }, (err, stdout) => {

        if (err) {
          log.error(err);
          reject(err);
          return;
        }

        const info = yaml.safeLoad(stdout);
        if (!info || !info["wallet address"]) {
          log.error("failed to obtain the wallet information");
          reject("failed to obtain the wallet information");
          return;
        }

        log.info(`the wallet info is received: ${info["wallet address"]}`);
        resolve(info);
      });

    });

  }

}