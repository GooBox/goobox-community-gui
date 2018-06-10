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

jest.mock("../../../../src/config");
import {call, put} from "redux-saga/effects";
import {getConfig} from "../../../../src/config";
import {setTotalVolumeSize} from "../../../../src/render/popup/actions";
import updateTotalVolume from "../../../../src/render/popup/sagas/updateTotalVolume";


describe("updateTotalVolume", () => {

  beforeEach(() => {
    getConfig.mockReset();
  });

  it("sets the total volume size to 15.654GB when the user chooses Storj", () => {
    const saga = updateTotalVolume();
    expect(saga.next().value).toEqual(call(getConfig));
    expect(saga.next({storj: true}).value).toEqual(put(setTotalVolumeSize(15.654)));
    expect(saga.next().done).toBeTruthy();
  });

  it("sets the total volume size to 20GB when the user chooses Sia", () => {
    getConfig.mockReturnValue({
      sia: true,
    });
    const saga = updateTotalVolume();
    expect(saga.next().value).toEqual(call(getConfig));
    expect(saga.next({sia: true}).value).toEqual(put(setTotalVolumeSize(20)));
    expect(saga.next().done).toBeTruthy();
  });

});
