/*
 * Copyright (C) 2018 Junpei Kawamoto
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

import del from "del";
import log from "electron-log";
import fs from "fs";
import jre from "node-jre";
import path from "path";

export async function installJRE() {

  return new Promise((resolve, reject) => {

    log.verbose(`[GUI main] JRE path: ${jre.jreDir()}`);
    let shouldInstall = false;
    try {
      if (!fs.existsSync(jre.driver())) {
        shouldInstall = true;
      }
    } catch (err) {
      log.silly(err);
      shouldInstall = true;
    }

    if (shouldInstall) {

      log.info("[GUI main] JRE is not found and starts installation of a JRE");
      jre.install((err) => {
        log.info(`[GUI main] JRE installation has been finished ${err ? `with an error: ${err}` : ""}`);
        // noinspection SpellCheckingInspection
        if (err && err !== "Smoketest failed.") {
          log.error("[GUI main] JRE installation failed and cleaning up");
          del.sync(path.join(jre.jreDir(), "**"));
          reject("Failed to install JRE");
        } else {
          resolve(true);
        }
      });

    } else {
      resolve(false);
    }

  });

}