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
import {delay} from "redux-saga";
import {call, put} from "redux-saga/effects";
import {UsedVolumeEvent} from "../../../../src/constants";
import {setVolumeSize} from "../../../../src/render/popup/actions";
import requestUsedVolumeTimer, {requestUsedVolume} from "../../../../src/render/popup/sagas/requestUsedVolume";

describe("requestUsedVolume", () => {

  const volume = 334;
  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, volume);
        }
      });
    });
  });

  it("requests total volume ", async () => {
    await expect(requestUsedVolume()).resolves.toEqual(volume);
    expect(ipcRenderer.once).toHaveBeenCalledWith(UsedVolumeEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(UsedVolumeEvent);
  });

});

describe("requestUsedVolumeTimer", () => {

  const volume = 334;
  it("yields delay with 30sec, requestUsedVolume, and setVolumeSize", () => {
    const saga = requestUsedVolumeTimer();
    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 30000));
    expect(saga.next().value).toEqual(call(requestUsedVolume));
    expect(saga.next(volume).value).toEqual(put(setVolumeSize(volume)));
    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 30000));
  });

});

