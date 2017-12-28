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

  app.on("window-all-closed", () => {

    return new Promise(resolve => {

      storage.get(ConfigFile, (err, cfg) => {
        if (err) {
          console.log(err);
          app.quit();
          resolve();
        }

        if (cfg && cfg.installed) {
          // if the installation process is finished.
          require("./main");
          resolve();
        } else {
          // otherwise
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
    console.log("JRE path: " + jre.jreDir());
    let shouldInstall = false;
    try {
      if (!fs.existsSync(jre.driver())) {
        shouldInstall = true;
      }
    } catch (err) {
      console.error(err);
      shouldInstall = true;
    }

    if (shouldInstall) {
      jre.install((err) => {
        console.log(`JRE install finished ${err ? `with an error: ${err}` : ""}`);
        event.sender.send(JREInstallEvent, err);
      });
    } else {
      event.sender.send(JREInstallEvent);
    }
  });

  ipcMain.on(StorjLoginEvent, (event, arg) => {
    event.sender.send(StorjLoginEvent, true);
  });

  ipcMain.on(StorjRegisterationEvent, (event, info) => {
    event.sender.send(StorjRegisterationEvent, "xxx xxx xxxxxxx xxxx xxx xxxxx");
  });

  ipcMain.on(SiaWalletEvent, (event) => {
    return new Promise(resolve => {
      const sia = new Sia();
      sia.wallet().then((res) => {
        event.sender.send(SiaWalletEvent, {
          address: res["wallet address"],
          seed: res["primary seed"],
        });
        sia.start();
        global.sia = sia;
        resolve();
      });
    });
  });

}

