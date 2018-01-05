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

import fs from "fs";
import log from "electron-log";
import jre from "node-jre";

export async function installJRE() {

  return new Promise((resolve, reject) => {

    log.verbose(`JRE path: ${jre.jreDir()}`);
    let shouldInstall = false;
    try {
      if (!fs.existsSync(jre.driver())) {
        shouldInstall = true;
      }
    } catch (err) {
      log.debug(err);
      shouldInstall = true;
    }

    if (shouldInstall) {

      log.info("JRE is not found and starts installation of a JRE");
      jre.install((err) => {

        log.info(`JRE installation finished ${err ? `with an error: ${err}` : ""}`);
        if (err && err !== "Smoketest failed.") {
          reject(err);
        } else {
          resolve();
        }

      });

    } else {
      resolve();
    }

  });

}