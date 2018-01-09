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
import Finish from "../src/finish-all.jsx";

describe("Finish component", () => {

  let wrapper, back, close;
  beforeEach(() => {
    back = jest.fn();
    close = jest.fn();
    wrapper = shallow(<Finish onClickBack={back} onClickClose={close}/>);
  });

  it("has background-gradation class", () => {
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("has a back link", () => {
    const link = wrapper.find(".back-btn");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("has a login link", () => {
    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(close).toHaveBeenCalledTimes(1);
  });

});