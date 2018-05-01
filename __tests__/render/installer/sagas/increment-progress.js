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

import {delay} from "redux-saga";
import {call, put} from "redux-saga/effects";
import * as actions from "../../../../src/render/installer/actions/index";
import incrementProgress from "../../../../src/render/installer/sagas/increment-progress";

describe("incrementProgress", () => {

  it("yields calling delay with 500msec and putting set new progress value action", () => {
    const saga = incrementProgress();
    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
    expect(saga.next().value).toEqual(put(actions.setProgressValue(expect.any(Number))));
    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
  });

});


