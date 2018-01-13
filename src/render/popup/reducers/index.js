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

import {Paused, Synchronizing} from "../../../constants";
import * as constants from "../constants";

export default (state, action) => {
  switch (action.type) {
    case constants.Pause:
      return {...state, state: Paused};

    case constants.Restart:
      return {...state, state: Synchronizing};

    case constants.Enable:
      return {...state, disabled: false};

    case constants.Disable:
      return {...state, disabled: true};

    default:
      return state;
  }
};
