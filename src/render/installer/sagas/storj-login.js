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
import {StorjLoginEvent} from "../../../constants";
import * as ipcActions from "../../../ipc/actions";
import sendAsync from "../../../ipc/send";
import * as actions from "../actions";
import * as screens from "../constants/screens";

export const storjLoginAsync = async (info) => {

  return new Promise((resolve, reject) => {

    ipcRenderer.once(StorjLoginEvent, (_, succeeded, msg, validKeys) => {
      if (succeeded) {
        resolve(info);
      } else {
        reject({
          ...info,
          emailWarn: !validKeys.email,
          passwordWarn: !validKeys.password,
          keyWarn: !validKeys.encryptionKey,
          warnMsg: util.isString(msg) ? msg : null,
        });
      }
    });
    ipcRenderer.send(StorjLoginEvent, info);

  });

};

export default function* storjLogin(action) {

  const mainState = action.payload;
  yield put(actions.processingStart());
  try {

    yield call(sendAsync, ipcActions.storjLogin({
      email: mainState.storjAccount.email,
      password: mainState.storjAccount.password,
      encryptionKey: mainState.storjAccount.key,
    }));
    yield put(actions.storjLoginSuccess(mainState.storjAccount));

    if (mainState.sia) {
      yield put(actions.requestSiaWalletInfo());
    } else {
      yield put(actions.saveConfig(mainState));
      yield put(push(screens.FinishAll));
    }

  } catch (err) {
    yield put(actions.storjLoginFailure({
      ...mainState.storjAccount,
      warnMsg: util.isString(err.error) ? err.error : null,
      emailWarn: err.email,
      passwordWarn: err.password,
      keyWarn: err.encryptionKey,
    }));
  }
  yield put(actions.processingEnd());

}

