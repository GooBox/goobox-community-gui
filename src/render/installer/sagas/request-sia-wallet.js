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
import {push} from "react-router-redux";
import {delay} from "redux-saga";
import {call, fork, put} from "redux-saga/effects";
import * as ipcActions from "../../../ipc/actions";
import sendAsync from "../../../ipc/send";
import * as actions from "../actions";
import * as screens from "../constants/screens";
import incrementProgress from "./increment-progress";

export default function* requestSiaWallet(action) {

  const mainState = action.payload;
  const inc = yield fork(incrementProgress);
  try {

    log.info("[GUI render] Requesting sia wallet information");
    const info = yield call(sendAsync, ipcActions.siaRequestWalletInfo({
      syncFolder: mainState.folder,
    }));
    inc.cancel();

    log.debug(`[GUI render] Received the wallet information: ${info}`);
    yield put(actions.requestSiaWalletInfoSuccess(info));
    yield put(actions.setProgressValue(100));
    // noinspection JSCheckFunctionSignatures
    yield call(delay, 500);

    yield put(push(screens.SiaWallet));
    yield put(actions.setProgressValue(0));

  } catch (err) {

    inc.cancel();
    log.debug(`[GUI render] Fails to received the wallet information: ${err}`);
    yield put(actions.requestSiaWalletInfoFailure(err));

  }

}


