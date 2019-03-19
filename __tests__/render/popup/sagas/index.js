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

import {fork, takeEvery} from "redux-saga/effects";
import * as constants from "../../../../src/render/popup/modules/types";
import changeState from "../../../../src/render/popup/sagas/changeState";
import rootSaga from "../../../../src/render/popup/sagas/index";
import openAboutWindow from "../../../../src/render/popup/sagas/openAboutWindow";
import openSyncFolder from "../../../../src/render/popup/sagas/openSyncFolder";
import requestUsedVolumeTimer from "../../../../src/render/popup/sagas/requestUsedVolume";
import updateTotalVolume from "../../../../src/render/popup/sagas/updateTotalVolume";

describe("rootSaga", () => {
  it("yields updateTotalVolume, requestUsedVolumeTimer, openSyncFolder, openAboutWindow, and changeState", () => {
    const saga = rootSaga();
    expect(saga.next().value).toEqual(fork(updateTotalVolume));
    expect(saga.next().value).toEqual(fork(requestUsedVolumeTimer));
    expect(saga.next().value).toEqual(
      takeEvery(constants.OPEN_SYNC_FOLDER, openSyncFolder)
    );
    expect(saga.next().value).toEqual(
      takeEvery(constants.OPEN_ABOUT_WINDOW, openAboutWindow)
    );
    expect(saga.next().value).toEqual(
      takeEvery(constants.CHANGE_STATE, changeState)
    );
    expect(saga.next().done).toBeTruthy();
  });
});
