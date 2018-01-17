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

import {call, put} from "redux-saga/effects";
import {Paused, Synchronizing} from "../../../../src/constants";
import * as ipcActions from "../../../../src/ipc/actions";
import sendAsync from "../../../../src/ipc/send";
import * as actions from "../../../../src/render/popup/actions/index";
import changeState from "../../../../src/render/popup/sagas/changeState";

describe("changeState", () => {

  it("yields disable, changeStateAsync, restart, and enable actions if changeStateAsync returns Synchronizing", () => {
    const value = "some value";
    const saga = changeState(actions.changeState(value));
    expect(saga.next().value).toEqual(put(actions.disable()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.changeState(value)));
    expect(saga.next(Synchronizing).value).toEqual(put(actions.restart()));
    expect(saga.next().value).toEqual(put(actions.enable()));
    expect(saga.next().done).toBeTruthy();
  });

  it("yields disable, changeStateAsync, pause, and enable actions if changeStateAsync returns Paused", () => {
    const value = "some value";
    const saga = changeState(actions.changeState(value));
    expect(saga.next().value).toEqual(put(actions.disable()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.changeState(value)));
    expect(saga.next(Paused).value).toEqual(put(actions.pause()));
    expect(saga.next().value).toEqual(put(actions.enable()));
    expect(saga.next().done).toBeTruthy();
  });

  // TODO: Test throwing exceptions.

});