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

import {ipcMain} from "electron";
import addListener from "../../src/ipc/receiver";

describe("addListener", () => {

  const action = {
    type: "sample action",
    payload: "sample payload",
    error: false,
    meta: "sample meta",
  };
  beforeEach(() => {
    ipcMain.on.mockReset();
  });

  it("sends a successful result when the given asyncCallback is resolved", () => {
    const res = "expected result";
    ipcMain.on.mockImplementation(async (type, asyncCallback) => {
      expect(type).toEqual(action.type);

      const event = {
        sender: {
          send: jest.fn()
        }
      };
      await asyncCallback(event, action.payload, action.error, action.meta);
      expect(event.sender.send).toHaveBeenCalledWith(type, res);
    });
    addListener(action.type, async (payload, error, meta) => {
      expect(payload).toEqual(action.payload);
      expect(error).toEqual(action.error);
      expect(meta).toEqual(action.meta);
      return res;
    });
  });

  it("sends an error when the given asyncCallback is rejected", () => {
    const err = "expected error";
    ipcMain.on.mockImplementation(async (type, asyncCallback) => {
      expect(type).toEqual(action.type);

      const event = {
        sender: {
          send: jest.fn()
        }
      };
      await asyncCallback(event, action.payload, action.error, action.meta);
      expect(event.sender.send).toHaveBeenCalledWith(type, err, true);
    });
    addListener(action.type, async (payload, error, meta) => {
      expect(payload).toEqual(action.payload);
      expect(error).toEqual(action.error);
      expect(meta).toEqual(action.meta);
      throw err;
    });
  });

});

