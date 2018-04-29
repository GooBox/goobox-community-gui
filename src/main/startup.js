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

import {Command} from "commander";
import {app} from "electron";
import * as log from "electron-log";
import * as jre from "node-jre";
import path from "path";
import {getConfig, saveConfig} from "./config";
import {core} from "./core";
import {installer} from "./installer";
import {initPapertrail} from "./papertrail";

export const main = async () => {

  if ("production" !== process.env.NODE_ENV && process.env.PAPERTRAIL) {
    initPapertrail();
  }

  const program = new Command();
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
      process.env.DEV_TOOLS = true;
    }
    log.transports.file.level = "debug";
    log.transports.console.level = "debug";
  } else {
    log.transports.file.level = "verbose";
    log.transports.console.level = "info";
  }

  jre.setJreDir(path.join(app.getPath("userData"), "jre"));

  if (program.installer) {

    installer();

  } else {

    let cfg = null;
    try {
      cfg = await getConfig();
    } catch (err) {
      log.info("[GUI main] Cannot fine the configuration file");
    }

    if (!cfg || !cfg.installed) {
      log.info("[GUI main] Start the installer");
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

app.on("ready", () => main().catch(err => {
  log.error(`[GUI main] ${err}`);
  app.quit();
}));



