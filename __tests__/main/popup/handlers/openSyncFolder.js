/*
 * Copyright (C) 2017-2019 Junpei Kawamoto
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

import {shell} from "electron";
import {getConfig} from "../../../../src/main/config";
import {openSyncFolder} from "../../../../src/main/popup/handlers/openSyncFolder";

jest.mock("../../../../src/main/config");

describe("openSyncFolder event handler", () => {
  const syncFolder = "/tmp";
  let handler;
  beforeEach(() => {
    jest.clearAllMocks();
    handler = openSyncFolder();
  });

  it("opens the sync folder", async () => {
    getConfig.mockResolvedValueOnce({
      syncFolder,
    });

    await expect(handler()).resolves.not.toBeDefined();
    expect(getConfig).toHaveBeenCalled();
    expect(shell.openItem).toHaveBeenCalledWith(syncFolder);
  });

  it("doesn't raise any error even if openItem fails", async () => {
    getConfig.mockResolvedValueOnce({
      syncFolder,
    });
    shell.openItem.mockReturnValueOnce(false);

    await expect(handler()).resolves.not.toBeDefined();
    expect(getConfig).toHaveBeenCalled();
    expect(shell.openItem).toHaveBeenCalledWith(syncFolder);
  });
});
