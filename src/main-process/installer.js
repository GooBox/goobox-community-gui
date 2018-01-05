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

"use strict";
import {app, BrowserWindow, ipcMain} from "electron";
import log from "electron-log";
import fs from "fs";
import path from "path";
import {ConfigFile, JREInstallEvent, SiaWalletEvent, StorjLoginEvent, StorjRegisterationEvent} from "../constants";
import Sia from "./sia";
import {getConfig} from "./config";
import {installJRE} from "./jre";

if (!process.env.DEFAULT_SYNC_FOLDER) {
  process.env.DEFAULT_SYNC_FOLDER = path.join(app.getPath("home"), app.getName());
}

if (app.isReady()) {
  installer();
} else {
  app.on("ready", installer);
}

function installer() {

  if (!fs.existsSync(process.env.DEFAULT_SYNC_FOLDER)) {
    log.verbose(`creating the default sync folder: ${process.env.DEFAULT_SYNC_FOLDER}`);
    fs.mkdirSync(process.env.DEFAULT_SYNC_FOLDER);
  }

  const mainWindow = new BrowserWindow({
    width: 600,
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
        require("./main");

      } else {

        // otherwise
        log.info("installation has been canceled");
        if (global.sia) {
          await global.sia.close();
          global.sia = null;
          app.quit();
        } else {
          app.quit();
        }

      }

    } catch (err) {
      log.error(`failed to read/write the config: ${err}`);
      app.quit();
      throw err;
    }

  });


  ipcMain.on(JREInstallEvent, async (event) => {
    try {
      await installJRE();
      event.sender.send(JREInstallEvent);
    } catch (err) {
      event.sender.send(JREInstallEvent, err);
    }
  });

  ipcMain.on(StorjLoginEvent, (event, arg) => {
    log.info("logging in to Storj");
    event.sender.send(StorjLoginEvent, true);
  });

  ipcMain.on(StorjRegisterationEvent, (event, info) => {
    log.info("creating a new Storj account");
    event.sender.send(StorjRegisterationEvent, "xxx xxx xxxxxxx xxxx xxx xxxxx");
  });

  ipcMain.on(SiaWalletEvent, async (event) => {
    global.sia = new Sia();
    try {
      const res = await global.sia.wallet();
      event.sender.send(SiaWalletEvent, {
        address: res["wallet address"],
        seed: res["primary seed"],
      });

      const cfg = await getConfig();
      global.sia.start(cfg.syncFolder);

    } catch (error) {
      log.error(error);
      event.sender.send(SiaWalletEvent, null, error);
      delete global.sia;
    }
  });

}

