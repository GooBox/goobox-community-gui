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

jest.mock("../../src/main/config");
jest.mock("../../src/main/utils");
import {menuberMock} from "menubar";
import {Paused, Synchronizing} from "../../src/constants";
import {getConfig} from "../../src/main/config";
import {calculateUsedVolumeHandler, changeStateHandler, openSyncFolderHandler} from "../../src/main/handlers";
import icons from "../../src/main/icons";
import utils from "../../src/main/utils";

describe("IPC event handlers", () => {

  describe("changeStateHandler", () => {

    let handler;
    beforeEach(() => {
      menuberMock.tray.setImage.mockClear();
      handler = changeStateHandler(menuberMock, null, null);
      delete global.storj;
      delete global.sia;
    });

    it("sets the idle icon when the state is Synchronizing", async () => {
      await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
      expect(menuberMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
    });

    it("sets the paused icon when the state is Paused", async () => {
      await expect(handler(Paused)).resolves.toEqual(Paused);
      expect(menuberMock.tray.setImage).toHaveBeenCalledWith(icons.getPausedIcon());
    });

    it("restart the Storj instance if exists when the new state is Synchronizing", async () => {
      global.storj = {
        start: jest.fn(),
        stdout: {
          on: jest.fn()
        }
      };
      await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
      expect(global.storj.start).toHaveBeenCalled();
      // expect(global.storj.stdout.on).toHaveBeenCalledWith("line", expect.any(Function));
    });

    it("closes the Storj instance if exists when the new state is Paused", async () => {
      global.storj = {
        close: jest.fn(),
        stdout: {
          removeListener: jest.fn(),
        }
      };
      await expect(handler(Paused)).resolves.toEqual(Paused);
      expect(global.storj.close).toHaveBeenCalled();
      // expect(global.storj.stdout.removeListener).toHaveBeenCalledWith("line", expect.any(Function));
    });

    it("restart the Sia instance if exists when the new state is Synchronizing", async () => {
      global.sia = {
        start: jest.fn(),
        stdout: {
          on: jest.fn()
        }
      };
      await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
      expect(global.sia.start).toHaveBeenCalled();
      // expect(global.sia.stdout.on).toHaveBeenCalledWith("line", expect.any(Function));
    });

    it("closes the Sia instance if exists when the new state is Paused", async () => {
      global.sia = {
        close: jest.fn(),
        stdout: {
          removeListener: jest.fn(),
        }
      };
      await expect(handler(Paused)).resolves.toEqual(Paused);
      expect(global.sia.close).toHaveBeenCalled();
      // expect(global.sia.stdout.removeListener).toHaveBeenCalledWith("line", expect.any(Function));
    });

  });

  describe("OpenSyncFolderHandler", () => {

    let handler;
    beforeEach(async () => {
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

  describe("UsedVolumeHandler", () => {

    let handler;
    beforeEach(async () => {
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

      await expect(handler()).resolves.toEqual(volume / 1024 / 1024);
      expect(getConfig).toHaveBeenCalled();
      expect(utils.totalVolume).toHaveBeenCalledWith(syncFolder);
    });

  });

});
