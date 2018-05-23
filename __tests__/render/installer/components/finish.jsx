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
import Finish from "../../../../src/render/installer/components/finish.jsx";

describe("Finish component", () => {

  const header = "sample header";
  const message = "sample message";
  const onClick = jest.fn();

  let wrapper;
  beforeEach(() => {
    onClick.mockClear();
    wrapper = shallow(<Finish header={header} message={message} onClick={onClick}/>);
  });

  it("takes header prop and renders the given text", () => {
    expect(wrapper.find("h1").text()).toEqual(header);
  });

  it("takes message prop and renders the given text", () => {
    expect(wrapper.find("p").text()).toEqual(message);
  });

  it("has open my goobox button and invokes onClick if clicked", () => {
    const btn = wrapper.find("button");
    expect(btn.exists()).toBeTruthy();
    btn.simulate("click");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

});