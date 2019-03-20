/*
 * Copyright (C) 2017-2019 Junpei Kawamoto
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

import {fork, takeEvery} from "redux-saga/effects";
import * as types from "../modules/types";
import changeState from "./changeState";
import openAboutWindow from "./openAboutWindow";
import openSettings from "./openSettings";
import openSyncFolder from "./openSyncFolder";
import requestUsedVolumeTimer from "./requestUsedVolume";
import updateTotalVolume from "./updateTotalVolume";

export default function* rootSaga() {
  yield fork(updateTotalVolume);
  yield fork(requestUsedVolumeTimer);
  yield takeEvery(types.OPEN_SYNC_FOLDER, openSyncFolder);
  yield takeEvery(types.OPEN_SETTINGS, openSettings);
  yield takeEvery(types.OPEN_ABOUT_WINDOW, openAboutWindow);
  yield takeEvery(types.CHANGE_STATE, changeState);
}
