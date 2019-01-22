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

import {spawn, spawnSync} from "child_process";
import * as path from "path";
import {PassThrough} from "stream";

jest.mock("child_process");

describe("utils module in Windows", () => {
  let originalPlatform;
  let utils;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    utils = require("../../src/main/utils").default;
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
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

  describe("totalVolume", () => {
    it("calculate total volume of a given directory with du", async () => {
      const file1 = 12345;
      const file2 = 123450;
      const dir = "/tmp/some-dir";

      const stdout = new PassThrough();
      const on = jest.fn().mockImplementation((event, cb) => {
        if (event === "close") {
          stdout.push("  Length\n");
          stdout.push("--------\n");
          stdout.push(`       ${file1}\n`);
          stdout.push(`${file2}\n`);
          stdout.push(null);
          cb();
        }
      });
      spawn.mockReturnValue({
        stdout,
        on,
      });

      const volume = await utils.totalVolume(dir);
      expect(volume).toEqual((file1 + file2) / 1024 / 1024 / 1024);
      const script = path.normalize(
        path.join(__dirname, "../../resources/du.ps1")
      );
      expect(spawn).toHaveBeenCalledWith(
        "powershell",
        ["-ExecutionPolicy", "RemoteSigned", "-File", script],
        {
          cwd: dir,
          windowsHide: true,
        }
      );
    });
  });
});
