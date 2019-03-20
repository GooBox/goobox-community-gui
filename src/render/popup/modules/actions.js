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

import {createAction} from "redux-actions";
import * as types from "./types";

export const changeState = createAction(types.CHANGE_STATE);
export const pause = createAction(types.PAUSE);
export const restart = createAction(types.RESTART);
export const setVolumeSize = createAction(types.SET_VOLUME_SIZE);
export const setTotalVolumeSize = createAction(types.SET_TOTAL_VOLUME_SIZE);
export const openSyncFolder = createAction(types.OPEN_SYNC_FOLDER);
export const openAboutWindow = createAction(types.OPEN_ABOUT_WINDOW);
export const enable = createAction(types.ENABLE);
export const disable = createAction(types.DISABLE);
export const openSettings = createAction(types.OPEN_SETTINGS);
export const importDrive = createAction(types.IMPORT_DRIVE);
