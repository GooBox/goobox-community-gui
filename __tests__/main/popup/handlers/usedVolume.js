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

import {getConfig} from "../../../../src/main/config";
import {usedVolume} from "../../../../src/main/popup/handlers/usedVolume";
import utils from "../../../../src/main/utils";

jest.mock("../../../../src/main/config");
jest.mock("../../../../src/main/utils");

describe("usedVolume event handler", () => {
  let handler;
  beforeEach(() => {
    jest.clearAllMocks();
    handler = usedVolume();
  });

  it("calculate the volume of the sync folder", async () => {
    const syncFolder = "/tmp";
    getConfig.mockResolvedValueOnce({
      syncFolder,
    });

    const volume = 1234567;
    utils.totalVolume.mockResolvedValueOnce(volume);

    await expect(handler()).resolves.toEqual(volume);
    expect(getConfig).toHaveBeenCalled();
    expect(utils.totalVolume).toHaveBeenCalledWith(syncFolder);
  });
});
