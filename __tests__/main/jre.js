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

import del from "del";
import fs from "fs";
import jre from "node-jre";
import path from "path";
import {installJRE} from "../../src/main/jre";

jest.mock("fs");
jest.mock("del");
jest.useFakeTimers();

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

  it("checks JRE is installed and if exists, does nothing and returns false", async () => {
    fs.existsSync.mockReturnValue(true);

    await expect(installJRE()).resolves.toBeFalsy();
    expect(jre.driver).toHaveBeenCalled();
    expect(fs.existsSync).toHaveBeenCalledWith(jreExec);
    expect(jre.install).not.toHaveBeenCalled();
  });

  it("checks JRE is installed and if not exists, installs a JRE and returns true", async () => {
    fs.existsSync.mockReturnValue(false);

    await expect(installJRE()).resolves.toBeTruthy();
    expect(jre.driver).toHaveBeenCalled();
    expect(fs.existsSync).toHaveBeenCalledWith(jreExec);
    expect(jre.install).toHaveBeenCalled();
  });

  it("checks JRE is installed and if fs.existsSync throws an error, installs a JRE and returns true", async () => {
    jre.driver.mockImplementation(() => {
      throw "expected jre.driver error";
    });

    await expect(installJRE()).resolves.toBeTruthy();
    expect(jre.driver).toHaveBeenCalled();
    expect(fs.existsSync).not.toHaveBeenCalledWith();
    expect(jre.install).toHaveBeenCalled();
  });

  it("throws error messages if the installation fails", async () => {
    fs.existsSync.mockReturnValue(false);

    const err = "expected error";
    jre.install.mockImplementationOnce(callback => {
      callback(err);
    });

    await expect(installJRE()).rejects.toEqual(expect.any(String));
    expect(jre.driver).toHaveBeenCalled();
    expect(fs.existsSync).toHaveBeenCalledWith(jreExec);
    expect(jre.install).toHaveBeenCalled();
  });

  it("times out the installation after 5min", async () => {
    fs.existsSync.mockReturnValue(false);

    jre.install.mockImplementationOnce(() => {});
    setTimeout.mockImplementation(cb => cb());
    await expect(installJRE()).rejects.toEqual(expect.any(String));
    expect(jre.install).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      60 * 60 * 1000
    );
  });

  it("deletes downloaded files if the installation fails", async () => {
    fs.existsSync.mockReturnValue(false);

    const err = "expected error";
    jre.install.mockImplementationOnce(callback => {
      callback(err);
    });

    await expect(installJRE()).rejects.toEqual(expect.any(String));
    expect(del.sync).toHaveBeenCalledWith(path.join(jre.jreDir(), "**"));
  });
});
