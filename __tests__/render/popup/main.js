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

import {Synchronizing} from "../../../src/constants";
import {InitialState} from "../../../src/render/popup/main";

describe("InitialState", () => {

  it("sets synchronizing as the state", () => {
    expect(InitialState.state).toEqual(Synchronizing);
  });

  it("sets 0 as the used volume size", () => {
    expect(InitialState.usedVolume).toEqual(0);
  });

  it("sets 50 as the total volume size", () => {
    expect(InitialState.totalVolume).toEqual(50);
  });

  it("sets false as the disabled state", () => {
    expect(InitialState.disabled).toEqual(false);
  });

});

// describe("configureStore", () => {
//   configureStore;
// });

// describe("initPopup", () => {
//
//   it("has a store created by configureStore", () => {
//     const wrapper = mount(initPopup());
//     expect(wrapper.prop("store")).toEqual(configureStore(InitialState));
//     expect(wrapper.find("Status").exists()).toBeTruthy();
//   });
//
// });


