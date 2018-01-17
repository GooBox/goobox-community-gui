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

import {ipcRenderer} from "electron";
import sendAsync from "../../src/ipc/send";

describe("sendAsync", () => {

  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
  });

  it("sends a given action's payload, error, and meta", async () => {
    ipcRenderer.once.mockImplementation((_, callback) => {
      ipcRenderer.send.mockImplementation((type, payload, error, meta) => {
        callback(null, payload, error, meta);
      });
    });
    const action = {
      type: "sample action",
      error: false,
      meta: "sample meta",
    };
    await expect(sendAsync(action));
    expect(ipcRenderer.send).toHaveBeenCalledWith(action.type, action.payload, action.error, action.meta);
  });

  it("returns the payload received from the main process", async () => {
    const res = "sample result";
    ipcRenderer.once.mockImplementation((_, callback) => {
      ipcRenderer.send.mockImplementation(() => {
        callback(null, res);
      });
    });
    const action = {
      type: "sample action",
      error: false,
    };
    await expect(sendAsync(action)).resolves.toEqual(res);
  });

  it("throws the payload received from the main process when the received error is true", async () => {
    const err = "expected error";
    ipcRenderer.once.mockImplementation((_, callback) => {
      ipcRenderer.send.mockImplementation(() => {
        callback(null, err, true);
      });
    });
    const action = {
      type: "sample action",
      error: false,
    };
    await expect(sendAsync(action)).rejects.toEqual(err);
  });

});

