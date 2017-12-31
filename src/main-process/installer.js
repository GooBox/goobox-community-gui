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
import storage from "electron-json-storage";
import log from "electron-log";
import fs from "fs";
import jre from "node-jre";
import path from "path";
import {ConfigFile, JREInstallEvent, SiaWalletEvent, StorjLoginEvent, StorjRegisterationEvent} from "../constants";
import Sia from "./sia";

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

  if ("production" !== process.env.NODE_ENV) {
    mainWindow.toggleDevTools();
  }

  app.on("window-all-closed", async () => {

    return new Promise((resolve, reject) => {

      log.info(`loading the config file ${ConfigFile}`);
      storage.get(ConfigFile, (err, cfg) => {
        if (err) {
          log.error(`failed to read/write the config: ${err}`);
          app.quit();
          reject(err);
        }

        if (cfg && cfg.installed) {
          // if the installation process is finished.
          log.info("installation has been finished, now starting Goobox");
          require("./main");
          resolve();
        } else {
          // otherwise
          log.info("installation has been canceled");
          if (global.sia) {
            global.sia.close().then(() => {
              global.sia = null;
              app.quit();
              resolve();
            });
          } else {
            app.quit();
            resolve();
          }
        }

      });

    });

  });

  ipcMain.on(JREInstallEvent, (event) => {
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
        event.sender.send(JREInstallEvent, err);
      });
    } else {
      event.sender.send(JREInstallEvent);
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
    const sia = new Sia();
    const res = await sia.wallet();
    event.sender.send(SiaWalletEvent, {
      address: res["wallet address"],
      seed: res["primary seed"],
    });
    sia.start();
    global.sia = sia;
  });

}

