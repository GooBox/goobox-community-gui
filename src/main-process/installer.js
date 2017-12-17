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
import path from "path";
import {app, ipcMain, BrowserWindow} from "electron";

app.on("ready", () => {

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 400,
    useContentSize: true,
    resizable: false,
    fullscreenable: false
  });
  mainWindow.loadURL("file://" + path.join(__dirname, "../../static/installer.html"));

  app.on("window-all-closed", () => {
    app.quit();
  });

});
