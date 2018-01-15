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
import log from "electron-log";
import {call, put} from "redux-saga/effects";
import {StopSyncAppsEvent} from "../../../constants";
import * as actions from "../constants/action-types";


export const stopSyncAppsAsync = () => {

  return new Promise((resolve, reject) => {
    ipcRenderer.once(StopSyncAppsEvent, (_, err) => {
      log.debug(`StopSyncAppsEvent: err = ${err}`);
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    ipcRenderer.send(StopSyncAppsEvent);
  });

};

export default function* stopSyncApps() {
  yield put(actions.ProcessingStart());
  try {
    yield call(stopSyncAppsAsync);
  } catch (err) {

  }
  yield put(actions.ProcessingEnd());
};