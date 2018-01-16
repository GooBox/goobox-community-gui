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
jest.mock("../../src/main/jre");
jest.mock("../../src/main/config");

import {app, BrowserWindow, ipcMain} from "electron";
import fs from "fs";
import menubar, {menuberMock} from "menubar";
import path from "path";
import {
  JREInstallEvent, SiaWalletEvent, StopSyncAppsEvent, StorjLoginEvent,
  StorjRegisterationEvent
} from "../../src/constants";
import {getConfig} from "../../src/main/config";
import "../../src/main/installer";
import {installJRE} from "../../src/main/jre";
import Sia from "../../src/main/sia";
import Storj from "../../src/main/storj";

function getEventHandler(event) {
  return ipcMain.on.mock.calls.filter(args => args[0] === event).map(args => args[1])[0];
}

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
      handler = getEventHandler(JREInstallEvent);
      event.sender.send.mockClear();
      installJRE.mockReset();
    });

    it("installs JRE and send a response if the installation is succeeded", async () => {
      await handler(event);
      expect(installJRE).toHaveBeenCalled();
      expect(event.sender.send).toHaveBeenCalledWith(JREInstallEvent, true);
    });

    it("sends back error messages if the installation fails", async () => {
      const err = "expected error";
      installJRE.mockReturnValue(Promise.reject(err));

      await handler(event);
      expect(installJRE).toHaveBeenCalled();
      expect(event.sender.send).toHaveBeenCalledWith(JREInstallEvent, false, err);
    });

  });

  describe("StorjLoginEvent handler", () => {

    let handler, event, start, checkMnemonic, login;
    const email = "abc@example.com";
    const password = "password";
    const key = "xxx xxx xxx";
    const dir = "/tmp";

    beforeEach(() => {
      onReady();
      handler = getEventHandler(StorjLoginEvent);
      event = {
        sender: {
          send: jest.fn()
        }
      };
      delete global.storj;
      start = jest.spyOn(Storj.prototype, "start").mockImplementation(() => {
        if (global.storj) {
          global.storj.proc = "a dummy storj instance";
        }
      });
      checkMnemonic = jest.spyOn(Storj.prototype, "checkMnemonic").mockReturnValue(Promise.resolve());
      login = jest.spyOn(Storj.prototype, "login").mockReturnValue(Promise.resolve());
    });

    afterEach(() => {
      start.mockRestore();
      checkMnemonic.mockRestore();
      login.mockRestore();
    });

    it("starts Storj instance with reset option and sends a login request", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      await handler(event, {
        email: email,
        password: password,
        encryptionKey: key,
      });
      expect(global.storj).toBeDefined();
      expect(getConfig).toHaveBeenCalled();
      expect(start).toHaveBeenCalledWith(dir, true);
      expect(checkMnemonic).toHaveBeenCalledWith(key);
      expect(login).toHaveBeenCalledWith(email, password, key);
      expect(event.sender.send).toHaveBeenCalledWith(StorjLoginEvent, true);
    });

    it("closes a Storj instance if exists before starting a new Storj instance", async () => {
      const close = jest.fn().mockReturnValue(Promise.resolve());
      global.storj = new Storj();
      global.storj.proc = {};
      global.storj.close = close;

      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      await handler(event, {
        email: email,
        password: password,
        encryptionKey: key,
      });
      expect(close).toHaveBeenCalled();
      expect(global.storj).toBeDefined();
      expect(getConfig).toHaveBeenCalled();
      expect(start).toHaveBeenCalledWith(dir, true);
      expect(checkMnemonic).toHaveBeenCalledWith(key);
      expect(login).toHaveBeenCalledWith(email, password, key);
      expect(event.sender.send).toHaveBeenCalledWith(StorjLoginEvent, true);
    });

    it("sends an error message if checkMnemonic fails", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      const err = "expected error";
      checkMnemonic.mockReturnValue(Promise.reject(err));

      await handler(event, {
        email: email,
        password: password,
        encryptionKey: key,
      });
      expect(start).toHaveBeenCalledWith(dir, true);
      expect(checkMnemonic).toHaveBeenCalledWith(key);
      expect(login).not.toHaveBeenCalledWith(email, password, key);
      expect(event.sender.send).toHaveBeenCalledWith(StorjLoginEvent, false, err, {
        email: true,
        password: true,
        encryptionKey: false,
      });
    });


    it("sends an error message if login fails", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      const err = "expected error";
      login.mockReturnValue(Promise.reject(err));

      await handler(event, {
        email: email,
        password: password,
        encryptionKey: key,
      });
      expect(start).toHaveBeenCalledWith(dir, true);
      expect(checkMnemonic).toHaveBeenCalledWith(key);
      expect(login).toHaveBeenCalledWith(email, password, key);
      expect(event.sender.send).toHaveBeenCalledWith(StorjLoginEvent, false, err, {
        email: false,
        password: false,
        encryptionKey: true,
      });
    });

  });

  describe("StorjRegistrationEvent handler", () => {

    let handler, event, start, createAccount;
    const email = "abc@example.com";
    const password = "password";
    const key = "xxx xxx xxx";
    const dir = "/tmp";

    beforeEach(() => {
      onReady();
      handler = getEventHandler(StorjRegisterationEvent);
      event = {
        sender: {
          send: jest.fn()
        }
      };
      delete global.storj;
      start = jest.spyOn(Storj.prototype, "start").mockImplementation(() => {
        if (global.storj) {
          global.storj.proc = "a dummy storj instance";
        }
      });
      createAccount = jest.spyOn(Storj.prototype, "createAccount").mockReturnValue(Promise.resolve(key));
    });

    afterEach(() => {
      start.mockRestore();
      createAccount.mockRestore();
    });

    it("starts Storj instance with reset option and sends a registration request", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      await handler(event, {
        email: email,
        password: password,
      });
      expect(global.storj).toBeDefined();
      expect(getConfig).toHaveBeenCalled();
      expect(start).toHaveBeenCalledWith(dir, true);
      expect(createAccount).toHaveBeenCalledWith(email, password);
      expect(event.sender.send).toHaveBeenCalledWith(StorjRegisterationEvent, true, key);
    });

    it("closes a Storj instance if exists before starting a new Storj instance", async () => {
      const close = jest.fn().mockReturnValue(Promise.resolve());
      global.storj = new Storj();
      global.storj.proc = {};
      global.storj.close = close;

      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      await handler(event, {
        email: email,
        password: password,
      });
      expect(close).toHaveBeenCalled();
      expect(global.storj).toBeDefined();
      expect(getConfig).toHaveBeenCalled();
      expect(start).toHaveBeenCalledWith(dir, true);
      expect(createAccount).toHaveBeenCalledWith(email, password);
      expect(event.sender.send).toHaveBeenCalledWith(StorjRegisterationEvent, true, key);
    });

    it("sends an error message when creating an account fails", async () => {
      const close = jest.fn().mockReturnValue(Promise.resolve());
      global.storj = new Storj();
      global.storj.proc = {};
      global.storj.close = close;

      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      const err = "expected error";
      createAccount.mockReturnValue(Promise.reject(err));

      await handler(event, {
        email: email,
        password: password,
      });

      expect(start).toHaveBeenCalledWith(dir, true);
      expect(createAccount).toHaveBeenCalledWith(email, password);
      expect(event.sender.send).toHaveBeenCalledWith(StorjRegisterationEvent, false, err);
    });

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
      handler = getEventHandler(SiaWalletEvent);
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

    it("starts the sync sia app with reset option", async () => {
      const dir = "/tmp";
      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: dir
      }));

      await handler(event);
      expect(getConfig).toHaveBeenCalled();
      expect(start).toHaveBeenCalledWith(dir, true);
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

  describe("StopSyncApps handler", () => {

    let handler;
    const event = {
      sender: {
        send: jest.fn()
      }
    };

    beforeEach(() => {
      onReady();
      handler = getEventHandler(StopSyncAppsEvent);
      event.sender.send.mockClear();
    });

    afterEach(() => {
      delete global.stoj;
      delete global.sia;
    });

    it("calls storj.close if it is running", async () => {
      const close = jest.fn();
      global.storj = {
        close: close
      };
      await handler(event);
      expect(close).toHaveBeenCalled();
      expect(global.storj).not.toBeDefined();
      expect(event.sender.send).toHaveBeenCalledWith(StopSyncAppsEvent);
    });

    it("calls sia.close if it is running", async () => {
      const close = jest.fn();
      global.sia = {
        close: close
      };
      await handler(event);
      expect(close).toHaveBeenCalled();
      expect(global.sia).not.toBeDefined();
      expect(event.sender.send).toHaveBeenCalledWith(StopSyncAppsEvent);
    });

  });

  describe("WindowAllClosed event handler", () => {

    let onWindowAllClosed;
    beforeEach(() => {
      onReady();
      onWindowAllClosed = app.on.mock.calls
        .filter(args => args[0] === "window-all-closed")
        .map(args => args[1])[0];
      app.isReady.mockReset();
      app.on.mockReset();
      app.quit.mockReset();
    });

    afterEach(() => {
      delete global.storj;
      delete global.sia;
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