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

import {BrowserWindow} from "electron";
import * as log from "electron-log";
import path from "path";
import {DefaultHeight, DefaultWidth, WindowTitle} from "./constants";

export const open = parent => {
  let width = DefaultWidth;
  if (process.env.DEV_TOOLS) {
    width *= 2;
  }
  const mainWindow = new BrowserWindow({
    title: WindowTitle,
    parent,
    width,
    height: DefaultHeight,
    useContentSize: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
    },
  });
  if (process.env.DEV_TOOLS) {
    mainWindow.toggleDevTools();
  }

  let filePath;
  if (log.transports.file.file) {
    filePath = log.transports.file.file;
  } else {
    filePath = log.transports.file.findLogPath("Goobox");
  }

  mainWindow.loadFile(`${path.join(__dirname, "../logviewer.html")}`, {
    hash: filePath,
  });
};

export default open;
