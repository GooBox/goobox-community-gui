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

jest.mock("fs");
jest.mock("../../src/main/config");
jest.mock("../../src/ipc/receiver");
jest.mock("../../src/main/core");

import {app, BrowserWindow} from "electron";
import fs from "fs";
import path from "path";
import "../../src/ipc/actions";
import * as actionTypes from "../../src/ipc/constants";
import addListener from "../../src/ipc/receiver";
import {getConfig} from "../../src/main/config";
import {core} from "../../src/main/core";
import {
  installJREHandler,
  siaRequestWalletInfoHandler,
  stopSyncAppsHandler,
  storjCreateAccountHandler,
  storjLoginHandler
} from "../../src/main/handlers";
import "../../src/main/installer";
import {installer} from "../../src/main/installer";

describe("installer", () => {

  let mockLoadURL;
  beforeEach(() => {
    mockLoadURL = jest.spyOn(BrowserWindow.prototype, "loadURL");
    getConfig.mockReset();
  });

  afterEach(() => {
    mockLoadURL.mockRestore();
  });

  it("checks the sync folder exists and creates it if not exits", () => {
    fs.existsSync.mockReset();
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockReset();

    const dir = "/tmp/some/place";
    process.env.DEFAULT_SYNC_FOLDER = dir;
    installer();

    expect(fs.existsSync).toHaveBeenCalledWith(dir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(dir);
  });

  it("checks the sync folder exists", () => {
    fs.existsSync.mockReset();
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReset();

    const dir = "/tmp/some/place";
    process.env.DEFAULT_SYNC_FOLDER = dir;
    installer();

    expect(fs.existsSync).toHaveBeenCalledWith(dir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it("loads static/installer.html", () => {
    installer();
    expect(mockLoadURL).toHaveBeenCalledWith("file://" + path.join(__dirname, "../../static/installer.html"));
  });

  describe("management of GUI event handlers", () => {

    beforeEach(() => {
      addListener.mockReset();
    });

    it("registers installJREHandler", () => {
      installer();
      expect(addListener.mock.calls.find(args => {
        return args[0] === actionTypes.InstallJRE && args[1].toString() === installJREHandler().toString();
      })).toBeDefined();
    });

    it("registers storjLoginHandler", () => {
      installer();
      expect(addListener.mock.calls.find(args => {
        return args[0] === actionTypes.StorjLogin && args[1].toString() === storjLoginHandler().toString();
      })).toBeDefined();
    });

    it("registers storjCreateAccountHandler", () => {
      installer();
      expect(addListener.mock.calls.find(args => {
        return args[0] === actionTypes.StorjCreateAccount && args[1].toString() === storjCreateAccountHandler().toString();
      })).toBeDefined();
    });

    it("registers siaRequestWalletInfoHandler", () => {
      installer();
      expect(addListener.mock.calls.find(args => {
        return args[0] === actionTypes.SiaRequestWalletInfo && args[1].toString() === siaRequestWalletInfoHandler().toString();
      })).toBeDefined();
    });

    it("registers stopSyncAppsHandler", () => {
      installer();
      expect(addListener.mock.calls.find(args => {
        return args[0] === actionTypes.StopSyncApps && args[1].toString() === stopSyncAppsHandler().toString();
      })).toBeDefined();
    });

  });

  describe("WindowAllClosed event handler", () => {

    let onWindowAllClosed;
    beforeEach(() => {
      installer();
      onWindowAllClosed = app.on.mock.calls
        .filter(args => args[0] === "window-all-closed")
        .map(args => args[1])[0];
      app.quit.mockReset();
      core.mockClear();
      core.mockReturnValue(Promise.resolve());
    });

    afterEach(() => {
      delete global.storj;
      delete global.sia;
    });

    it("starts the core app when all windows are closed after the installation has been finished", async () => {

      getConfig.mockReturnValue(Promise.resolve({
        installed: true,
      }));

      await onWindowAllClosed();
      expect(getConfig).toHaveBeenCalled();
      // This calling of app.on is in main.js.
      expect(core).toHaveBeenCalled();
      expect(app.quit).not.toHaveBeenCalled();

    });

    // TODO: it shows some message to make sure users want to quit the installer.
    it("doesn't start the core app when all windows are closed before the installation is finished", async () => {

      getConfig.mockReturnValue(Promise.resolve({
        installed: false,
      }));

      await onWindowAllClosed();
      expect(getConfig).toHaveBeenCalled();
      expect(core).not.toHaveBeenCalled();
      expect(app.quit).toHaveBeenCalled();

    });

    it("closes the sync storj app if running in spite of the installation is canceled", async () => {
      const close = jest.fn().mockReturnValue(Promise.resolve());
      global.storj = {
        close: close
      };
      getConfig.mockReturnValue(Promise.resolve({
        installed: false
      }));

      await onWindowAllClosed();
      expect(global.storj).not.toBeDefined();
      expect(close).toHaveBeenCalled();
      expect(app.quit).toHaveBeenCalled();
    });

    it("closes the sync sia app if running in spite of the installation is canceled", async () => {
      const close = jest.fn().mockReturnValue(Promise.resolve());
      global.sia = {
        close: close
      };
      getConfig.mockReturnValue(Promise.resolve({
        installed: false
      }));

      await onWindowAllClosed();
      expect(global.sia).not.toBeDefined();
      expect(close).toHaveBeenCalled();
      expect(app.quit).toHaveBeenCalled();
    });

  });

});