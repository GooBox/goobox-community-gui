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

import {Paused, Synchronizing} from "../../../src/constants";
import * as actions from "../../../src/render/popup/actions";
import {InitialState} from "../../../src/render/popup/main";
import reducer from "../../../src/render/popup/reducers";

describe("reducer", () => {

  it("sets state paused when pause action received", () => {
    expect(reducer(InitialState, actions.pause())).toEqual({...InitialState, state: Paused});
  });

  it("sets state synchronizing when restart action received", () => {
    expect(reducer(InitialState, actions.restart())).toEqual({...InitialState, state: Synchronizing});
  });

  it("sets disabled false when enable action received", () => {
    expect(reducer(InitialState, actions.enable())).toEqual({...InitialState, disabled: false});
  });

  it("sets disabled true when disable action received", () => {
    expect(reducer(InitialState, actions.disable())).toEqual({...InitialState, disabled: true});
  });

  it("passes throw a given state if other actions received", () => {
    expect(reducer(InitialState, {type: "some action"})).toEqual(InitialState);
  });

});
