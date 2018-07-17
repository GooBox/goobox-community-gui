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

import {app} from "electron";
import jre from "node-jre";
import path from "path";
import {getConfig, saveConfig} from "../../src/main/config";
import {core} from "../../src/main/core";
import installer from "../../src/main/installer";
import {main} from "../../src/main/startup";

jest.mock("electron");
jest.mock("node-jre");
jest.mock("../../src/main/config");
jest.mock("../../src/main/installer");
jest.mock("../../src/main/core");
jest.mock("../../src/main/papertrail");

describe("main", () => {

  let oldArgs;
  beforeAll(() => {
    core.mockReturnValue(Promise.resolve());
    saveConfig.mockReturnValue(Promise.resolve());
    oldArgs = process.argv;
  });

  afterAll(() => {
    process.argv = oldArgs;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts the installer when there are no config file", async () => {
    getConfig.mockReturnValue(Promise.reject("not fund"));
    await main();
    expect(installer).toHaveBeenCalled();
    expect(core).not.toHaveBeenCalled();
    expect(app.quit).not.toHaveBeenCalled();
  });

  it("starts the installer when it hasn't been finished yet", async () => {
    getConfig.mockReturnValue(Promise.resolve({
      installed: false
    }));
    await main();
    expect(installer).toHaveBeenCalled();
    expect(core).not.toHaveBeenCalled();
    expect(app.quit).not.toHaveBeenCalled();
  });

  it("starts the core when the installer already has been finished", async () => {
    getConfig.mockReturnValue(Promise.resolve({
      installed: true
    }));
    await main();
    expect(core).toHaveBeenCalled();
    expect(installer).not.toHaveBeenCalled();
    expect(app.quit).not.toHaveBeenCalled();
  });

  it("starts the installer when --installer flag is given", async () => {
    process.argv = ["--installer"];
    await main();
    expect(installer).toHaveBeenCalled();
    expect(core).not.toHaveBeenCalled();
    expect(app.quit).not.toHaveBeenCalled();
  });

  it("sets storj true when --storj flag is given", async () => {
    const cfg = {
      installed: true,
      storj: false,
      sia: true,
    };
    getConfig.mockReturnValue(Promise.resolve(cfg));
    process.argv = ["--storj"];
    await main();
    expect(core).toHaveBeenCalled();
    expect(saveConfig).toHaveBeenCalledWith({
      ...cfg,
      storj: true,
      sia: false,
    });
    expect(app.quit).not.toHaveBeenCalled();
  });

  it("sets sia true when --sia flag is given", async () => {
    const cfg = {
      installed: true,
      storj: true,
      sia: false,
    };
    getConfig.mockReturnValue(Promise.resolve(cfg));
    process.argv = ["--sia"];
    await main();
    expect(core).toHaveBeenCalled();
    expect(saveConfig).toHaveBeenCalledWith({
      ...cfg,
      storj: false,
      sia: true,
    });
    expect(app.quit).not.toHaveBeenCalled();
  });

  it("sets the JRE directory in the user data directory", async () => {
    const userData = "/tmp/user-data";
    app.getPath.mockReturnValue(userData);
    await main();
    expect(jre.setJreDir).toHaveBeenLastCalledWith(path.join(userData, "jre"));
    expect(app.getPath).toHaveBeenCalledWith("userData");
  });

});
