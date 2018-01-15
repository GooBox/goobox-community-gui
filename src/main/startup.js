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

import storage from "electron-json-storage";
import log from "electron-log";
import {ConfigFile} from "../constants";

if ("production" !== process.env.NODE_ENV && (process.argv[3] === "--dev" || process.argv[2] === "--dev")) {
  process.env.NODE_ENV = "development";
}

if ("test" === process.env.NODE_ENV) {
  // Pass.
} else if ("production" !== process.env.NODE_ENV) {
  log.transports.file.level = "debug";
  log.transports.console.level = "debug";
} else {
  log.transports.file.level = "info";
  log.transports.console.level = "warn";
}

if (process.argv[2] === "installer" || process.argv[1] === "installer") {
  require("./installer.js");
} else {
  storage.get(ConfigFile, (err, cfg) => {
    if (err || !cfg.installed) {
      require("./installer.js");
    } else {
      require("./main.js");
    }
  });
}


