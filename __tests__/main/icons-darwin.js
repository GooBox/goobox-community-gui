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

import {systemPreferences} from "electron";
import path from "path";

jest.mock("electron");

describe("icons module in Mac", () => {

  let originalPlatform, icons;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "darwin"
    });
    icons = require("../../src/main/icons").default;
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    });
  });

  beforeEach(() => {
    systemPreferences.isDarkMode.mockReturnValue(false);
  });

  it("returns white icons", () => {
    expect(icons.getIdleIcon()).toEqual(path.join(__dirname, "../../resources/mac/idle.png"));
    expect(icons.getSyncIcon()).toEqual(path.join(__dirname, "../../resources/mac/sync.png"));
    expect(icons.getPausedIcon()).toEqual(path.join(__dirname, "../../resources/mac/paused.png"));
    expect(icons.getErrorIcon()).toEqual(path.join(__dirname, "../../resources/mac/error.png"));
    expect(icons.getWarnIcon()).toEqual(path.join(__dirname, "../../resources/mac/warn.png"));
  });

  it("returns icons for the dark theme if the dark theme is true", () => {
    systemPreferences.isDarkMode.mockReturnValue(true);
    expect(icons.getIdleIcon()).toEqual(path.join(__dirname, "../../resources/mac/dark/idle.png"));
    expect(icons.getSyncIcon()).toEqual(path.join(__dirname, "../../resources/mac/dark/sync.png"));
    expect(icons.getPausedIcon()).toEqual(path.join(__dirname, "../../resources/mac/dark/paused.png"));
    expect(icons.getErrorIcon()).toEqual(path.join(__dirname, "../../resources/mac/dark/error.png"));
    expect(icons.getWarnIcon()).toEqual(path.join(__dirname, "../../resources/mac/dark/warn.png"));
  });

});
