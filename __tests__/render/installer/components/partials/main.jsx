/*
 * Copyright (C) 2017-2019 Junpei Kawamoto
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
import {Link} from "react-router-dom";
import Main from "../../../../../src/render/installer/components/partials/main";

describe("Main component", () => {
  const prev = "previous-screen";
  const next = "next-screen";
  const onClickPrev = jest.fn();
  const onClickNext = jest.fn();

  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallow(
      <Main
        prev={prev}
        next={next}
        onClickNext={onClickNext}
        onClickPrev={onClickPrev}
      >
        <div id="child" />
      </Main>
    );
  });

  it("renders the given child", () => {
    expect(wrapper.find("#child").exists()).toBeTruthy();
  });

  it("has a prev button", () => {
    const c = wrapper.find(Link).filter("#prev-btn");
    expect(c.prop("to")).toEqual(prev);
    expect(c.prop("onClick")).toEqual(onClickPrev);
  });

  it("has a next button", () => {
    const c = wrapper.find(Link).filter("#next-btn");
    expect(c.prop("to")).toEqual(next);
    expect(c.prop("onClick")).toEqual(onClickNext);
  });

  it("hides the prev button if prev is empty", () => {
    wrapper.setProps({prev: ""});
    expect(
      wrapper
        .find(Link)
        .filter("#prev-btn")
        .hasClass("d-none")
    ).toBeTruthy();
  });

  it("hides the next button if next is empty", () => {
    wrapper.setProps({next: ""});
    expect(
      wrapper
        .find(Link)
        .filter("#next-btn")
        .hasClass("d-none")
    ).toBeTruthy();
  });

  it("renders the caption in the prev button if it is given", () => {
    wrapper.setProps({prevCaption: prev});
    expect(
      wrapper
        .find(Link)
        .filter("#prev-btn")
        .children()
        .text()
    ).toEqual(prev);
  });

  it("renders the caption in the next button if it is given", () => {
    wrapper.setProps({nextCaption: next});
    expect(
      wrapper
        .find(Link)
        .filter("#next-btn")
        .children()
        .text()
    ).toEqual(next);
  });
});
