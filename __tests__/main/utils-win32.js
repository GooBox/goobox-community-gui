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

jest.mock("child_process");

import {spawnSync} from "child_process";

describe("utils module in Windows", () => {

  let originalPlatform;
  let utils;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "win32"
    });
    utils = require("../../src/main/utils").default;
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    });
  });

  beforeEach(() => {
    spawnSync.mockReset();
  });

  describe("openDirectory", () => {

    it("open a given directory with explorer", () => {
      const dir = "/tmp/some-dir";
      utils.openDirectory(dir);
      expect(spawnSync).toHaveBeenCalledWith("explorer.exe", [dir]);
    });

  });

  // describe("totalVolume", () => {
  //
  //   it("calculate total volume of a given directory with du", () => {
  //     const size = 12345;
  //     const dir = "/tmp/some-dir";
  //     // (dir -literalpath c:\work -recurse -force | measure-object Length -sum).Sum
  //   });
  //
  // });


});
