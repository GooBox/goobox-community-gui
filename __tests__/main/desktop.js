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
import {execFileSync} from "child_process";
import del from "del";
import fs from "fs";
import os from "os";
import path from "path";
import * as desktop from "../../src/main/desktop";

describe("desktop module", () => {

  describe("in Windows", () => {

    const oldPlatform = process.platform;
    beforeAll(() => {
      Object.defineProperty(process, "platform", {
        value: "win32"
      });
    });

    afterAll(() => {
      Object.defineProperty(process, "platform", {
        value: oldPlatform
      });
    });

    let dir;
    beforeEach(() => {
      dir = fs.mkdtempSync(os.tmpdir());
      execFileSync.mockReset();
    });

    afterEach(() => {
      del.sync(path.join(dir, "**"), {force: true});
    });

    it("has register function which creates desktop.ini and desktop.ico", async () => {
      await desktop.register(dir);

      const iniFile = fs.readFileSync(path.join(dir, "desktop.ini"));
      const expectedIniFile = fs.readFileSync(path.join(__dirname, "../../resources/desktop.ini"));
      expect(iniFile).toEqual(expectedIniFile);

      const icoFile = fs.readFileSync(path.join(dir, "desktop.ico"));
      const expectedIcoFile = fs.readFileSync(path.join(__dirname, "../../resources/desktop.ico"));
      expect(icoFile).toEqual(expectedIcoFile);

      expect(execFileSync).toHaveBeenCalledWith("attrib", ["+S", path.basename(dir)], {
        cwd: path.dirname(dir),
        windowsHide: true,
      });
      expect(execFileSync).toHaveBeenCalledWith("attrib", ["+S", "+H", "desktop.ini"], {
        cwd: dir,
        windowsHide: true,
      });
      expect(execFileSync).toHaveBeenCalledWith("attrib", ["+S", "+H", "desktop.ico"], {
        cwd: dir,
        windowsHide: true,
      });
    });

  });

});