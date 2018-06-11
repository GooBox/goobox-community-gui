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

import {remote} from "electron";
import {call} from "redux-saga/effects";
import closeWindow from "../../../../src/render/installer/sagas/close-window";

describe("closeWindow", () => {

  it("yields close method of the current window", () => {
    const close = jest.fn();
    remote.getCurrentWindow.mockReturnValue({close});
    const saga = closeWindow();
    expect(saga.next().value).toEqual(call(remote.getCurrentWindow().close));
    expect(saga.next().done).toBeTruthy();
  });

});
