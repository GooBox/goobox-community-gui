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
import fs from "fs";
import path from "path";
import {app, ipcMain, BrowserWindow} from "electron";
import storage from "electron-json-storage";
import jre from "node-jre";
import {execFile} from "child_process";
import yaml from "js-yaml";
import {JREInstallEvent, SiaWalletEvent, StorjLoginEvent, StorjRegisterationEvent, ConfigFile} from "../constants";

if (!process.env.DEFAULT_SYNC_FOLDER) {
  process.env.DEFAULT_SYNC_FOLDER = path.join(app.getPath("home"), app.getName());
}

app.on("ready", installer);

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

  app.on("window-all-closed", () => {

    storage.get(ConfigFile, (err, cfg) => {
      if (err) {
        console.log(err);
        app.quit();
      }

      if (cfg && cfg.installed) {
        // if the installation process is finished.
        require("./main");
      } else {
        // otherwise
        app.quit();
      }

    });

  });

  ipcMain.on(JREInstallEvent, (event) => {
    console.log(jre.driver());
    if (fs.existsSync(jre.driver())) {
      event.sender.send(JREInstallEvent);
      return;
    }
    jre.install((err) => {
      event.sender.send(JREInstallEvent, err);
    });
  });

  ipcMain.on(StorjLoginEvent, (event, arg) => {
    event.sender.send(StorjLoginEvent, true);
  });

  ipcMain.on(StorjRegisterationEvent, (event, info) => {
    event.sender.send(StorjRegisterationEvent, "xxx xxx xxxxxxx xxxx xxx xxxxx");
  });

  ipcMain.on(SiaWalletEvent, (event) => {

    let cmd = path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin/goobox-sync-sia"));
    if (process.platform === "win32") {
      cmd += ".bat";
    }
    execFile(cmd, ["wallet"], {
      cwd: path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin")),
      env: {
        JAVA_HOME: path.join(jre.driver(), "../../"),
      },
      windowsHide: true,
    }, (error, stdout) => {

      if (error) {
        console.log(error);
        return;
      }

      const res = yaml.safeLoad(stdout);
      event.sender.send(SiaWalletEvent, {
        address: res["wallet address"],
        seed: res["primary seed"],
      });

    });

  });

}

