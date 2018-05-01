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
import * as actionTypes from "../constants/action-types";
import closeWindow from "./close-window";
import openSyncFolder from "./open-sync-folder";
import prepareJRE from "./prepare-jre";
import requestSiaWallet from "./request-sia-wallet";
import saveConfig from "./save-config";
import stopSyncApps from "./stop-sync-apps";
import storjCreateAccount from "./storj-create-account";
import storjGenerateMnemonic from "./storj-generate-mnemonic";
import storjLogin from "./storj-login";

export default function* rootSaga() {
  yield fork(prepareJRE);
  yield takeEvery(actionTypes.StorjLogin, storjLogin);
  yield takeEvery(actionTypes.StorjCreateAccount, storjCreateAccount);
  yield takeEvery(actionTypes.StorjGenerateMnemonic, storjGenerateMnemonic);
  yield takeEvery(actionTypes.RequestSiaWalletInfo, requestSiaWallet);
  yield takeEvery(actionTypes.SaveConfig, saveConfig);
  yield takeEvery(actionTypes.StopSyncApps, stopSyncApps);
  yield takeEvery(actionTypes.CloseWindow, closeWindow);
  yield takeEvery(actionTypes.OpenSyncFolder, openSyncFolder);
}