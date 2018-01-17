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

import storage from "electron-json-storage";
import {ConfigFile} from "../../src/constants";

import {app} from "electron";

describe("startup script", () => {

  it("loads the main script for the installer when there are no config file", () => {
    storage.get.mockImplementationOnce((key, callback) => {
      if (key === ConfigFile) {
        callback("not found", null);
      }
    });
    require("../../src/main/startup");
    expect(app.on.mock.calls[0][1].name).toEqual("installer");
  });

  it("loads the main script for the installer when not installed yet", () => {
    storage.get.mockImplementationOnce((key, callback) => {
      if (key === ConfigFile) {
        callback(null, {installed: false});
      }
    });
    require("../../src/main/startup");
    expect(app.on.mock.calls[0][1].name).toEqual("installer");
  });

});