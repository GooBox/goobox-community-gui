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
import Viewer from "../../../src/render/logviewer/viewer";

const noop = () => ({});

describe("Viewer component", () => {
  // eslint-disable-next-line no-unused-vars
  let componentDidMount, componentDidUpdate;
  beforeAll(() => {
    componentDidMount = jest
      .spyOn(Viewer.prototype, "componentDidMount")
      .mockImplementation(noop);
    componentDidUpdate = jest
      .spyOn(Viewer.prototype, "componentDidUpdate")
      .mockImplementation(noop);
  });

  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallow(<Viewer />);
  });

  it("has a list of strings as items state and renders them with ul", () => {
    const items = ["1", "2", "3"];
    wrapper.setState({items});
    items.forEach((item, i) => {
      const c = wrapper.find("li").at(i);
      expect(c.key()).toEqual(item);
      expect(c.text()).toEqual(item);
    });
  });

  it("fetches the log file and sets items state to the response", async () => {
    const items = ["1", "2", "3"];
    fetch.mockResponse(items.join("\n"));
    await wrapper.instance().fetchLogs();
    expect(wrapper.state("items")).toEqual(items);
  });
});
