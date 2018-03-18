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

import {execFileSync} from "child_process";
import * as log from "electron-log";
import fs from "fs";
import path from "path";

export const register = async dir => {

  if (process.platform === "win32") {

    log.info(`[GUI main] Registering the folder icon to ${dir}`);

    log.verbose(`[GUI main] Set ${path.basename(dir)} as a system directory`);
    // noinspection SpellCheckingInspection
    execFileSync("attrib", ["+S", path.basename(dir)], {
      cwd: path.dirname(dir),
      windowsHide: true,
    });

    const resources = ["desktop.ini", "desktop.ico"];
    return Promise.all(resources.map(async name => {

      return new Promise((resolve, reject) => {

        const src = path.join(__dirname, `../../resources/${name}`);
        const dest = path.join(dir, name);
        if (fs.existsSync(dest)) {
          log.verbose(`[GUI main] ${dest} already exists`);
          resolve();
        } else {
          log.verbose(`[GUI main] Copying ${src} to ${dest}`);
          fs.createReadStream(src)
            .pipe(fs.createWriteStream(dest))
            .on("close", resolve)
            .on("error", reject);
        }

      }).then(() => {
        log.verbose(`[GUI main] Update the attribute of ${name}`);
        try {
          execFileSync("attrib", ["+S", "+H", name], {
            cwd: dir,
            windowsHide: true,
          });
        } catch (err) {
          return Promise.reject(err);
        }
      })

    }));

  }

};


