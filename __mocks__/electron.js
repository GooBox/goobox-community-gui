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

import electronJsonStorage from "./electron-json-storage";

export const app = {
  on: jest.fn(),
  getName: () => "Goobox",
  getPath: jest.fn().mockReturnValue("."),
  isReady: jest.fn(),
  quit: jest.fn(),
  requestSingleInstanceLock: jest.fn().mockReturnValue(true),
  exit: jest.fn(),
};

export class BrowserWindow {
  constructor(opts) {
    this.opts = opts;
  }

  loadURL(url) {
    this.url = url;
  }

  loadFile(path) {
    this.path = path;
  }

  setResizable() {}

  toggleDevTools() {}

  setSkipTaskbar() {}
}

export const ipcMain = {
  send: jest.fn(),
  on: jest.fn(),
};

export const ipcRenderer = {
  send: jest.fn(),
  once: jest.fn(),
};

export const remote = {
  app: {
    getName: () => "Goobox",
    getPath: jest.fn(),
  },
  dialog: {
    showOpenDialog: jest.fn(),
  },
  getCurrentWindow: jest.fn(() => "getCurrentWindow"),
  require: module => {
    if (module === "electron-json-storage") {
      return electronJsonStorage;
    }
  },
};

export const Menu = {
  buildFromTemplate: jest.fn(),
  setApplicationMenu: jest.fn(),
};

export const dialog = {
  showErrorBox: jest.fn(),
};

export const systemPreferences = {
  isDarkMode: jest.fn(),
  subscribeNotification: jest.fn(),
};
