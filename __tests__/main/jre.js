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
jest.mock("fs");

import fs from "fs";
import jre from "node-jre";
import path from "path";
import {installJRE} from "../../src/main/jre";

describe("installJRE function", () => {

  const jrePath = "/tmp/java";
  const jreExec = path.join(jrePath, "bin/java");

  beforeEach(() => {
    fs.existsSync.mockReset();
    jre.jreDir.mockClear();
    jre.jreDir.mockReturnValue(jrePath);
    jre.driver.mockClear();
    jre.driver.mockReturnValue(jreExec);
    jre.install.mockClear();
  });

  it("checks JRE is installed and if exists, does nothing", async () => {
    fs.existsSync.mockReturnValue(true);

    await installJRE();
    expect(jre.driver).toHaveBeenCalled();
    expect(fs.existsSync).toHaveBeenCalledWith(jreExec);
    expect(jre.install).not.toHaveBeenCalled();
  });

  it("checks JRE is installed and if not exists, installs a JRE", async () => {
    fs.existsSync.mockReturnValue(false);

    await installJRE();
    expect(jre.driver).toHaveBeenCalled();
    expect(fs.existsSync).toHaveBeenCalledWith(jreExec);
    expect(jre.install).toHaveBeenCalled();
  });

  it("checks JRE is installed and if an error is raised, installs a JRE", async () => {
    jre.driver.mockImplementation(() => {
      throw "expected jre.driver error";
    });

    await installJRE();
    expect(jre.driver).toHaveBeenCalled();
    expect(fs.existsSync).not.toHaveBeenCalledWith();
    expect(jre.install).toHaveBeenCalled();
  });

  it("throws error messages if the installation fails", async () => {
    fs.existsSync.mockReturnValue(false);

    const err = "expected error";
    jre.install.mockImplementationOnce((callback) => {
      callback(err)
    });

    await expect(installJRE()).rejects.toEqual(err);
    expect(jre.driver).toHaveBeenCalled();
    expect(fs.existsSync).toHaveBeenCalledWith(jreExec);
    expect(jre.install).toHaveBeenCalled();
  });

});
