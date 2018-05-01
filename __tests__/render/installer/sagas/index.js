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
import * as actionTypes from "../../../../src/render/installer/constants/action-types";
import closeWindow from "../../../../src/render/installer/sagas/close-window";
import rootSaga from "../../../../src/render/installer/sagas/index";
import openSyncFolder from "../../../../src/render/installer/sagas/open-sync-folder";
import prepareJRE from "../../../../src/render/installer/sagas/prepare-jre";
import requestSiaWallet from "../../../../src/render/installer/sagas/request-sia-wallet";
import saveConfig from "../../../../src/render/installer/sagas/save-config";
import stopSyncApps from "../../../../src/render/installer/sagas/stop-sync-apps";
import storjCreateAccount from "../../../../src/render/installer/sagas/storj-create-account";
import storjGenerateMnemonic from "../../../../src/render/installer/sagas/storj-generate-mnemonic";
import storjLogin from "../../../../src/render/installer/sagas/storj-login";

describe("rootSaga", () => {

  it("yields all child sagas", () => {
    const saga = rootSaga();
    expect(saga.next().value).toEqual(fork(prepareJRE));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.StorjLogin, storjLogin));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.StorjCreateAccount, storjCreateAccount));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.StorjGenerateMnemonic, storjGenerateMnemonic));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.RequestSiaWalletInfo, requestSiaWallet));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.SaveConfig, saveConfig));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.StopSyncApps, stopSyncApps));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.CloseWindow, closeWindow));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.OpenSyncFolder, openSyncFolder));
    expect(saga.next().done).toBeTruthy();
  });

});

