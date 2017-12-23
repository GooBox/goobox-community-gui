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

import {spawnSync, execFile} from "child_process";

describe("utils module for mac", () => {

  let originalPlatform;
  let utils;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "darwin"
    });
    utils = require("../../src/main-process/utils").default;
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    });
  });

  beforeEach(() => {
    spawnSync.mockReset();
    execFile.mockReset();
  });

  describe("openDirectory", () => {

    it("open a given directory with Finder", () => {
      const dir = "/tmp/some-dir";
      utils.openDirectory(dir);
      expect(spawnSync).toHaveBeenCalledWith("open", [dir]);
    });

  });

  describe("totalVolume", () => {

    it("calculate total volume of a given directory with du", () => {
      const size = 12345;
      const dir = "/tmp/some-dir";
      execFile.mockImplementation((cmd, args, cb) => {
        cb(null, `${size}\t${dir}`);
      });

      return utils.totalVolume(dir).then((res) => {
        expect(res).toEqual(size);
        expect(execFile).toHaveBeenCalledWith("du", ["-s", dir], expect.anything());
      });
    });

  });

});

