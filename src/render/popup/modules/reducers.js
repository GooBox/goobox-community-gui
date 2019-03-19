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

import {handleActions} from "redux-actions";
import {Paused, Synchronizing} from "../../../constants";
import * as constants from "../constants";

export const InitialState = {
  state: Synchronizing,
  usedVolume: 0,
  totalVolume: 25,
  disabled: false,
};

export const reducer = handleActions(
  {
    [constants.Pause]: state => ({
      ...state,
      state: Paused,
    }),
    [constants.Restart]: state => ({
      ...state,
      state: Synchronizing,
    }),
    [constants.Enable]: state => ({
      ...state,
      disabled: false,
    }),
    [constants.Disable]: state => ({
      ...state,
      disabled: true,
    }),
    [constants.SetVolumeSize]: (state, action) => ({
      ...state,
      usedVolume: action.payload,
    }),
    [constants.SetTotalVolumeSize]: (state, action) => ({
      ...state,
      totalVolume: action.payload,
    }),
  },
  InitialState
);

export default reducer;
