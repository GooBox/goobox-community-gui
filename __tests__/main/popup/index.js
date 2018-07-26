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

import {app, BrowserWindow, dialog, Menu, systemPreferences} from "electron";
import {menubar, menubarMock} from "menubar";
import path from "path";
import {Idle, Synchronizing} from "../../../src/constants";
import * as ipcActionTypes from "../../../src/ipc/constants";
import addListener from "../../../src/ipc/receiver";
import {getConfig} from "../../../src/main/config";
import * as desktop from "../../../src/main/desktop";
import icons from "../../../src/main/icons";
import {installJRE} from "../../../src/main/jre";
import {
  calculateUsedVolumeHandler,
  changeStateHandler,
  openSyncFolderHandler,
  siaFundEventHandler,
  themeChangedHandler,
  updateStateHandler,
  willQuitHandler,
} from "../../../src/main/popup/handlers";
import popup, {DefaultHeight, DefaultWidth} from "../../../src/main/popup/index";
import Sia from "../../../src/main/sia";
import Storj from "../../../src/main/storj";
import utils from "../../../src/main/utils";

jest.mock("electron");
jest.mock("../../../src/main/jre");
jest.mock("../../../src/main/desktop");
jest.mock("../../../src/main/config");
jest.mock("../../../src/main/utils");
jest.mock("../../../src/ipc/receiver");
jest.mock("../../../src/main/popup/handlers");
jest.useFakeTimers();

function getEventHandler(emitter, event) {
  return emitter.on.mock.calls.filter(args => args[0] === event).map(args => args[1])[0];
}

describe("main process of the popup app", () => {

  const syncFolder = "/tmp";
  let originalPlatform;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "darwin"
    });
    desktop.register.mockImplementation(() => {
    });
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    });
  });

  beforeEach(() => {
    menubarMock.tray.listeners.mockReturnValue([() => null]);
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete global.storj;
    delete global.sia;
    getConfig.mockReset();
  });

  it("create a menu bar instance", async () => {
    const setSkipTaskbar = jest.spyOn(BrowserWindow.prototype, "setSkipTaskbar");
    try {
      await popup();
      expect(menubar).toHaveBeenCalledWith({
        index: `file://${path.join(__dirname, "../../../src/static/popup.html")}`,
        icon: icons.getSyncIcon(),
        tooltip: app.getName(),
        preloadWindow: true,
        width: DefaultWidth,
        height: DefaultHeight,
        alwaysOnTop: true,
        showDockIcon: false,
      });
      expect(setSkipTaskbar).toHaveBeenCalledWith(true);
      expect(menubarMock.appState).toEqual(Synchronizing);
    } finally {
      setSkipTaskbar.mockRestore();
    }
  });

  it("registers willQuitEventHandler", async () => {
    const handler = "expected handler";
    willQuitHandler.mockReturnValue(handler);
    await popup();
    expect(menubarMock.app.on).toHaveBeenCalledWith("will-quit", handler);
    expect(willQuitHandler).toHaveBeenCalledWith(menubarMock.app);
  });

  it("subscribes AppleInterfaceThemeChangedNotification event", async () => {
    const cb = "cb";
    themeChangedHandler.mockReset().mockReturnValue(cb);

    await popup();
    expect(systemPreferences.subscribeNotification).toHaveBeenCalledWith("AppleInterfaceThemeChangedNotification", cb);
    expect(themeChangedHandler).toHaveBeenCalledWith(menubarMock);
  });

  it("prepare desktop integration", async () => {
    getConfig.mockReturnValue(Promise.resolve({
      syncFolder,
    }));
    await popup();
    expect(desktop.register).toHaveBeenCalledWith(syncFolder);
  });

  describe("system tray event handlers", () => {

    const getTrayEventHandler = event => getEventHandler(menubarMock.tray, event);
    const menuItems = "sample menue items";
    const onClick = jest.fn();

    beforeEach(async () => {
      Menu.buildFromTemplate.mockReset();
      Menu.buildFromTemplate.mockReturnValue(menuItems);
      onClick.mockReset();
      menubarMock.tray.listeners.mockReturnValue([onClick]);
      await popup();
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
          syncFolder,
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
        menubarMock.tray.popUpContextMenu.mockReset();
        handler = getTrayEventHandler("right-click");
      });

      it("shows a context menu which has exit", () => {
        handler();
        expect(menubarMock.tray.popUpContextMenu).toHaveBeenCalledWith(menuItems);
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
    });

    it("registers changeStateHandler", async () => {
      await popup();
      expect(addListener).toHaveBeenCalledWith(ipcActionTypes.ChangeState, changeStateHandler());
      expect(changeStateHandler).toHaveBeenCalledWith(menubarMock);
    });

    it("registers openSyncFolderHandler", async () => {
      await popup();
      expect(addListener).toHaveBeenCalledWith(ipcActionTypes.OpenSyncFolder, openSyncFolderHandler());
      expect(openSyncFolderHandler).toHaveBeenCalled();
    });

    it("registers calculateUsedVolumeHandler", async () => {
      await popup();
      expect(addListener).toHaveBeenCalledWith(ipcActionTypes.CalculateUsedVolume, calculateUsedVolumeHandler());
      expect(calculateUsedVolumeHandler).toHaveBeenCalled();
    });

  });

  describe("sync-storj/sync-sia integration", () => {

    beforeAll(() => {
      updateStateHandler.mockReturnValue("updateStateHandler");
      siaFundEventHandler.mockReturnValue("siaFundEventHandler");
    });

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
    });

    afterEach(() => {
      storjStart.mockRestore();
      storjOn.mockRestore();
      siaStart.mockRestore();
      siaOn.mockRestore();
    });

    it("installs JRE if not exists", async () => {
      await popup();
      expect(installJRE).toHaveBeenCalled();
    });

    it("shows an error message and quits when the JRE installation is failed", async () => {
      const err = "expected error";
      installJRE.mockReturnValue(Promise.reject(err));

      await popup();
      expect(installJRE).toHaveBeenCalled();
      expect(dialog.showErrorBox).toHaveBeenCalledWith("Goobox", `Cannot start Goobox: ${err}`);
      expect(app.quit).toHaveBeenCalled();
    });

    it("starts the storj backend if storj conf is true but not running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        storj: true,
        syncFolder,
      }));

      await popup();
      expect(getConfig).toHaveBeenCalled();
      expect(storjStart).toHaveBeenCalledWith(syncFolder);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("registers updateStateHandler to the storj instance and listens syncState event", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        storj: true,
      }));

      await popup();
      expect(getConfig).toHaveBeenCalled();
      expect(storjOn).toHaveBeenCalledWith("syncState", updateStateHandler());
      expect(updateStateHandler).toHaveBeenCalledWith(menubarMock);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("doesn't start the storj backend but registers updateStateHandler if it is already running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        storj: true,
      }));
      global.storj = {
        on: storjOn,
      };

      await popup();
      expect(getConfig).toHaveBeenCalled();
      expect(storjStart).not.toHaveBeenCalled();
      expect(storjOn).toHaveBeenCalledWith("syncState", updateStateHandler());
      expect(updateStateHandler).toHaveBeenCalledWith(menubarMock);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("starts the sia backend if sia conf is true but not running", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
        syncFolder
      }));

      await popup();
      expect(getConfig).toHaveBeenCalled();
      expect(siaStart).toHaveBeenCalledWith(syncFolder);
      expect(app.quit).not.toHaveBeenCalled();

      expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
      expect(menubarMock.appState).toEqual(Synchronizing);
    });

    it("registers updateStateHandler to the sia instance and listens syncState event", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
      }));

      await popup();
      expect(getConfig).toHaveBeenCalled();
      expect(siaOn).toHaveBeenCalledWith("syncState", updateStateHandler());
      expect(updateStateHandler).toHaveBeenCalledWith(menubarMock);
      expect(app.quit).not.toHaveBeenCalled();
    });

    it("registers siaFundEventHandler to the sia instance and listens walletInfo events", async () => {
      getConfig.mockReturnValue(Promise.resolve({
        sia: true,
      }));

      await popup();
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
        syncState: Idle,
      };

      await popup();
      expect(getConfig).toHaveBeenCalled();
      expect(siaStart).not.toHaveBeenCalled();
      expect(siaOn).toHaveBeenCalledWith("syncState", updateStateHandler());
      expect(updateStateHandler).toHaveBeenCalledWith(menubarMock);
      expect(app.quit).not.toHaveBeenCalled();

      expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
      expect(menubarMock.appState).toEqual(Idle);
    });

    it("closes the process if another process is already running", async () => {
      app.makeSingleInstance.mockReturnValueOnce(true);
      await popup();
      expect(app.quit).toHaveBeenCalled();
    });

  });

});
