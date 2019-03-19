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
import * as constants from "../modules/types";
import changeState from "./changeState";
import openAboutWindow from "./openAboutWindow";
import openSyncFolder from "./openSyncFolder";
import requestUsedVolumeTimer from "./requestUsedVolume";
import updateTotalVolume from "./updateTotalVolume";

export default function* rootSaga() {
  yield fork(updateTotalVolume);
  yield fork(requestUsedVolumeTimer);
  yield takeEvery(constants.OpenSyncFolder, openSyncFolder);
  yield takeEvery(constants.OpenAboutWindow, openAboutWindow);
  yield takeEvery(constants.ChangeState, changeState);
}
