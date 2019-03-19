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

import {app, shell} from "electron";
// noinspection ES6CheckImport
import {menubarMock} from "menubar";
import path from "path";
import {AppID, Idle, Paused, Synchronizing} from "../../../src/constants";
import {getConfig} from "../../../src/main/config";
import icons from "../../../src/main/icons";
import {notifyAsync} from "../../../src/main/notify";
import {
  calculateUsedVolumeHandler,
  changeStateHandler,
  openSyncFolderHandler,
  siaFundEventHandler,
  themeChangedHandler,
  updateStateHandler,
  willQuitHandler,
} from "../../../src/main/popup/handlers";
import utils from "../../../src/main/utils";

jest.mock("electron");
jest.mock("../../../src/main/config");
jest.mock("../../../src/main/utils");
jest.mock("../../../src/main/notify");

describe("handlers for the popup ", () => {
  beforeAll(() => {
    notifyAsync.mockResolvedValue(undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete global.storj;
    delete global.sia;
  });

  describe("handlers for the core app", () => {
    describe("changeStateHandler", () => {
      const dir = "/tmp";
      let handler;
      beforeAll(() => {
        getConfig.mockReturnValue({
          syncFolder: dir,
        });
      });

      beforeEach(() => {
        menubarMock.appState = null;
        handler = changeStateHandler(menubarMock);
      });

      it("sets the idle icon when the state is Synchronizing", async () => {
        await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
        expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
          icons.getSyncIcon()
        );
        expect(menubarMock.appState).toEqual(Synchronizing);
      });

      it("sets the paused icon when the state is Paused", async () => {
        await expect(handler(Paused)).resolves.toEqual(Paused);
        expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
          icons.getPausedIcon()
        );
        expect(menubarMock.appState).toEqual(Paused);
      });

      it("restart the Storj instance if exists when the new state is Synchronizing", async () => {
        const storj = {
          start: jest.fn(),
          stdout: {
            on: jest.fn(),
          },
        };
        global.storj = storj;
        await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
        expect(global.storj).toBe(storj);
        expect(global.storj.start).toHaveBeenCalledWith(dir);
      });

      it("closes the Storj instance if exists when the new state is Paused", async () => {
        const storj = {
          close: jest.fn(),
          stdout: {
            removeListener: jest.fn(),
          },
        };
        global.storj = storj;
        await expect(handler(Paused)).resolves.toEqual(Paused);
        expect(global.storj).toBe(storj);
        expect(global.storj.close).toHaveBeenCalled();
      });

      it("restart the Sia instance if exists when the new state is Synchronizing", async () => {
        const sia = {
          start: jest.fn(),
          stdout: {
            on: jest.fn(),
          },
        };
        global.sia = sia;
        await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
        expect(global.sia).toBe(sia);
        expect(global.sia.start).toHaveBeenCalledWith(dir);
      });

      it("closes the Sia instance if exists when the new state is Paused", async () => {
        const sia = {
          close: jest.fn(),
          stdout: {
            removeListener: jest.fn(),
          },
        };
        global.sia = sia;
        await expect(handler(Paused)).resolves.toEqual(Paused);
        expect(global.sia).toBe(sia);
        expect(global.sia.close).toHaveBeenCalled();
      });
    });

    describe("openSyncFolderHandler", () => {
      let handler;
      beforeEach(() => {
        handler = openSyncFolderHandler();
      });

      it("opens the sync folder", async () => {
        const syncFolder = "/tmp";
        getConfig.mockResolvedValueOnce({
          syncFolder,
        });

        await expect(handler()).resolves.not.toBeDefined();
        expect(getConfig).toHaveBeenCalled();
        expect(shell.openItem).toHaveBeenCalledWith(syncFolder);
      });
    });

    describe("usedVolumeHandler", () => {
      let handler;
      beforeEach(() => {
        handler = calculateUsedVolumeHandler();
      });

      it("calculate the volume of the sync folder", async () => {
        const syncFolder = "/tmp";
        getConfig.mockResolvedValueOnce({
          syncFolder,
        });

        const volume = 1234567;
        utils.totalVolume.mockResolvedValueOnce(volume);

        await expect(handler()).resolves.toEqual(volume);
        expect(getConfig).toHaveBeenCalled();
        expect(utils.totalVolume).toHaveBeenCalledWith(syncFolder);
      });
    });

    describe("core app will quit handler", () => {
      let handler;
      const event = {
        preventDefault: jest.fn(),
      };
      beforeEach(() => {
        handler = willQuitHandler(app);
      });

      afterEach(() => {
        delete global.storj;
        delete global.sia;
      });

      it("does not prevent when global.storj and global.sia are not defined", async () => {
        await handler(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(app.exit).not.toHaveBeenCalled();
      });

      it("does not prevent when global.storj is defined but is closed", async () => {
        global.storj = {
          closed: true,
        };
        await handler(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(app.exit).not.toHaveBeenCalled();
      });

      it("does not prevent when global.sia is defined but is closed", async () => {
        global.sia = {
          closed: true,
        };
        await handler(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(app.exit).not.toHaveBeenCalled();
      });

      it("prevents default when storj is running, closes the process, and exists", async () => {
        global.storj = {
          close: jest.fn().mockResolvedValue(null),
        };
        await handler(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(global.storj.close).toHaveBeenCalled();
        expect(app.exit).toHaveBeenCalled();
      });

      it("prevents default when sia is running, closes the process, and exists", async () => {
        global.sia = {
          close: jest.fn().mockResolvedValue(null),
        };
        await handler(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(global.sia.close).toHaveBeenCalled();
        expect(app.exit).toHaveBeenCalled();
      });
    });
  });

  describe("handlers for sync-storj/sync-sia apps", () => {
    describe("updateStateHandler", () => {
      let handler;
      beforeEach(async () => {
        menubarMock.appState = null;
        handler = updateStateHandler(menubarMock);
      });

      it("sets the synchronizing icon when receiving a synchronizing event", async () => {
        await expect(
          handler({newState: Synchronizing})
        ).resolves.not.toBeDefined();
        expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
          icons.getSyncIcon()
        );
        expect(menubarMock.appState).toEqual(Synchronizing);
      });

      it("sets the idle icon when receiving an idle event", async () => {
        await expect(handler({newState: Idle})).resolves.not.toBeDefined();
        expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
          icons.getIdleIcon()
        );
        expect(menubarMock.appState).toEqual(Idle);
      });
    });

    // describe("startSynchronizationHandler", () => {
    //
    //   let handler;
    //   beforeEach(() => {
    //     handler = startSynchronizationHandler();
    //   });
    //
    //   it("notifies the user the sia account preparation ends when newState argument is startSynchronization", async () => {
    //     await expect(handler({newState: "startSynchronization"})).resolves.not.toBeDefined();
    //     expect(notifyAsync).toHaveBeenCalledWith({
    //       title: "Goobox",
    //       message: "Your sia account is ready",
    //       icon: path.join(__dirname, "../../resources/goobox.png"),
    //       sound: true,
    //       wait: true,
    //       appID: AppID
    //     }, expect.any(Function));
    //   });
    //
    //   it("does nothing if newState argument isn't startSynchronization", async () => {
    //     await expect(handler({newState: Synchronizing})).resolves.not.toBeDefined();
    //     expect(notifier.notify).not.toHaveBeenCalled();
    //   });
    //
    // });

    describe("siaFundEventHandler", () => {
      let handler;
      beforeEach(() => {
        handler = siaFundEventHandler();
      });

      it("notifies the user that his/her current balance is 0", async () => {
        await expect(
          handler({eventType: "NoFunds"})
        ).resolves.not.toBeDefined();
        expect(notifyAsync).toHaveBeenCalledWith({
          title: "Goobox",
          message: "Your wallet doesn't have sia coins",
          icon: path.join(__dirname, "../../../src/resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID,
        });
      });

      it("notifies the user that his/her funds are insufficient", async () => {
        const message = "sample message";
        await expect(
          handler({eventType: "InsufficientFunds", message})
        ).resolves.not.toBeDefined();
        expect(notifyAsync).toHaveBeenCalledWith({
          title: "Goobox",
          message,
          icon: path.join(__dirname, "../../../src/resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID,
        });
      });

      it("notifies the user that a fund allocation has been succeeded", async () => {
        const message = "sample message";
        await expect(
          handler({eventType: "Allocated", message})
        ).resolves.not.toBeDefined();
        expect(notifyAsync).toHaveBeenCalledWith({
          title: "Goobox",
          message,
          icon: path.join(__dirname, "../../../src/resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID,
        });
      });

      it("notifies the user when an error occurs", async () => {
        const message = "sample message";
        await expect(
          handler({eventType: "Error", message})
        ).resolves.not.toBeDefined();
        expect(notifyAsync).toHaveBeenCalledWith({
          title: "Goobox",
          message,
          icon: path.join(__dirname, "../../../src/resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID,
        });
      });

      it("does nothing for other events", async () => {
        await expect(
          handler({eventType: "AnotherEvent"})
        ).resolves.not.toBeDefined();
        expect(notifyAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe("AppleInterfaceThemeChangedNotification event handler (themeChangedHandler)", () => {
    let handler;
    beforeEach(() => {
      menubarMock.appState = null;
      handler = themeChangedHandler(menubarMock);
    });

    it("sets idle icon if appState is Idle", async () => {
      menubarMock.appState = Idle;
      await expect(handler()).resolves.not.toBeDefined();
      expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
        icons.getIdleIcon()
      );
    });

    it("sets synchronizing icon if appState is Synchronizing", async () => {
      menubarMock.appState = Synchronizing;
      await expect(handler()).resolves.not.toBeDefined();
      expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
        icons.getSyncIcon()
      );
    });

    it("sets paused icon if appState is Paused", async () => {
      menubarMock.appState = Paused;
      await expect(handler()).resolves.not.toBeDefined();
      expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
        icons.getPausedIcon()
      );
    });

    it("sets idle icon if appState isn't defined", async () => {
      await expect(handler()).resolves.not.toBeDefined();
      expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
        icons.getIdleIcon()
      );
    });
  });
});
