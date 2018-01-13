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
import {call, put} from 'redux-saga/effects';
import {ChangeStateEvent, Synchronizing} from "../../../constants";
import * as actions from "../actions";

export const changeStateAsync = async (state) => {
  return new Promise(resolve => {
    ipcRenderer.once(ChangeStateEvent, (event, nextState) => resolve(nextState));
    ipcRenderer.send(ChangeStateEvent, state);
  });
};

export default function* changeState(action) {
  yield put(actions.disable());
  const res = yield call(changeStateAsync, action.value);
  if (res === Synchronizing) {
    yield put(actions.restart());
  } else {
    yield put(actions.pause());
  }
  yield put(actions.enable());
}