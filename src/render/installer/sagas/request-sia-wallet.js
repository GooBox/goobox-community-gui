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
import {push} from "react-router-redux";
import {delay} from "redux-saga";
import {call, fork, put} from "redux-saga/effects";
import {SiaWalletEvent} from "../../../constants";
import * as actions from "../actions";
import {screens} from "../constants";
import incrementProgress from "./increment-progress";

export async function requestSiaWalletAsync() {

  return new Promise((resolve, reject) => {

    ipcRenderer.once(SiaWalletEvent, (_, info, err) => {
      log.debug(`SiaWalletEvent: info = ${info}, err = ${err}`);
      if (err) {
        log.error(err);
        reject(err);
      } else {
        resolve(info);
      }
    });

    log.info("requesting sia wallet information");
    ipcRenderer.send(SiaWalletEvent);

  });

}

export default function* requestSiaWallet() {

  const inc = yield fork(incrementProgress);
  try {
    const info = yield call(requestSiaWalletAsync);
    yield put(actions.requestSiaWalletInfoSuccess(info));
  } catch (err) {
    yield put(actions.requestSiaWalletInfoFailure(err));
  }
  inc.cancel();
  yield put(actions.setProgressValue(100));
  // noinspection JSCheckFunctionSignatures
  yield call(delay, 500);
  yield put(push(screens.SiaWallet));
  yield put(actions.setProgressValue(0));

}


