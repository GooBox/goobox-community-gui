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
import ProgressBar from "../../../../src/render/installer/components/progress-bar";

describe("ProgressBar component", () => {

  const progress = 24;

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<ProgressBar progress={progress}/>);
  });

  it("renders a parent element which has meter class", () => {
    expect(wrapper.hasClass("meter")).toBeTruthy();
  });

  it("renders a child element which has bar class and width is the given progress", () => {
    expect(wrapper.find(".bar").prop("style")).toHaveProperty("width", `${progress}%`);
  });

});
