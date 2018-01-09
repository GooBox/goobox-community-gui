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
import Welcome from "../src/welcome.jsx";

describe("Welcome component", () => {

  let wrapper, next;
  beforeEach(() => {
    next = jest.fn();
    wrapper = shallow(<Welcome onClickNext={next}/>);
  });

  it("has background-gradation class", () => {
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("has a link to move next screen", () => {
    const link = wrapper.find("a");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(next).toHaveBeenCalledTimes(1);
  });

});