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
import SelectService from "../../../../src/render/installer/components/select-service";

describe("SelectService component", () => {

  const storj = jest.fn();
  const sia = jest.fn();
  const both = jest.fn();
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallow(<SelectService onSelectStorj={storj} onSelectSia={sia} onSelectBoth={both} processing={false}/>);
  });

  it("doesn't have background-gradation class", () => {
    expect(wrapper.hasClass("background-gradation")).toBeFalsy();
  });

  it("has a link to choose Storj", () => {
    const link = wrapper.find("#option-storj");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(storj).toHaveBeenCalled();
  });

  it("prevents the storj button when processing is true", () => {
    wrapper.setProps({processing: true});
    const link = wrapper.find("#option-storj");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(storj).not.toHaveBeenCalled();
  });

  it("has a link to choose sia", () => {
    const link = wrapper.find("#option-sia");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(sia).toHaveBeenCalled();
  });

  it("presents the sia button when processing is true", () => {
    wrapper.setProps({processing: true});
    const link = wrapper.find("#option-sia");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(sia).not.toHaveBeenCalled();
  });

  it("has a link to choose both storj and sia", () => {
    const link = wrapper.find("#option-both");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(both).toHaveBeenCalled();
  });

  it("prevents the storj and sia button when processing is true", () => {
    wrapper.setProps({processing: true});
    const link = wrapper.find("#option-both");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(both).not.toHaveBeenCalled();
  });

});
