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

import {actionTypes} from "../constants";

export const InitialState = {
  // current screen.
  screen: "",
  // true if the user chooses Storj.
  storj: false,
  // true if the user chooses Sia.
  sia: false,
  // default sync folder: <home>/<app-name>
  folder: process.env.DEFAULT_SYNC_FOLDER,
  // Storj account information.
  storjAccount: {
    email: "",
    password: "",
    key: "xxxx xxxx xxxx xxxx xxxxx xxxxxx xxxxxx xxxx",
    emailWarn: false,
    passwordWarn: false,
    keyWarn: false,
    warnMsg: null,
  },
  // Sia account information.
  siaAccount: {
    address: "",
    seed: "",
  },
  // true if the background process is working.
  wait: false,
  // used to show current progress in a progress bar.
  progress: 0,
};

export default (state = InitialState, action) => {
  switch (action.type) {
    case actionTypes.SelectStorj:
      return {...state, storj: true, sia: false};

    case actionTypes.SelectSia:
      return {...state, storj: false, sia: true};

    case actionTypes.SelectBoth:
      return {...state, storj: true, sia: true};

    default:
      return state;
  }
};
