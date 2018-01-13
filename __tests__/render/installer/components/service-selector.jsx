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

import {shallow} from "enzyme";
import React from "react";
import ServiceSelector from "../../../../src/render/installer/components/service-selector.jsx";

describe("ServiceSelector component", () => {

  let wrapper, storj, sia, both;
  beforeEach(() => {
    storj = jest.fn();
    sia = jest.fn();
    both = jest.fn();
    wrapper = shallow(<ServiceSelector onSelectStorj={storj} onSelectSia={sia} onSelectBoth={both}/>);
  });

  it("doesn't have background-gradation class", () => {
    expect(wrapper.hasClass("background-gradation")).toBeFalsy();
  });

  it("has a link to choose Storj", () => {
    const link = wrapper.find(".option-storj");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(storj).toHaveBeenCalledTimes(1);
  });

  it("has a link to choose Sia", () => {
    const link = wrapper.find(".option-sia");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(sia).toHaveBeenCalledTimes(1);
  });

  it("has a link to choose Storj", () => {
    const link = wrapper.find(".option-both");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(both).toHaveBeenCalledTimes(1);
  });

});