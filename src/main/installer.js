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

"use strict";
import {app, BrowserWindow} from "electron";
import log from "electron-log";
import fs from "fs";
import path from "path";
import {ConfigFile} from "../constants";
import * as actionTypes from "../ipc/constants";
import addListener from "../ipc/receiver";
import {getConfig} from "./config";
import {core} from "./core";
import {
  installJREHandler,
  siaRequestWalletInfoHandler,
  stopSyncAppsHandler,
  storjCreateAccountHandler,
  storjLoginHandler
} from "./handlers";

export const installer = () => {

  if (!process.env.DEFAULT_SYNC_FOLDER) {
    process.env.DEFAULT_SYNC_FOLDER = path.join(app.getPath("home"), app.getName());
  }

  if (!fs.existsSync(process.env.DEFAULT_SYNC_FOLDER)) {
    log.verbose(`creating the default sync folder: ${process.env.DEFAULT_SYNC_FOLDER}`);
    fs.mkdirSync(process.env.DEFAULT_SYNC_FOLDER);
  }

  let width = 600;
  if ("development" === process.env.NODE_ENV) {
    width *= 2;
  }
  const mainWindow = new BrowserWindow({
    width: width,
    height: 400,
    useContentSize: true,
    resizable: false,
    fullscreenable: false,
    title: "Goobox installer",
  });
  mainWindow.loadURL("file://" + path.join(__dirname, "../../static/installer.html"));

  if ("development" === process.env.NODE_ENV) {
    mainWindow.toggleDevTools();
  }

  app.on("window-all-closed", async () => {

    log.info(`loading the config file ${ConfigFile}`);
    try {

      const cfg = await getConfig();
      if (cfg && cfg.installed) {

        // if the installation process is finished.
        log.info("installation has been finished, now starting Goobox");
        await core();

      } else {

        // otherwise
        log.info("installation has been canceled");
        if (global.storj) {
          log.info("closing the storj instance");
          await global.storj.close();
          delete global.storj;
        }
        if (global.sia) {
          log.info("closing the sia instance");
          await global.sia.close();
          delete global.sia;
        }
        app.quit();

      }

    } catch (err) {
      log.error(`failed to read/write the config: ${err}`);
      app.quit();
      throw err;
    }

  });

  // Register event handlers.
  addListener(actionTypes.InstallJRE, installJREHandler());
  addListener(actionTypes.StorjLogin, storjLoginHandler());
  addListener(actionTypes.StorjCreateAccount, storjCreateAccountHandler());
  addListener(actionTypes.SiaRequestWalletInfo, siaRequestWalletInfoHandler());
  addListener(actionTypes.StopSyncApps, stopSyncAppsHandler());

}

