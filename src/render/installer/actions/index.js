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

import {createAction} from "redux-actions";
import * as actionTypes from "../constants/action-types";

export const closeWindow = createAction(actionTypes.CloseWindow);

export const selectFolder = createAction(actionTypes.SelectFolder);
export const selectStorj = createAction(actionTypes.SelectStorj);
export const selectSia = createAction(actionTypes.SelectSia);
export const selectBoth = createAction(actionTypes.SelectBoth);

export const storjLogin = createAction(actionTypes.StorjLogin);
export const storjLoginSuccess = createAction(actionTypes.StorjLoginSuccess);
export const storjLoginFailure = createAction(actionTypes.StorjLoginFailure);
export const storjCreateAccount = createAction(actionTypes.StorjCreateAccount);
export const storjCreateAccountSuccess = createAction(actionTypes.StorjCreateAccountSuccess);
export const storjCreateAccountFailure = createAction(actionTypes.StorjCreateAccountFailure);
export const storjGenerateMnemonic = createAction(actionTypes.StorjGenerateMnemonic);
export const storjGenerateMnemonicSuccess = createAction(actionTypes.StorjGenerateMnemonicSuccess);
export const storjGenerateMnemonicFailure = createAction(actionTypes.StorjGenerateMnemonicFailure);

export const requestSiaWalletInfo = createAction(actionTypes.RequestSiaWalletInfo);
export const requestSiaWalletInfoSuccess = createAction(actionTypes.RequestSiaWalletInfoSuccess);
export const requestSiaWalletInfoFailure = createAction(actionTypes.RequestSiaWalletInfoFailure);

export const setProgressValue = createAction(actionTypes.SetProgressValue);

export const prepareJRE = createAction(actionTypes.PrepareJRE);
export const prepareJREFailure = createAction(actionTypes.PrepareJREFailure);

export const processingStart = createAction(actionTypes.ProcessingStart);
export const processingEnd = createAction(actionTypes.ProcessingEnd);

export const saveConfig = createAction(actionTypes.SaveConfig);
export const stopSyncApps = createAction(actionTypes.StopSyncApps);

