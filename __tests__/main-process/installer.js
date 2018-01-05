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

jest.mock("fs");
jest.mock("../../src/main-process/jre");
jest.mock("../../src/main-process/config");

import {app, BrowserWindow, ipcMain} from "electron";
import fs from "fs";
import menubar, {menuberMock} from "menubar";
import path from "path";
import {JREInstallEvent, SiaWalletEvent, StorjLoginEvent, StorjRegisterationEvent} from "../../src/constants";
import "../../src/main-process/installer";
import Sia from "../../src/main-process/sia";
import {installJRE} from "../../src/main-process/jre";
import {getConfig} from "../../src/main-process/config";

describe("main process of the installer", () => {

  let onReady;
  beforeAll(() => {
    app.on.mock.calls.forEach(args => {
      if (args[0] === "ready") {
        onReady = args[1];
      }
    });
  });

  let mockLoadURL;
  beforeEach(() => {
    mockLoadURL = jest.spyOn(BrowserWindow.prototype, "loadURL");
    ipcMain.on.mockReset();
    // Do not reset those mocks because they have implementations.
    menubar.mockClear();
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
    onReady();

    expect(fs.existsSync).toHaveBeenCalledWith(dir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(dir);
  });

  it("checks the sync folder exists", () => {
    fs.existsSync.mockReset();
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReset();

    const dir = "/tmp/some/place";
    process.env.DEFAULT_SYNC_FOLDER = dir;
    onReady();

    expect(fs.existsSync).toHaveBeenCalledWith(dir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it("loads static/installer.html", () => {
    onReady();
    expect(mockLoadURL).toHaveBeenCalledWith("file://" + path.join(__dirname, "../../static/installer.html"));
  });

  describe("JREInstallEvent handler", () => {

    let handler;
    const event = {
      sender: {
        send: jest.fn()
      }
    };

    beforeEach(() => {
      onReady();
      handler = ipcMain.on.mock.calls.filter(args => args[0] === JREInstallEvent).map(args => args[1])[0];
      event.sender.send.mockClear();
      installJRE.mockReset();
    });

    it("installs JRE and send nothing if the installation is succeeded", async () => {
      await handler(event);
      expect(installJRE).toHaveBeenCalled();
      expect(event.sender.send).toHaveBeenCalledWith(JREInstallEvent);
    });

    it("sends back error messages if the installation fails", async () => {
      const err = "expected error";
      installJRE.mockReturnValue(Promise.reject(err));

      await handler(event);
      expect(installJRE).toHaveBeenCalled();
      expect(event.sender.send).toHaveBeenCalledWith(JREInstallEvent, err);
    });

  });

  it("handles StorjLoginEvent", () => {
    const sender = {
      send: jest.fn()
    };

    ipcMain.on.mockImplementation((event, cb) => {
      if (event === StorjLoginEvent) {
        cb({sender: sender}, true);
        expect(sender.send).toHaveBeenCalledWith(StorjLoginEvent, expect.anything());
      }
    });
    onReady();
    expect(ipcMain.on).toHaveBeenCalledWith(StorjLoginEvent, expect.anything());
  });

  it("handles StorjRegisterationEvent", () => {
    const sender = {
      send: jest.fn()
    };

    ipcMain.on.mockImplementation((event, cb) => {
      if (event === StorjRegisterationEvent) {
        cb({sender: sender}, "0000 0000 00000 000000");
        expect(sender.send).toHaveBeenCalledWith(StorjRegisterationEvent, expect.anything());
      }
    });
    onReady();
    expect(ipcMain.on).toHaveBeenCalledWith(StorjRegisterationEvent, expect.anything());
  });

  describe("SiaWalletEvent handler", () => {

    let handler;
    const event = {
      sender: {
        send: jest.fn()
      }
    };

    const address = "0x01234567890";
    const seed = "hello world";
    let wallet, start;
    beforeEach(() => {
      onReady();
      handler = ipcMain.on.mock.calls.filter(args => args[0] === SiaWalletEvent).map(args => args[1])[0];
      event.sender.send.mockClear();
      getConfig.mockReset();

      wallet = jest.spyOn(Sia.prototype, "wallet").mockReturnValue(Promise.resolve({
        "wallet address": address,
        "primary seed": seed,
      }));

      start = jest.spyOn(Sia.prototype, "start").mockImplementation(() => {
      });
    });

    afterEach(() => {
      wallet.mockRestore();
      start.mockRestore();
    });

    it("execute the wallet command of sync sia app", async () => {
      await handler(event);
      expect(wallet).toHaveBeenCalled();
      expect(event.sender.send).toHaveBeenCalledWith(SiaWalletEvent, {
        address: address,
        seed: seed,
      });
    });

    it("starts the sync sia app", async () => {
      const dir = "/tmp";
      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      await handler(event);
      expect(getConfig).toHaveBeenCalled();
      expect(start).toHaveBeenCalledWith(dir);
      expect(global.sia instanceof Sia).toBeTruthy();

    });

    it("shows an error message when the wallet command returns an error", async () => {
      const error = "expected error";
      wallet.mockReturnValue(Promise.reject(error));
      await handler(event);
      expect(start).not.toHaveBeenCalled();
      expect(event.sender.send).toHaveBeenCalledWith(SiaWalletEvent, null, error);
    });

  });

  describe("WindowAllClosed event handler", () => {

    let onWindowAllClosed;
    beforeEach(() => {
      onReady();
      onWindowAllClosed = app.on.mock.calls
        .filter(args => args[0] === "window-all-closed")
        .map(args => args[1])[0];
      getConfig.mockReset();
      app.isReady.mockReset();
      app.on.mockReset();
      app.quit.mockReset();
    });

    it("starts the core app when all windows are closed and installed is true", async () => {

      app.isReady.mockReturnValue(false);
      getConfig.mockReturnValue(Promise.resolve({
        installed: true,
      }));

      await onWindowAllClosed();
      expect(getConfig).toHaveBeenCalled();
      // This calling of app.on is in main.js.
      expect(app.on).toHaveBeenCalledWith("ready", expect.any(Function));
      expect(app.quit).not.toHaveBeenCalled();

    });

    // TODO: it shows some message to make sure users want to quit the installer.
    it("does nothing when all windows are closed but installed is false", async () => {

      getConfig.mockReturnValue(Promise.resolve({
        installed: false,
      }));

      await onWindowAllClosed();
      expect(getConfig).toHaveBeenCalled();
      expect(app.isReady).not.toHaveBeenCalled();
      expect(app.quit).toHaveBeenCalled();

    });

    it("closes the sync sia app if running in spite of the installation is canceled", async () => {

      global.sia = new Sia();
      const close = jest.spyOn(global.sia, "close");
      close.mockReturnValue(Promise.resolve());

      getConfig.mockReturnValue(Promise.resolve({
        installed: false
      }));

      await onWindowAllClosed();
      expect(global.sia).toBeNull();
      expect(close).toHaveBeenCalled();

    });

  });


});