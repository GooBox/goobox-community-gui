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

import {execFile, spawnSync} from "child_process";

let openDirectory, totalVolume;

if (process.platform === "win32") {

  openDirectory = (dir) => {
    spawnSync("cmd.exe", ["/c", "start", `"${dir}"`]);
  };

  totalVolume = async (dir) => {
    //
    return 0;
  };

} else {

  openDirectory = (dir) => {
    spawnSync("open", [dir]);
  };

  totalVolume = async (dir) => {
    return new Promise((resolve, reject) => {
      execFile("du", ["-s", dir], (error, stdout) => {
        if (error) {
          reject(error);
        }
        const sp = stdout.split("\t");
        if (!sp.length) {
          reject("invalid response");
        }
        resolve(parseInt(sp[0]));
      });
    });
  };

}

export const utils = {
  openDirectory: openDirectory,
  totalVolume: totalVolume,
};

export default utils;