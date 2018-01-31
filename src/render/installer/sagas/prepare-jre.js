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

export default function* prepareJRE() {

  const inc = yield fork(incrementProgress);
  try {
    log.debug("[GUI render] Requesting JRE installation");
    const installed = yield call(sendAsync, ipcActions.installJRE());
    inc.cancel();
    if (installed) {
      log.debug("[GUI render] JRE installation succeeds");
      yield put(actions.setProgressValue(100));
      // noinspection JSCheckFunctionSignatures
      yield call(delay, 500);
    } else {
      log.debug("[GUI render] JRE installation is skipped");
    }
    yield put(push(screens.ChooseCloudService));
    yield put(actions.setProgressValue(0));
  } catch (err) {
    log.debug(`[GUI render] JRE installation fails: ${err}`);
    inc.cancel();
    yield put(actions.prepareJREFailure(err));
  }

}

