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

import path from "path";

describe("icons module in Mac", () => {

  let originalPlatform;
  beforeAll(() => {
    originalPlatform = process.platform;
    Object.defineProperty(process, "platform", {
      value: "darwin"
    });
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    });
  });

  it("returns white icons", () => {
    const icons = require("../../src/main/icons").default;
    expect(icons.getIdleIcon()).toEqual(path.join(__dirname, "../../resources/mac/idle.png"));
    expect(icons.getSyncIcon()).toEqual(path.join(__dirname, "../../resources/mac/sync.png"));
    expect(icons.getPausedIcon()).toEqual(path.join(__dirname, "../../resources/mac/paused.png"));
    expect(icons.getErrorIcon()).toEqual(path.join(__dirname, "../../resources/mac/error.png"));
  });

});