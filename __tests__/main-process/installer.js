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

jest.mock('fs');
jest.mock("child_process");

import {app, ipcMain, BrowserWindow} from "electron";
import storage from "electron-json-storage";
import menubar, {menuberMock} from "menubar";
import path from "path";
import fs from "fs";
import jre from "node-jre";
import {execFile} from "child_process";
import yaml from "js-yaml";
import "../../src/main-process/installer";
import {
  JREInstallEvent,
  StorjLoginEvent,
  StorjRegisterationEvent,
  SiaWalletEvent,
  ConfigFile
} from "../../src/constants";

let onReady;
app.on.mock.calls.forEach(args => {
  if (args[0] === "ready") {
    onReady = args[1];
  }
});


describe("main process of the installer", () => {

  let mockLoadURL;
  beforeEach(() => {
    mockLoadURL = jest.spyOn(BrowserWindow.prototype, "loadURL");
    ipcMain.on.mockReset();
    app.quit.mockClear();
    // Do not reset those mocks because they have implementations.
    storage.get.mockClear();
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
      jre.driver.mockClear();
      fs.existsSync.mockClear();
    });

    it("checks JRE is installed and if exists, does nothing", () => {
      const jrePath = "/tmp/java";
      jre.driver.mockReturnValue(jrePath);
      fs.existsSync.mockReturnValue(true);

      handler(event);
      expect(jre.driver).toHaveBeenCalled();
      expect(fs.existsSync).toHaveBeenCalledWith(jrePath);
      expect(jre.install).not.toHaveBeenCalled();
      expect(event.sender.send).toHaveBeenCalledWith(JREInstallEvent);
    });

    it("checks JRE is installed and if not exists, installs a JRE", () => {
      const jrePath = "/tmp/java";
      jre.driver.mockReturnValue(jrePath);
      fs.existsSync.mockReturnValue(false);

      handler(event);
      expect(jre.driver).toHaveBeenCalled();
      expect(fs.existsSync).toHaveBeenCalledWith(jrePath);
      expect(jre.install).toHaveBeenCalled();
      expect(event.sender.send).toHaveBeenCalledWith(JREInstallEvent, null);
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

    beforeEach(() => {
      onReady();
      handler = ipcMain.on.mock.calls.filter(args => args[0] === SiaWalletEvent).map(args => args[1])[0];
      event.sender.send.mockClear();
      execFile.mockClear();
    });

    it("execute the wallet command of sync sia app", () => {
      const address = "0x01234567890";
      const seed = "hello world";

      execFile.mockImplementation((file, args, opts, callback) => {
        callback(null, yaml.dump({
          "wallet address": address,
          "primary seed": seed
        }));
      });
      handler(event);

      let cmd = path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin/goobox-sync-sia"));
      if (process.platform === "win32") {
        cmd += ".bat";
      }
      expect(execFile).toHaveBeenCalledWith(cmd, ["wallet"], {
          cwd: path.normalize(path.join(__dirname, "../../goobox-sync-sia/bin")),
          env: {
            JAVA_HOME: path.join(jre.driver(), "../../"),
          },
          windowsHide: true,
        },
        expect.any(Function)
      );

      expect(event.sender.send).toHaveBeenCalledWith(SiaWalletEvent, {
        address: address,
        seed: seed,
      });
    });

  });

  it("starts the core app when all windows are closed and installed is true", () => {

    app.isReady.mockReturnValue(true);
    menuberMock.tray.listeners.mockReturnValue([() => null]);

    onReady();
    const onWindowAllClosed = app.on.mock.calls
      .filter(args => args[0] === "window-all-closed")
      .map(args => args[1])[0];

    storage.set(ConfigFile, {
      installed: true
    });
    onWindowAllClosed();
    expect(storage.get).toHaveBeenCalledWith(ConfigFile, expect.any(Function));
    expect(menubar).toHaveBeenCalled();
    expect(app.quit).not.toHaveBeenCalled();

  });

// TODO: it shows some message to make sure users want to quie the installer.
  it("does nothing when all windows are closed but installed is false", () => {

    onReady();
    const onWindowAllClosed = app.on.mock.calls
      .filter(args => args[0] === "window-all-closed")
      .map(args => args[1])[0];
    storage.set(ConfigFile, {
      installed: false
    });
    onWindowAllClosed();
    expect(storage.get).toHaveBeenCalledWith(ConfigFile, expect.any(Function));
    expect(menubar).not.toHaveBeenCalled();
    expect(app.quit).toHaveBeenCalled();

  });

});