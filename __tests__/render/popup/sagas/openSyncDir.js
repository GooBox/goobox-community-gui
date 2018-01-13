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
import {call} from "redux-saga/effects";
import {OpenSyncFolderEvent} from "../../../../src/constants";
import openSyncFolder, {openSyncFolderAsync} from "../../../../src/render/popup/sagas/openSyncFolder";

describe("openSyncFolderAsync", () => {

  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method, args) => {
        if (listen === method) {
          cb(null, args);
        }
      });
    });
  });

  it("requests opening sync folder via ipc", async () => {
    await expect(openSyncFolderAsync()).resolves.toBeDefined();
    expect(ipcRenderer.once).toHaveBeenCalledWith(OpenSyncFolderEvent, expect.anything());
    expect(ipcRenderer.send).toHaveBeenCalledWith(OpenSyncFolderEvent);
  });

});

describe("openSyncFolder", () => {

  it("yields openSyncFolderAsync saga", () => {
    const saga = openSyncFolder();
    expect(saga.next().value).toEqual(call(openSyncFolderAsync));
    expect(saga.next().done).toBeTruthy();
  });

});
