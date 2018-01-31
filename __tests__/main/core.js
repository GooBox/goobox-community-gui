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
jest.mock("../../src/main/jre");
jest.mock("../../src/main/config");
jest.mock("../../src/main/utils");
jest.mock("../../src/ipc/receiver");
jest.mock("../../src/main/handlers");
jest.useFakeTimers();

import {app, BrowserWindow, dialog, ipcMain, Menu} from "electron";
import {menubar, menuberMock} from "menubar";
import path from "path";
import * as ipcActionTypes from "../../src/ipc/constants";
import addListener from "../../src/ipc/receiver";
import {getConfig} from "../../src/main/config";
import {core} from "../../src/main/core";
import {
  calculateUsedVolumeHandler,
  changeStateHandler,
  openSyncFolderHandler,
  siaFundEventHandler,
  updateStateHandler,
  willQuitHandler
} from "../../src/main/handlers";
import {installJRE} from "../../src/main/jre";
import Sia from "../../src/main/sia";
import Storj from "../../src/main/storj";
import utils from "../../src/main/utils";

function getEventHandler(emitter, event) {
  return emitter.on.mock.calls.filter(args => args[0] === event).map(args => args[1])[0];
}

describe("main process of the core app", () => {

  let originalPlatform;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "darwin"
    });
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    });
  });

  beforeEach(() => {
    menuberMock.tray.listeners.mockReturnValue([() => null]);
  });

  afterEach(() => {
    delete global.storj;
    delete global.sia;
    menubar.mockClear();
    menuberMock.on.mockClear();
    menuberMock.app.on.mockClear();
    app.quit.mockClear();
    ipcMain.on.mockClear();
    getConfig.mockReset();
  });

  it("create a menu bar instance", async () => {
    const setSkipTaskbar = jest.spyOn(BrowserWindow.prototype, "setSkipTaskbar");
    try {
      await core();
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
      expect(setSkipTaskbar).toHaveBeenCalledWith(true);
    } finally {
      setSkipTaskbar.mockRestore();
    }
  });

  it("registers willQuitEventHandler", async () => {
    const handler = "expected handler";
    willQuitHandler.mockReturnValue(handler);
    await core();
    expect(menuberMock.app.on).toHaveBeenCalledWith("will-quit", handler);
    expect(willQuitHandler).toHaveBeenCalledWith(menuberMock.app);
  });


  describe("system tray event handlers", () => {

    const getTrayEventHandler = (event) => getEventHandler(menuberMock.tray, event);
    const menuItems = "sample menue items";
    const onClick = jest.fn();

    beforeEach(async () => {
      menuberMock.tray.on.mockClear();
      Menu.buildFromTemplate.mockReset();
      Menu.buildFromTemplate.mockReturnValue(menuItems);
      onClick.mockReset();
      menuberMock.tray.listeners.mockReturnValue([onClick]);
      await core();
    });

    describe("click and double click event handler", () => {

      const syncFolder = "/tmp";
      let clickHandler, doubleClickhandler;
      beforeEach(() => {
        clickHandler = getTrayEventHandler("click");
        doubleClickhandler = getTrayEventHandler("double-click");
        utils.openDirectory.mockReset();
        getConfig.mockReset();
        getConfig.mockReturnValue(Promise.resolve({
          syncFolder: syncFolder,
        }));
      });

      it("sets a timer which invokes onClick after 250msec", () => {
        clickHandler();
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 250);
        expect(onClick).not.toHaveBeenCalled();
        jest.advanceTimersByTime(250);
        expect(onClick).toHaveBeenCalled();
      });

      it("invokes openDirecotory when double clicked", async () => {
        await doubleClickhandler();
        expect(getConfig).toHaveBeenCalled();
        expect(utils.openDirectory).toHaveBeenCalledWith(syncFolder);
      });

      it("doesn't invokes openDirectory when both click and double click event occur", async () => {
        clickHandler();
        await doubleClickhandler();
        jest.advanceTimersByTime(250);
        expect(onClick).not.toHaveBeenCalled();
      });

    });

    describe("right click event handler", () => {

      let handler;
      beforeEach(() => {
        menuberMock.tray.popUpContextMenu.mockReset();
        handler = getTrayEventHandler("right-click");
      });

      it("shows a context menu which has exit", () => {
        handler();
        expect(menuberMock.tray.popUpContextMenu).toHaveBeenCalledWith(menuItems);
        expect(Menu.buildFromTemplate).toHaveBeenCalledWith([{
          label: "exit",
          click: expect.any(Function)
        }]);
      });

      it("quits the app when the exit menu is clicked", async () => {
        await Menu.buildFromTemplate.mock.calls[0][0][0].click();
        expect(app.quit).toHaveBeenCalled();
      });

    });

  });

  describe("management of GUI event handlers", () => {

    beforeAll(() => {
      changeStateHandler.mockReturnValue("changeStateHandler");
      openSyncFolderHandler.mockReturnValue("openSyncFolderHandler");
      calculateUsedVolumeHandler.mockReturnValue("calculateUsedVolumeHandler");
    });

    beforeEach(() => {
      addListener.mockReset();
      changeStateHandler.mockClear();
      openSyncFolderHandler.mockClear();
      calculateUsedVolumeHandler.mockClear();
    });

    it("registers changeStateHandler", async () => {
      await core();
      expect(addListener).toHaveBeenCalledWith(ipcActionTypes.ChangeState, changeStateHandler());
      expect(changeStateHandler).toHaveBeenCalledWith(menuberMock);
    });

    it("registers openSyncFolderHandler", async () => {
      await core();
      expect(addListener).toHaveBeenCalledWith(ipcActionTypes.OpenSyncFolder, openSyncFolderHandler());
      expect(openSyncFolderHandler).toHaveBeenCalled();
    });

    it("registers calculateUsedVolumeHandler", async () => {
      await core();
      expect(addListener).toHaveBeenCalledWith(ipcActionTypes.CalculateUsedVolume, calculateUsedVolumeHandler());
      expect(calculateUsedVolumeHandler).toHaveBeenCalled();
    });

  });

  describe("sync-storj/sync-sia integration", () => {

    beforeAll(() => {
      updateStateHandler.mockReturnValue("updateStateHandler");
      siaFundEventHandler.mockReturnValue("siaFundEventHandler");
    });

    const syncFolder = "/tmp";
    let storjStart, storjOn, siaStart, siaOn;
    beforeEach(() => {
      storjStart = jest.spyOn(Storj.prototype, "start").mockImplementation(() => {
      });
      storjOn = jest.spyOn(Storj.prototype, "on").mockImplementation(() => {
      });
      siaStart = jest.spyOn(Sia.prototype, "start").mockImplementation(() => {
      });
      siaOn = jest.spyOn(Sia.prototype, "on").mockImplementation(() => {
      });
      installJRE.mockReset();
      dialog.showErrorBox.mockReset();
      updateStateHandler.mockClear();
      siaFundEventHandler.mockClear();
    });

    afterEach(() => {
      storjStart.mockRestore();
      storjOn.mockRestore();
      siaStart.mockRestore();
      siaOn.mockRestore();
    });

    it("installs JRE if not exists", async () => {
      await core();
      expect(installJRE).toHaveBeenCalled();
    });

    it("shows an error message and quits when the JRE installation is failed", async () => {
      const err = "expected error";
      installJRE.mockReturnValue(Promise.reject(err));

      await core();
      expect(installJRE).toHaveBeenCalled();
      expect(dialog.showErrorBox).toHaveBeenCalledWith("Goobox", `Cannot start Goobox: ${err}`);
      expect(app.quit).toHaveBeenCalled();
    });

    it("starts the storj backend if storj conf is true but not running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        storj: true,
        syncFolder: syncFolder,
      }));

      await core();
      expect(getConfig).toHaveBeenCalled();
      expect(storjStart).toHaveBeenCalledWith(syncFolder);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("registers updateStateHandler to the storj instance and listens syncState event", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        storj: true,
      }));

      await core();
      expect(getConfig).toHaveBeenCalled();
      expect(storjOn).toHaveBeenCalledWith("syncState", updateStateHandler());
      expect(updateStateHandler).toHaveBeenCalledWith(menuberMock);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("doesn't start the storj backend but registers updateStateHandler if it is already running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        storj: true,
      }));
      global.storj = {
        on: storjOn,
      };

      await core();
      expect(getConfig).toHaveBeenCalled();
      expect(storjStart).not.toHaveBeenCalled();
      expect(storjOn).toHaveBeenCalledWith("syncState", updateStateHandler());
      expect(updateStateHandler).toHaveBeenCalledWith(menuberMock);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("starts the sia backend if sia conf is true but not running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
        syncFolder: syncFolder
      }));

      await core();
      expect(getConfig).toHaveBeenCalled();
      expect(siaStart).toHaveBeenCalledWith(syncFolder);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("registers updateStateHandler to the sia instance and listens syncState event", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
      }));

      await core();
      expect(getConfig).toHaveBeenCalled();
      expect(siaOn).toHaveBeenCalledWith("syncState", updateStateHandler());
      expect(updateStateHandler).toHaveBeenCalledWith(menuberMock);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("registers siaFundEventHandler to the sia instance and listens walletInfo events", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
      }));

      await core();
      expect(getConfig).toHaveBeenCalled();
      expect(siaOn).toHaveBeenCalledWith("walletInfo", siaFundEventHandler());
      expect(siaFundEventHandler).toHaveBeenCalled();
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("doesn't start the sia backend but registers updateStateHandler if it is already running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
      }));
      global.sia = {
        on: siaOn,
      };

      await core();
      expect(getConfig).toHaveBeenCalled();
      expect(siaStart).not.toHaveBeenCalled();
      expect(siaOn).toHaveBeenCalledWith("syncState", updateStateHandler());
      expect(updateStateHandler).toHaveBeenCalledWith(menuberMock);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("closes the process if another process is already running", async () => {
      app.makeSingleInstance.mockReturnValueOnce(true);
      await core();
      expect(app.quit).toHaveBeenCalled();
    });

  });

});
