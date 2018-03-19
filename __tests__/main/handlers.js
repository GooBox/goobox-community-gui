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

jest.mock("electron");
jest.mock("node-notifier");
jest.mock("../../src/main/jre");
jest.mock("../../src/main/config");
jest.mock("../../src/main/utils");
jest.mock("../../src/main/core");
jest.mock("../../src/main/desktop");

import {app} from "electron";
import {menubarMock} from "menubar";
import notifier from "node-notifier";
import path from "path"
import {AppID, Idle, Paused, Synchronizing} from "../../src/constants";
import {getConfig} from "../../src/main/config";
import {core} from "../../src/main/core";
import * as desktop from "../../src/main/desktop";
import {
  calculateUsedVolumeHandler,
  changeStateHandler,
  installerWindowAllClosedHandler,
  installJREHandler,
  openSyncFolderHandler,
  siaFundEventHandler,
  siaRequestWalletInfoHandler,
  startSynchronizationHandler,
  stopSyncAppsHandler,
  storjCreateAccountHandler,
  storjLoginHandler,
  themeChangedHandler,
  updateStateHandler,
  willQuitHandler,
} from "../../src/main/handlers";
import icons from "../../src/main/icons";
import {installJRE} from "../../src/main/jre";
import Sia from "../../src/main/sia";
import Storj from "../../src/main/storj";
import utils from "../../src/main/utils";

describe("event handlers", () => {

  afterEach(() => {
    delete global.storj;
    delete global.sia;
  });

  describe("handlers for the core app", () => {

    describe("changeStateHandler", () => {

      const dir = "/tmp";
      let handler;
      beforeEach(() => {
        menubarMock.appState = null;
        menubarMock.tray.setImage.mockClear();
        handler = changeStateHandler(menubarMock);
        getConfig.mockReset();
        getConfig.mockReturnValue({
          syncFolder: dir,
        });
      });

      it("sets the idle icon when the state is Synchronizing", async () => {
        await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
        expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
        expect(menubarMock.appState).toEqual(Synchronizing);
      });

      it("sets the paused icon when the state is Paused", async () => {
        await expect(handler(Paused)).resolves.toEqual(Paused);
        expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getPausedIcon());
        expect(menubarMock.appState).toEqual(Paused);
      });

      it("restart the Storj instance if exists when the new state is Synchronizing", async () => {
        const storj = {
          start: jest.fn(),
          stdout: {
            on: jest.fn()
          }
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
          }
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
            on: jest.fn()
          }
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
          }
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
        utils.openDirectory.mockReset();
      });

      it("opens the sync folder", async () => {
        const syncFolder = "/tmp";
        getConfig.mockReturnValue(Promise.resolve({
          syncFolder: syncFolder,
        }));

        await expect(handler()).resolves.not.toBeDefined();
        expect(getConfig).toHaveBeenCalled();
        expect(utils.openDirectory).toHaveBeenCalledWith(syncFolder);
      });

    });

    describe("usedVolumeHandler", () => {

      let handler;
      beforeEach(() => {
        handler = calculateUsedVolumeHandler();
        utils.totalVolume.mockReset();
      });

      it("calculate the volume of the sync folder", async () => {
        const syncFolder = "/tmp";
        getConfig.mockReturnValue(Promise.resolve({
          syncFolder: syncFolder,
        }));

        const volume = 1234567;
        utils.totalVolume.mockReturnValue(Promise.resolve(volume));

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
        app.exit.mockReset();
        event.preventDefault.mockReset();
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
          close: jest.fn().mockReturnValue(Promise.resolve())
        };
        await handler(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(global.storj.close).toHaveBeenCalled();
        expect(app.exit).toHaveBeenCalled();
      });

      it("prevents default when sia is running, closes the process, and exists", async () => {
        global.sia = {
          close: jest.fn().mockReturnValue(Promise.resolve())
        };
        await handler(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(global.sia.close).toHaveBeenCalled();
        expect(app.exit).toHaveBeenCalled();
      });
    });

  });

  describe("handlers for the installer", () => {

    describe("installJRE handler", () => {

      let handler;
      beforeEach(() => {
        handler = installJREHandler();
        installJRE.mockReset();
      });

      it("installs JRE and returns the if the installation succeeds", async () => {
        const res = true;
        installJRE.mockReturnValue(Promise.resolve(res));
        await expect(handler()).resolves.toEqual(res);
        expect(installJRE).toHaveBeenCalledWith();
      });

      it("installs JRE and returns a rejected promise with an error messages if the installation fails", async () => {
        const err = "expected error";
        installJRE.mockReturnValue(Promise.reject(err));
        await expect(handler()).rejects.toEqual(err);
        expect(installJRE).toHaveBeenCalledWith();
      });

    });

    describe("siaRequestWalletInfo handler", () => {

      const address = "0x01234567890";
      const seed = "hello world";
      const dir = "/tmp";
      let handler, wallet, start, once;
      beforeEach(() => {
        handler = siaRequestWalletInfoHandler();
        wallet = jest.spyOn(Sia.prototype, "wallet").mockReturnValue(Promise.resolve({
          "wallet address": address,
          "primary seed": seed,
        }));
        start = jest.spyOn(Sia.prototype, "start").mockImplementation(() => {
        });
        once = jest.spyOn(Sia.prototype, "once");
      });

      afterEach(() => {
        wallet.mockRestore();
        start.mockRestore();
        once.mockRestore();
        delete global.sia;
      });

      it("creates a sia instance, calls the wallet method of the sia instance, and returns the result", async () => {
        expect(global.sia).not.toBeDefined();
        await expect(handler({syncFolder: dir})).resolves.toEqual({
          address: address,
          seed: seed,
        });
        expect(global.sia).toBeDefined();
        expect(wallet).toHaveBeenCalledWith();
      });

      it("reuses the sia instance, calls the wallet method of the sia instance if a sia instance exists", async () => {
        const sia = new Sia();
        global.sia = sia;
        await expect(handler({syncFolder: dir})).resolves.toEqual({
          address: address,
          seed: seed,
        });
        expect(global.sia).toBe(sia);
        expect(wallet).toHaveBeenCalledWith();
      });

      it("starts the sync sia app with reset option", async () => {
        await handler({syncFolder: dir});
        expect(getConfig).toHaveBeenCalled();
        expect(start).toHaveBeenCalledWith(dir, true);
        expect(global.sia instanceof Sia).toBeTruthy();
      });

      it("returns a rejected promise with the error message when the wallet command returns an error", async () => {
        const error = "expected error";
        wallet.mockReturnValue(Promise.reject(error));
        await expect(handler({syncFolder: dir})).rejects.toEqual(error);
        expect(start).not.toHaveBeenCalled();
      });

    });

    describe("stopSyncApps handler", () => {

      let handler;
      beforeEach(() => {
        handler = stopSyncAppsHandler();
      });

      it("calls storj.close and deletes global.storj if exists", async () => {
        const close = jest.fn();
        global.storj = {
          close: close
        };
        await expect(handler());
        expect(close).toHaveBeenCalled();
        expect(global.storj).not.toBeDefined();
      });

      it("calls sia.close and deletes global.sia if exists", async () => {
        const close = jest.fn();
        global.sia = {
          close: close
        };
        await expect(handler());
        expect(close).toHaveBeenCalled();
        expect(global.sia).not.toBeDefined();
      });

    });

    describe("storjLogin handler", () => {

      const email = "abc@example.com";
      const password = "password";
      const key = "xxx xxx xxx";
      const dir = "/tmp";
      let handler, start, checkMnemonic, login;
      beforeEach(() => {
        handler = storjLoginHandler();
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

      it("starts a Storj instance with reset option and calls checkMnemonic and login methods", async () => {
        expect(global.storj).not.toBeDefined();
        await expect(handler({
          email: email,
          password: password,
          encryptionKey: key,
          syncFolder: dir,
        })).resolves.not.toBeDefined();
        expect(global.storj).toBeDefined();
        expect(start).toHaveBeenCalledWith(dir, true);
        expect(checkMnemonic).toHaveBeenCalledWith(key);
        expect(login).toHaveBeenCalledWith(email, password, key);
      });

      it("closes the Storj instance if exists before starting a new Storj instance", async () => {
        const close = jest.fn().mockReturnValue(Promise.resolve());
        global.storj = new Storj();
        global.storj.proc = {};
        global.storj.close = close;

        await expect(handler({
          email: email,
          password: password,
          encryptionKey: key,
          syncFolder: dir,
        })).resolves.not.toBeDefined();
        expect(close).toHaveBeenCalled();
        expect(global.storj).toBeDefined();
        expect(start).toHaveBeenCalledWith(dir, true);
        expect(checkMnemonic).toHaveBeenCalledWith(key);
        expect(login).toHaveBeenCalledWith(email, password, key);
      });

      it("returns an error message if checkMnemonic fails", async () => {
        const err = "expected error";
        checkMnemonic.mockReturnValue(Promise.reject(err));

        await expect(handler({
          email: email,
          password: password,
          encryptionKey: key,
          syncFolder: dir,
        })).rejects.toEqual({
          error: err,
          email: false,
          password: false,
          encryptionKey: true,
        });
        expect(start).toHaveBeenCalledWith(dir, true);
        expect(checkMnemonic).toHaveBeenCalledWith(key);
        expect(login).not.toHaveBeenCalledWith(email, password, key);
      });

      it("returns an error message if login fails", async () => {
        const err = "expected error";
        login.mockReturnValue(Promise.reject(err));

        await expect(handler({
          email: email,
          password: password,
          encryptionKey: key,
          syncFolder: dir,
        })).rejects.toEqual({
          error: err,
          email: true,
          password: true,
          encryptionKey: false,
        });
        expect(start).toHaveBeenCalledWith(dir, true);
        expect(checkMnemonic).toHaveBeenCalledWith(key);
        expect(login).toHaveBeenCalledWith(email, password, key);
      });

    });

    describe("storjCreateAccount handler", () => {

      const email = "abc@example.com";
      const password = "password";
      const key = "xxx xxx xxx";
      const syncFolder = "/tmp";
      let handler, start, createAccount;
      beforeEach(() => {
        handler = storjCreateAccountHandler();
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

      it("starts Storj instance with reset option, calls createAccount method, and returns a key", async () => {
        expect(global.storj).not.toBeDefined();
        await expect(handler({
          email: email,
          password: password,
          syncFolder: syncFolder,
        })).resolves.toEqual(key);
        expect(global.storj).toBeDefined();
        expect(start).toHaveBeenCalledWith(syncFolder, true);
        expect(createAccount).toHaveBeenCalledWith(email, password);
      });

      it("closes the Storj instance if exists before starting a new Storj instance", async () => {
        const close = jest.fn().mockReturnValue(Promise.resolve());
        global.storj = new Storj();
        global.storj.proc = {};
        global.storj.close = close;

        await expect(handler({
          email: email,
          password: password,
          syncFolder: syncFolder,
        })).resolves.toEqual(key);
        expect(close).toHaveBeenCalled();
        expect(global.storj).toBeDefined();
        expect(start).toHaveBeenCalledWith(syncFolder, true);
        expect(createAccount).toHaveBeenCalledWith(email, password);
      });

      it("returns an error message when creating an account fails", async () => {
        const err = "expected error";
        createAccount.mockReturnValue(Promise.reject(err));

        await expect(handler({
          email: email,
          password: password,
          syncFolder: syncFolder,
        })).rejects.toEqual(err);
        expect(start).toHaveBeenCalledWith(syncFolder, true);
        expect(createAccount).toHaveBeenCalledWith(email, password);
      });

    });

    describe("installerWindowAllClosedHandler", () => {

      let onWindowAllClosed;
      beforeEach(() => {
        app.quit.mockReset();
        desktop.register.mockReturnValue(null);
        core.mockClear().mockReturnValue(Promise.resolve());
        onWindowAllClosed = installerWindowAllClosedHandler(app);
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

      it("registers startSynchronizationHandler when the user chooses sia", async () => {
        getConfig.mockReturnValue(Promise.resolve({
          installed: true,
          sia: true,
        }));
        global.sia = {
          once: jest.fn(),
        };

        await onWindowAllClosed();
        expect(global.sia.once).toHaveBeenCalledWith("syncState", expect.any(Function));
        expect(global.sia.once.mock.calls[0][1].toString()).toEqual(startSynchronizationHandler().toString());
      });

      it("registers a folder icon before starting the core app", async () => {
        const dir = "/tmp";
        getConfig.mockReturnValue(Promise.resolve({
          installed: true,
          syncFolder: dir,
        }));
        await onWindowAllClosed();
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

  describe("handlers for sync-storj/sync-sia apps", () => {

    describe("updateStateHandler", () => {

      let handler;
      beforeEach(async () => {
        menubarMock.appState = null;
        menubarMock.tray.setImage.mockReset();
        handler = updateStateHandler(menubarMock);
      });

      it("sets the synchronizing icon when receiving a synchronizing event", async () => {
        await expect(handler({newState: "synchronizing"})).resolves.not.toBeDefined();
        expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
        expect(menubarMock.appState).toEqual(Synchronizing);
      });

      it("sets the idle icon when receiving an idle event", async () => {
        await expect(handler({newState: "idle"})).resolves.not.toBeDefined();
        expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
        expect(menubarMock.appState).toEqual(Idle);
      });

    });

    describe("startSynchronizationHandler", () => {

      let handler;
      beforeEach(() => {
        handler = startSynchronizationHandler();
        notifier.notify.mockReset();
        notifier.notify.mockImplementation((_, cb) => cb());
      });

      it("notifies the user the sia account preparation ends when newState argument is startSynchronization", async () => {
        await expect(handler({newState: "startSynchronization"})).resolves.not.toBeDefined();
        expect(notifier.notify).toHaveBeenCalledWith({
          title: "Goobox",
          message: "Your sia account is ready",
          icon: path.join(__dirname, "../../resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID
        }, expect.any(Function));
      });

      it("does nothing if newState argument isn't startSynchronization", async () => {
        await expect(handler({newState: "synchronizing"})).resolves.not.toBeDefined();
        expect(notifier.notify).not.toHaveBeenCalled();
      });

    });

    describe("siaFundInfoHandler", () => {

      let handler;
      beforeEach(() => {
        handler = siaFundEventHandler();
        notifier.notify.mockReset();
        notifier.notify.mockImplementation((_, cb) => cb());
      });

      it("notifies the user that his/her current balance is 0", async () => {
        await expect(handler({eventType: "NoFunds"})).resolves.not.toBeDefined();
        expect(notifier.notify).toHaveBeenCalledWith({
          title: "Goobox",
          message: "Your wallet doesn't have sia coins",
          icon: path.join(__dirname, "../../resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID
        }, expect.any(Function));
      });

      it("notifies the user that his/her funds are insufficient", async () => {
        const message = "sample message";
        await expect(handler({eventType: "InsufficientFunds", message: message})).resolves.not.toBeDefined();
        expect(notifier.notify).toHaveBeenCalledWith({
          title: "Goobox",
          message: message,
          icon: path.join(__dirname, "../../resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID
        }, expect.any(Function));
      });

      it("notifies the user that a fund allocation has been succeeded", async () => {
        const message = "sample message";
        await expect(handler({eventType: "Allocated", message: message})).resolves.not.toBeDefined();
        expect(notifier.notify).toHaveBeenCalledWith({
          title: "Goobox",
          message: message,
          icon: path.join(__dirname, "../../resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID
        }, expect.any(Function));
      });

      it("notifies the user when an error occurs", async () => {
        const message = "sample message";
        await expect(handler({eventType: "Error", message: message})).resolves.not.toBeDefined();
        expect(notifier.notify).toHaveBeenCalledWith({
          title: "Goobox",
          message: message,
          icon: path.join(__dirname, "../../resources/goobox.png"),
          sound: true,
          wait: true,
          appID: AppID
        }, expect.any(Function));
      });

      it("does nothing for other events", async () => {
        await expect(handler({eventType: "AnotherEvent"})).resolves.not.toBeDefined();
        expect(notifier.notify).not.toHaveBeenCalled();
      });

    });

  });

});

describe("AppleInterfaceThemeChangedNotification event handler", () => {

  let handler;
  beforeEach(() => {
    menubarMock.appState = null;
    menubarMock.tray.setImage.mockClear();
    handler = themeChangedHandler(menubarMock);
  });

  it("sets idle icon if appState is Idle", async () => {
    menubarMock.appState = Idle;
    await expect(handler()).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
  });

  it("sets synchronizing icon if appState is Synchronizing", async () => {
    menubarMock.appState = Synchronizing;
    await expect(handler()).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
  });

  it("sets paused icon if appState is Paused", async () => {
    menubarMock.appState = Paused;
    await expect(handler()).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getPausedIcon());
  });

  it("sets idle icon if appState isn't defined", async () => {
    await expect(handler()).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
  });

});