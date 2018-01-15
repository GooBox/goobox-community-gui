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
import {push} from "react-router-redux";
import {call, put} from "redux-saga/effects";
import util from "util";
import {StorjRegisterationEvent} from "../../../constants";
import * as actions from "../actions";
import * as screens from "../constants/screens";

export const storjCreateAccountAsync = async (info) => {

  return new Promise((resolve, reject) => {

    ipcRenderer.once(StorjRegisterationEvent, (_, succeeded, args) => {

      if (succeeded) {
        resolve({
          email: info.email,
          password: info.password,
          encryptionKey: args,
        });
      } else {
        reject({
          emailWarn: true,
          passwordWarn: true,
          warnMsg: util.isString(args) ? args : null,
        });
      }

    });
    ipcRenderer.send(StorjRegisterationEvent, info);

  });

};

export default function* storjCreateAccount(action) {

  const accountInfo = action.payload;
  yield put(actions.processingStart());
  try {

    const info = yield call(storjCreateAccountAsync, accountInfo);
    yield put(actions.storjCreateAccountSuccess(info));
    yield put(push(screens.StorjEncryptionKey));

  } catch (err) {
    yield put(actions.storjCreateAccountFailure(err));
  }
  yield put(actions.processingEnd());

}
