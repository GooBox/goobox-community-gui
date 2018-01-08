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
jest.mock("../../src/main-process/jre");
jest.mock("../../src/main-process/config");
jest.mock("../../src/main-process/utils");

import {app, dialog, ipcMain} from "electron";
import {menubar, menuberMock} from "menubar";
import path from "path";
import {
  ChangeStateEvent, OpenSyncFolderEvent, Paused, SynchronizedEvent, Synchronizing, SynchronizingEvent,
  UsedVolumeEvent
} from "../../src/constants";
import {getConfig} from "../../src/main-process/config";
import icons from "../../src/main-process/icons";
import {installJRE} from "../../src/main-process/jre";
import Sia from "../../src/main-process/sia";
import Storj from "../../src/main-process/storj";
import utils from "../../src/main-process/utils";

function getEventHandler(event) {
  return ipcMain.on.mock.calls.filter(args => args[0] === event).map(args => args[1])[0];
}

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
    getConfig.mockReset();
  });

  afterEach(() => {
    delete global.storj;
    delete global.sia;
  });

  it("create a menubar instance", async () => {
    await onReady();
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

  describe("back end management", () => {

    let startStorj, startSia;
    beforeEach(() => {
      startStorj = jest.spyOn(Storj.prototype, "start").mockImplementation(() => {
      });
      startSia = jest.spyOn(Sia.prototype, "start").mockImplementation(() => {
      });
      installJRE.mockReset();
      dialog.showErrorBox.mockReset();
    });

    afterEach(() => {
      startStorj.mockRestore();
      startSia.mockRestore();
    });

    it("installs JRE if not exists", async () => {
      await onReady();
      expect(installJRE).toHaveBeenCalled();
    });

    it("shows an error message and quits when the JRE installation is failed", async () => {
      const err = "expected error";
      installJRE.mockReturnValue(Promise.reject(err));

      await onReady();
      expect(installJRE).toHaveBeenCalled();
      expect(dialog.showErrorBox).toHaveBeenCalledWith("Goobox", `Cannot start Goobox: ${err}`);
      expect(app.quit).toHaveBeenCalled();
    });

    it("starts the storj backend if storj conf is true but not running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        storj: true,
      }));

      await onReady();
      expect(getConfig).toHaveBeenCalled();
      expect(startStorj).toHaveBeenCalled();
    });

    it("doesn't start the storj backend if it is already running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        storj: true,
      }));
      global.storj = {};

      await onReady();
      expect(getConfig).toHaveBeenCalled();
      expect(startStorj).not.toHaveBeenCalled();
    });

    it("starts the sia backend if sia conf is true but not running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
      }));

      await onReady();
      expect(getConfig).toHaveBeenCalled();
      expect(startSia).toHaveBeenCalled();
    });

    it("doesn't start the sia backend if it is already running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
      }));
      global.sia = {};

      await onReady();
      expect(getConfig).toHaveBeenCalled();
      expect(startSia).not.toHaveBeenCalled();
    });

    it("closes the process if another process is already running", async () => {
      app.makeSingleInstance.mockReturnValueOnce(true);
      await onReady();
      expect(app.quit).toHaveBeenCalled();
    });

  });

  describe("ChangeStateEvent handler", () => {

    let handler;
    let event;
    beforeEach(async () => {
      await onReady();
      handler = getEventHandler(ChangeStateEvent);
      menuberMock.tray.setImage.mockClear();
      event = {
        sender: {
          send: jest.fn()
        }
      };
      delete global.sia;
    });

    it("sets the idle icon when the state is Synchronizing", async () => {
      await handler(event, Synchronizing);
      expect(menuberMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
      expect(event.sender.send).toHaveBeenCalledWith(ChangeStateEvent, Synchronizing);
    });

    it("sets the paused icon when the state is Paused", async () => {
      await handler(event, Paused);
      expect(menuberMock.tray.setImage).toHaveBeenCalledWith(icons.getPausedIcon());
      expect(event.sender.send).toHaveBeenCalledWith(ChangeStateEvent, Paused);
    });

    it("restart the SIA instance if exists when the new state is Synchronizing", async () => {
      global.sia = {
        start: jest.fn(),
        stdout: {
          on: jest.fn()
        }
      };
      await handler(event, Synchronizing);
      expect(global.sia.start).toHaveBeenCalled();
      expect(global.sia.stdout.on).toHaveBeenCalledWith("line", expect.any(Function));
    });

    it("closes the SIA instance if exists when the new state is Paused", async () => {
      global.sia = {
        close: jest.fn(),
        stdout: {
          removeListener: jest.fn(),
        }
      };
      await handler(event, Paused);
      expect(global.sia.close).toHaveBeenCalled();
      expect(global.sia.stdout.removeListener).toHaveBeenCalledWith("line", expect.any(Function));
    });

  });

  describe("OpenSyncFolderEvent handler", () => {

    let handler;
    let event;
    beforeEach(async () => {
      await onReady();
      handler = getEventHandler(OpenSyncFolderEvent);
      menuberMock.tray.setImage.mockClear();
      event = {
        sender: {
          send: jest.fn()
        }
      };
      utils.openDirectory.mockReset();
    });

    it("opens the sync folder", async () => {
      const syncFolder = "/tmp";
      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: syncFolder,
      }));

      await handler(event);
      expect(getConfig).toHaveBeenCalled();
      expect(utils.openDirectory).toHaveBeenCalledWith(syncFolder);
      expect(event.sender.send).toHaveBeenCalledWith(OpenSyncFolderEvent);
    });

  });

  describe("UsedVolumeEvent handler", () => {

    let handler;
    let event;
    beforeEach(async () => {
      await onReady();
      handler = getEventHandler(UsedVolumeEvent);
      menuberMock.tray.setImage.mockClear();
      event = {
        sender: {
          send: jest.fn()
        }
      };
      utils.totalVolume.mockReset();
    });

    it("calculate the volume of the sync folder", async () => {
      const syncFolder = "/tmp";
      getConfig.mockReturnValue(Promise.resolve({
        syncFolder: syncFolder,
      }));

      const volume = 1234567;
      utils.totalVolume.mockReturnValue(Promise.resolve(volume));

      await handler(event);
      expect(getConfig).toHaveBeenCalled();
      expect(utils.totalVolume).toHaveBeenCalledWith(syncFolder);
      expect(event.sender.send).toHaveBeenCalledWith(UsedVolumeEvent, volume / 1024 / 1024);
    });

  });

  describe("quit event handler", () => {

    let handler;
    beforeEach(async () => {
      await onReady();
      handler = app.on.mock.calls.filter(args => args[0] === "quit").map(args => args[1])[0];
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

  describe("SiaEventHandler", () => {

    let handler;
    beforeEach(async () => {
      getConfig.mockReturnValue(Promise.resolve({sia: true}));
      global.sia = {
        start: () => {
        },
        stdout: {
          on: jest.fn()
        }
      };
      await onReady();
      handler = global.sia.stdout.on.mock.calls.filter(args => args[0] === "line").map(args => args[1])[0];
      menuberMock.tray.setImage.mockReset();
    });

    afterEach(() => {
      delete global.sia;
    });

    it("sets the synchronizing icon when receiving a Synchronizing event", () => {
      handler(JSON.stringify({eventType: SynchronizingEvent}));
      expect(menuberMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
    });

    it("sets the idle icon when receiving a Synchronized event", () => {
      handler(JSON.stringify({eventType: SynchronizedEvent}));
      expect(menuberMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
    });

    // TODO: It handles StartSynchronizationEvent and notifies sync sia app starts synchronizing.

    it("should be equal to the handler registered to the initial Sia instance", async () => {
      const changeStateEventHandler = getEventHandler(ChangeStateEvent);
      await changeStateEventHandler({
        sender: {
          send: () => {
          }
        }
      }, Synchronizing);
      expect(global.sia.stdout.on).toHaveBeenLastCalledWith("line", handler);
    });

  });

});
