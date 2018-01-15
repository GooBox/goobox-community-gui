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
import {UsedVolumeEvent} from "../../../constants";
import {setVolumeSize} from "../actions";

export const requestUsedVolume = async () => {
  return new Promise(resolve => {
    ipcRenderer.once(UsedVolumeEvent, (event, volume) => resolve(volume || 0));
    ipcRenderer.send(UsedVolumeEvent);
  });
};

export default function* requestUsedVolumeTimer() {
  while (true) {
    // noinspection JSCheckFunctionSignatures
    yield call(delay, 30000);
    const volume = yield call(requestUsedVolume);
    yield put(setVolumeSize(volume));
  }
}
