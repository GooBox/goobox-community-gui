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

"use strict";
import {execFileSync} from "child_process";
import {app, BrowserWindow, Menu} from "electron";
import log from "electron-log";
import fs from "fs";
import path from "path";
import showInfoWindowAsync from "../../about-window";
import * as actionTypes from "../../ipc/constants";
import addListener from "../../ipc/receiver";
import {open} from "../logviewer";
import {
  installerWindowAllClosedHandler,
  installJREHandler,
  siaRequestWalletInfoHandler,
  stopSyncAppsHandler,
  storjCreateAccountHandler,
  storjGenerateMnemonicHandler,
  storjLoginHandler,
} from "./handlers";

const DefaultWidth = 800;
const DefaultHeight = 600;

export const installer = () => {
  if (!process.env.DEFAULT_SYNC_FOLDER) {
    process.env.DEFAULT_SYNC_FOLDER = path.join(
      app.getPath("home"),
      app.getName()
    );
  }

  if (!fs.existsSync(process.env.DEFAULT_SYNC_FOLDER)) {
    log.verbose(
      `[GUI main] Creating the default sync folder: ${
        process.env.DEFAULT_SYNC_FOLDER
      }`
    );
    fs.mkdirSync(process.env.DEFAULT_SYNC_FOLDER);
  }

  let width = DefaultWidth;
  if (process.env.DEV_TOOLS) {
    width *= 2;
  }
  // noinspection SpellCheckingInspection
  const mainWindow = new BrowserWindow({
    width,
    height: DefaultHeight,
    useContentSize: true,
    resizable: false,
    fullscreenable: false,
    title: "Goobox installer",
    // skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile(`${path.join(__dirname, "../installer.html")}`);
  if (process.env.DEV_TOOLS) {
    mainWindow.toggleDevTools();
  }

  // Register event handlers.
  app.on("window-all-closed", installerWindowAllClosedHandler(app));
  addListener(actionTypes.InstallJRE, installJREHandler());
  addListener(
    actionTypes.StorjGenerateMnemonic,
    storjGenerateMnemonicHandler()
  );
  addListener(actionTypes.StorjLogin, storjLoginHandler());
  addListener(actionTypes.StorjCreateAccount, storjCreateAccountHandler());
  addListener(actionTypes.SiaRequestWalletInfo, siaRequestWalletInfoHandler());
  addListener(actionTypes.StopSyncApps, stopSyncAppsHandler());

  if (process.platform === "darwin") {
    log.info("[GUI main] Checking FinderSync extension");
    execFileSync("pluginkit", [
      "-e",
      "use",
      "-i",
      "com.liferay.nativity.LiferayFinderSync",
    ]);
  }

  // Create the Application's main menu for macOS
  const template = [
    {
      label: "Goobox",
      submenu: [
        {label: "About Goobox", click: showInfoWindowAsync},
        {label: "Open Log File Viewer", click: () => open(mainWindow)},
        {type: "separator"},
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            mainWindow.close();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        {label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
        {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
        {type: "separator"},
        {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
        {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
        {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:",
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

export default installer;
