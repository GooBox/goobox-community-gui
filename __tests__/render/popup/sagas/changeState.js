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
import {call, put} from "redux-saga/effects";
import {ChangeStateEvent, Paused, Synchronizing} from "../../../../src/constants";
import * as actions from "../../../../src/render/popup/actions/index";
import changeState, {changeStateAsync} from "../../../../src/render/popup/sagas/changeState";

describe("changeStateAsync", () => {

  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method, arg) => {
        if (listen === method) {
          cb(null, arg);
        }
      });
    });
  });

  it("requests pausing the app via ipc when the state is changed to paused", async () => {
    await expect(changeStateAsync(Paused)).resolves.toEqual(Paused);
    expect(ipcRenderer.once).toHaveBeenCalledWith(ChangeStateEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(ChangeStateEvent, Paused);
  });

  it("requests restarting the app via ipc when the state is changed to synchronizing", async () => {
    await expect(changeStateAsync(Synchronizing)).resolves.toEqual(Synchronizing);
    expect(ipcRenderer.once).toHaveBeenCalledWith(ChangeStateEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(ChangeStateEvent, Synchronizing);
  });

});

describe("changeState", () => {

  it("yields disable, changeStateAsync, restart, and enable actions if changeStateAsync returns Synchronizing", () => {
    const value = "some value";
    const iter = changeState(actions.changeState(value));
    expect(iter.next().value).toEqual(put(actions.disable()));
    expect(iter.next().value).toEqual(call(changeStateAsync, value));
    expect(iter.next(Synchronizing).value).toEqual(put(actions.restart()));
    expect(iter.next().value).toEqual(put(actions.enable()));
    expect(iter.next().done).toBeTruthy();
  });

  it("yields disable, changeStateAsync, pause, and enable actions if changeStateAsync returns Paused", () => {
    const value = "some value";
    const iter = changeState(actions.changeState(value));
    expect(iter.next().value).toEqual(put(actions.disable()));
    expect(iter.next().value).toEqual(call(changeStateAsync, value));
    expect(iter.next(Paused).value).toEqual(put(actions.pause()));
    expect(iter.next().value).toEqual(put(actions.enable()));
    expect(iter.next().done).toBeTruthy();
  });

});