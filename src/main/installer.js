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
import * as actionTypes from "../ipc/constants";
import addListener from "../ipc/receiver";
import {
  installerWindowAllClosedHandler,
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
    log.verbose(`[GUI main] Creating the default sync folder: ${process.env.DEFAULT_SYNC_FOLDER}`);
    fs.mkdirSync(process.env.DEFAULT_SYNC_FOLDER);
  }

  let width = 600;
  if ("development" === process.env.NODE_ENV) {
    width *= 2;
  }
  // noinspection SpellCheckingInspection
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

  // Register event handlers.
  app.on("window-all-closed", installerWindowAllClosedHandler(app));
  addListener(actionTypes.InstallJRE, installJREHandler());
  addListener(actionTypes.StorjLogin, storjLoginHandler());
  addListener(actionTypes.StorjCreateAccount, storjCreateAccountHandler());
  addListener(actionTypes.SiaRequestWalletInfo, siaRequestWalletInfoHandler());
  addListener(actionTypes.StopSyncApps, stopSyncAppsHandler());

};

