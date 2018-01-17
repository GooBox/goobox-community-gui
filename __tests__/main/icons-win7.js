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

jest.mock("os");

import os from "os";
import path from "path";

describe("icons module in Windows 7-", () => {

  let originalPlatform;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "win32"
    });
    os.release.mockReturnValue("5.0");
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    });
  });

  it("returns white icons", () => {
    const icons = require("../../src/main/icons").default;
    expect(icons.getIdleIcon()).toEqual(path.join(__dirname, "../../resources/win7/idle.png"));
    expect(icons.getSyncIcon()).toEqual(path.join(__dirname, "../../resources/win7/sync.png"));
    expect(icons.getPausedIcon()).toEqual(path.join(__dirname, "../../resources/win7/paused.png"));
    expect(icons.getErrorIcon()).toEqual(path.join(__dirname, "../../resources/win7/error.png"));
  });

});