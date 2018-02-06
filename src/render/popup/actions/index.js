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
import * as constants from "../constants";

export const changeState = createAction(constants.ChangeState);
export const pause = createAction(constants.Pause);
export const restart = createAction(constants.Restart);
export const setVolumeSize = createAction(constants.SetVolumeSize);
export const setTotalVolumeSize = createAction(constants.SetTotalVolumeSize);
export const openSyncFolder = createAction(constants.OpenSyncFolder);
export const openAboutWindow = createAction(constants.OpenAboutWindow);
export const enable = createAction(constants.Enable);
export const disable = createAction(constants.Disable);