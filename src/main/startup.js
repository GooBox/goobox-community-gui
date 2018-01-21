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

import program from "commander";
import {app} from "electron";
import * as log from "electron-log";
import {getConfig, saveConfig} from "./config";
import {core} from "./core";
import {installer} from "./installer";

export const main = async () => {

  program
    .option("--installer", "Run the installer even if the installation has been succeeded")
    .option("--dev-tools", "Enable developer tools (not available in production builds)")
    .option("--storj", "Overwrite the configuration file and start with Storj")
    .option("--sia", "Overwrite the configuration file and start with Sia")
    .parse(["", "", ...process.argv]);

  if ("test" === process.env.NODE_ENV) {
    // Pass.
  } else if ("production" !== process.env.NODE_ENV) {
    if (program.devTools) {
      process.env.NODE_ENV = "development";
    }
    log.transports.file.level = "debug";
    log.transports.console.level = "debug";
  } else {
    log.transports.file.level = "info";
    log.transports.console.level = "warn";
  }

  if (program.installer) {

    installer();

  } else {

    let cfg = null;
    try {
      cfg = await getConfig();
    } catch (err) {
      log.info(`Cannot fine the configuration file`);
    }

    if (!cfg || !cfg.installed) {
      log.info(`Start the installer`);
      installer();
      return;
    }

    if (program.storj && !cfg.storj) {
      await saveConfig({
        ...cfg,
        storj: true,
        sia: false,
      });
    } else if (program.sia && !cfg.sia) {
      await saveConfig({
        ...cfg,
        storj: false,
        sia: true
      });
    }
    await core();

  }

};

app.on("ready", main);



