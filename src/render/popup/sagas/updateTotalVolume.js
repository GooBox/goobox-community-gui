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

import {call, put} from "redux-saga/effects";
import {getConfig} from "../../../config";
import * as actions from "../actions";

export default function* updateTotalVolume() {
  const cfg = yield call(getConfig);
  if (cfg.storj) {
    yield put(actions.setTotalVolumeSize(15.654));
  } else {
    yield put(actions.setTotalVolumeSize(20));
  }
}
