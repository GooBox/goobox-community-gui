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

import {execFileSync} from "child_process";
import {app, BrowserWindow} from "electron";
import fs from "fs";
import path from "path";
import * as actionTypes from "../../../src/ipc/constants";
import addListener from "../../../src/ipc/receiver";
import {getConfig} from "../../../src/main/config";
import {
  installerWindowAllClosedHandler,
  installJREHandler,
  siaRequestWalletInfoHandler,
  stopSyncAppsHandler,
  storjCreateAccountHandler,
  storjGenerateMnemonicHandler,
  storjLoginHandler,
} from "../../../src/main/installer/handlers";
import installer from "../../../src/main/installer/index";

jest.mock("child_process");
jest.mock("electron");
jest.mock("fs");
jest.mock("../../../src/main/config");
jest.mock("../../../src/ipc/receiver");
jest.mock("../../../src/main/popup");
jest.mock("../../../src/main/installer/handlers");

describe("installer", () => {
  beforeAll(() => {
    installerWindowAllClosedHandler.mockReturnValue(
      "installerWindowAllClosedHandler"
    );
  });

  let mockLoadFile;
  beforeEach(() => {
    mockLoadFile = jest.spyOn(BrowserWindow.prototype, "loadFile");
    getConfig.mockReset();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockLoadFile.mockRestore();
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
    expect(mockLoadFile).toHaveBeenCalledWith(
      `${path.join(__dirname, "../../../src/main/installer.html")}`
    );
  });

  it("registers installerWindowAllClosedHandler", () => {
    installer();
    expect(app.on).toHaveBeenCalledWith(
      "window-all-closed",
      installerWindowAllClosedHandler()
    );
    expect(installerWindowAllClosedHandler).toHaveBeenCalledWith(app);
  });

  describe("management of GUI event handlers", () => {
    beforeAll(() => {
      installJREHandler.mockReturnValue("installJREHandler");
      siaRequestWalletInfoHandler.mockReturnValue(
        "siaRequestWalletInfoHandler"
      );
      stopSyncAppsHandler.mockReturnValue("stopSyncAppsHandler");
      storjGenerateMnemonicHandler.mockReturnValue(
        "storjGenerateMnemonicHandler"
      );
      storjLoginHandler.mockReturnValue("storjLoginHandler");
      storjCreateAccountHandler.mockReturnValue("storjCreateAccountHandler");
    });

    beforeEach(() => {
      addListener.mockReset();
    });

    it("registers installJREHandler", () => {
      installer();
      expect(addListener).toHaveBeenCalledWith(
        actionTypes.InstallJRE,
        installJREHandler()
      );
    });

    it("registers storjGenerateMnemonicHandler", () => {
      installer();
      expect(addListener).toHaveBeenCalledWith(
        actionTypes.StorjGenerateMnemonic,
        storjGenerateMnemonicHandler()
      );
    });

    it("registers storjLoginHandler", () => {
      installer();
      expect(addListener).toHaveBeenCalledWith(
        actionTypes.StorjLogin,
        storjLoginHandler()
      );
    });

    it("registers storjCreateAccountHandler", () => {
      installer();
      expect(addListener).toHaveBeenCalledWith(
        actionTypes.StorjCreateAccount,
        storjCreateAccountHandler()
      );
    });

    it("registers siaRequestWalletInfoHandler", () => {
      installer();
      expect(addListener).toHaveBeenCalledWith(
        actionTypes.SiaRequestWalletInfo,
        siaRequestWalletInfoHandler()
      );
    });

    it("registers stopSyncAppsHandler", () => {
      installer();
      expect(addListener).toHaveBeenCalledWith(
        actionTypes.StopSyncApps,
        stopSyncAppsHandler()
      );
    });
  });

  describe("in macOS", () => {
    const oldPlatform = process.platform;
    beforeAll(() => {
      Object.defineProperty(process, "platform", {
        value: "darwin",
      });
    });

    afterAll(() => {
      Object.defineProperty(process, "platform", {
        value: oldPlatform,
      });
    });

    it("starts the FinderSync extension", () => {
      installer();
      expect(execFileSync).toHaveBeenCalledWith("pluginkit", [
        "-e",
        "use",
        "-i",
        "com.liferay.nativity.LiferayFinderSync",
      ]);
    });
  });
});
