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

import {handleActions} from "redux-actions";
import {Paused, Synchronizing} from "../../../constants";
import * as types from "./types";

export const InitialState = {
  state: Synchronizing,
  usedVolume: 0,
  totalVolume: 25,
  disabled: false,
};

export const reducer = handleActions(
  {
    [types.PAUSE]: state => ({
      ...state,
      state: Paused,
    }),
    [types.RESTART]: state => ({
      ...state,
      state: Synchronizing,
    }),
    [types.ENABLE]: state => ({
      ...state,
      disabled: false,
    }),
    [types.DISABLE]: state => ({
      ...state,
      disabled: true,
    }),
    [types.SET_VOLUME_SIZE]: (state, action) => ({
      ...state,
      usedVolume: action.payload,
    }),
    [types.SET_TOTAL_VOLUME_SIZE]: (state, action) => ({
      ...state,
      totalVolume: action.payload,
    }),
  },
  InitialState
);

export default reducer;
