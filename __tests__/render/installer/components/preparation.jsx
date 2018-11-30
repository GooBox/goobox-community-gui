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
import Preparation from "../../../../src/render/installer/components/preparation";

describe("Preparation component", () => {

  const progress = 39;

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Preparation progress={progress}/>);
  });

  it("takes progress prop and shows a progress bar", () => {
    expect(wrapper.find(".bar").prop("style").width).toEqual(`${progress}%`);
  });

  it("shows an error message instead of the given message if given", () => {
    const errorMsg = "expected error";
    wrapper = shallow(<Preparation progress={progress} errorMsg={errorMsg}/>);

    const msg = wrapper.find("#message");
    expect(msg.text()).toContain(errorMsg);
    expect(msg.hasClass("text-warning")).toBeTruthy();
  });

  it("has wait class", () => {
    expect(wrapper.hasClass("wait")).toBeTruthy();
  });

  it("doesn't have wait class if error message is given", () => {
    const errorMsg = "expected error";
    wrapper = shallow(<Preparation progress={progress} errorMsg={errorMsg}/>);
    expect(wrapper.hasClass("wait")).toBeFalsy();
  });

});
