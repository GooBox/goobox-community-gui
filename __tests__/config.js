/*
 * Copyright (C) 2018 Junpei Kawamoto
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

import {remote} from "electron";
import {getConfig, saveConfig} from "../src/config";
import {ConfigFile} from "../src/constants";

const storage = remote.require("electron-json-storage");

describe("config module", () => {
  describe("getConfig function", () => {
    beforeEach(() => {
      storage.get.mockClear();
    });

    it("returns the config object", async () => {
      const cfg = "expected config object";
      storage.get.mockImplementationOnce((_, cb) => {
        cb(null, cfg);
      });

      await expect(getConfig()).resolves.toEqual(cfg);
      expect(storage.get).toHaveBeenCalledWith(
        ConfigFile,
        expect.any(Function)
      );
    });

    it("throws an error if failed to get the config object", async () => {
      const err = "expected err";
      storage.get.mockImplementationOnce((_, cb) => {
        cb(err);
      });

      await expect(getConfig()).rejects.toEqual(err);
      expect(storage.get).toHaveBeenCalledWith(
        ConfigFile,
        expect.any(Function)
      );
    });
  });

  describe("saveConfig function", () => {
    const cfg = "expected config object";
    beforeEach(() => {
      storage.set.mockClear();
    });

    it("sets a given object", async () => {
      await saveConfig(cfg);
      expect(storage.set).toHaveBeenCalledWith(
        ConfigFile,
        cfg,
        expect.any(Function)
      );
    });

    it("throws an error if failed to save the config object", async () => {
      const err = "expected err";
      storage.set.mockImplementationOnce((key, value, cb) => {
        cb(err);
      });
      await expect(saveConfig(cfg)).rejects.toEqual(err);
    });
  });
});
