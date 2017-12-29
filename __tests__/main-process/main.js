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
jest.mock("child_process");


import {execFile, spawnSync} from "child_process";
import {app, ipcMain} from "electron";
import storage from "electron-json-storage";
import {menubar, menuberMock} from "menubar";
import path from "path";
import {ChangeStateEvent, OpenSyncFolderEvent, Paused, Synchronizing, UsedVolumeEvent} from "../../src/constants";
import icons from "../../src/main-process/icons";


describe("main process of the core app", () => {

  let originalPlatform;
  let onReady;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "darwin"
    });

    app.isReady.mockReturnValue(false);
    require("../../src/main-process/main");
    onReady = app.on.mock.calls
      .filter(args => args[0] === "ready")
      .map(args => args[1])[0];

  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    });
  });


  beforeEach(() => {
    menubar.mockClear();
    menuberMock.on.mockClear();
    menuberMock.tray.listeners.mockReturnValue([() => null]);
    app.quit.mockClear();
    ipcMain.on.mockClear();
  });

  it("create a menubar instance", () => {
    onReady();
    expect(menubar).toHaveBeenCalledWith({
      index: "file://" + path.join(__dirname, "../../static/popup.html"),
      icon: expect.anything(),
      tooltip: app.getName(),
      preloadWindow: true,
      width: 518,
      height: 400,
      alwaysOnTop: true,
      showDockIcon: false,
    });
  });

  it("closes the process if another process is already running", () => {
    app.makeSingleInstance.mockReturnValueOnce(true);
    onReady();
    expect(app.quit).toHaveBeenCalled();
  });

  describe("ChangeStateEvent handler", () => {

    let handler;
    let event;
    beforeEach(() => {
      onReady();
      handler = ipcMain.on.mock.calls.filter(args => args[0] === ChangeStateEvent).map(args => args[1])[0];
      menuberMock.tray.setImage.mockClear();
      event = {
        sender: {
          send: jest.fn()
        }
      };
    });

    it("sets the idle icon when the state is Synchronizing", () => {
      handler(event, Synchronizing);
      expect(menuberMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
      expect(event.sender.send).toHaveBeenCalledWith(ChangeStateEvent, Synchronizing);
    });

    it("sets the paused icon when the state is Paused", () => {
      handler(event, Paused);
      expect(menuberMock.tray.setImage).toHaveBeenCalledWith(icons.getPausedIcon());
      expect(event.sender.send).toHaveBeenCalledWith(ChangeStateEvent, Paused);
    });

  });

  describe("OpenSyncFolderEvent handler", () => {

    let handler;
    let event;
    beforeEach(() => {
      onReady();
      handler = ipcMain.on.mock.calls.filter(args => args[0] === OpenSyncFolderEvent).map(args => args[1])[0];
      menuberMock.tray.setImage.mockClear();
      event = {
        sender: {
          send: jest.fn()
        }
      };
    });

    it("opens the sync folder", () => {
      const syncFolder = "/tmp";
      storage.get.mockImplementationOnce((key, cb) => {
        cb({
          syncFolder: syncFolder,
        });
      });
      handler(event);
      expect(spawnSync).toHaveBeenCalledWith("open", [syncFolder]);
      expect(event.sender.send).toHaveBeenCalledWith(OpenSyncFolderEvent);
    });

  });

  describe("UsedVolumeEvent handler", () => {

    let handler;
    let event;
    beforeEach(() => {
      onReady();
      handler = ipcMain.on.mock.calls.filter(args => args[0] === UsedVolumeEvent).map(args => args[1])[0];
      menuberMock.tray.setImage.mockClear();
      event = {
        sender: {
          send: jest.fn()
        }
      };
    });

    it("calculate the volume of the sync folder", async () => {
      const syncFolder = "/tmp";
      storage.get.mockImplementationOnce((key, cb) => {
        cb({
          syncFolder: syncFolder,
        });
      });

      const volume = 1234567;
      execFile.mockImplementation((cmd, args, cb) => {
        cb(null, `${volume}\t${syncFolder}`);
      });

      await handler(event);
      expect(execFile).toHaveBeenCalledWith("du", ["-s", syncFolder], expect.any(Function));
      expect(event.sender.send).toHaveBeenCalledWith(UsedVolumeEvent, volume / 1024 / 1024);
    });

  });

  describe("quit event handler", () => {

    let handler;
    beforeEach(() => {
      onReady();
      handler = app.on.mock.calls.filter(args => args[0] === "quit").map(args => args[1])[0];
    });

    afterEach(() => {
      delete global.storj;
      delete global.sia;
    });

    it("closes storj instance if it exists", async () => {
      global.storj = {
        close: jest.fn(),
      };
      global.storj.close.mockReturnValue(Promise.resolve());

      await handler();
      expect(global.storj.close).toHaveBeenCalled();
    });

    it("closes sia instance if it exists", async () => {
      global.sia = {
        close: jest.fn()
      };
      global.sia.close.mockReturnValue(Promise.resolve());

      await handler();
      expect(global.sia.close).toHaveBeenCalled();
    });

  });

});
