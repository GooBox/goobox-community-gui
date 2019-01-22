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

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {mount} from "enzyme";
import React from "react";
import {CopyToClipboard} from "react-copy-to-clipboard";
import CopyButton from "../../../../../src/render/installer/components/buttons/copy-button";

describe("CopyButton component", () => {

  const text = "sample text";

  let wrapper;
  beforeEach(() => {
    wrapper = mount(<CopyButton text={text}/>);
  });

  it("renders CopyToClipboard component with the given text", () => {
    expect(wrapper.find(CopyToClipboard).prop("text")).toEqual(text);
  });

  it("renders far-clone icon if copied state is false", () => {
    expect(wrapper.find(FontAwesomeIcon).prop("icon")).toEqual(["far", "clone"]);
  });

  it("renders far-check-circle icon if copied state is true", () => {
    wrapper.setState({copied: true});
    expect(wrapper.find(FontAwesomeIcon).prop("icon")).toEqual(["far", "check-circle"]);
    expect(wrapper.text()).toContain("copied");
  });

});
