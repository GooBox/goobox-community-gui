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

import log from "electron-log";
import {call, put} from "redux-saga/effects";
import * as ipcActions from "../../../ipc/actions";
import sendAsync from "../../../ipc/send";
import * as actions from "../actions";

export function* storjGenerateMnemonic(action) {
  try {
    const encryptionKey = yield call(
      sendAsync,
      ipcActions.storjGenerateMnemonic({
        syncFolder: action.payload.folder,
      })
    );
    yield put(actions.storjGenerateMnemonicSuccess(encryptionKey));
  } catch (err) {
    log.error(err);
  }
}

export default storjGenerateMnemonic;
