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

import {execFile, spawn} from "child_process";
import path from "path";
import readLine from "readline";

let totalVolume;

if (process.platform === "win32") {
  totalVolume = async dir =>
    new Promise((resolve, reject) => {
      const script = path.normalize(
        path.join(__dirname, "../../resources/du.ps1")
      );
      const proc = spawn(
        "powershell",
        ["-ExecutionPolicy", "RemoteSigned", "-File", script],
        {
          cwd: dir,
          windowsHide: true,
        }
      );

      proc.on("error", err => {
        reject(err);
        proc.kill();
      });

      let count = 0;
      readLine.createInterface({input: proc.stdout}).on("line", line => {
        const value = Number.parseInt(line);
        if (!Number.isNaN(value)) {
          count += value;
        }
      });

      proc.on("close", () => {
        resolve(count / 1024 / 1024 / 1024);
      });
    });
} else {
  totalVolume = async dir =>
    new Promise((resolve, reject) => {
      execFile("du", ["-s", "-k", dir], (error, stdout) => {
        if (error) {
          reject(error);
        }
        const sp = stdout.split("\t");
        if (!sp.length) {
          reject("invalid response");
        }
        resolve(parseInt(sp[0]) / 1024 / 1024);
      });
    });
}

export const utils = {
  totalVolume,
};

export default utils;
