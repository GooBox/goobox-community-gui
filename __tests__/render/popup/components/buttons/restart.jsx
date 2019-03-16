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
import {shallow} from "enzyme";
import React from "react";
import {Synchronizing} from "../../../../../src/constants";
import RestartBtn from "../../../../../src/render/popup/components/buttons/restart";

describe("RestartBtn component", () => {
  const onChangeState = jest.fn();

  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallow(<RestartBtn onChangeState={onChangeState} />);
  });

  it("renders far-play-circle icon", () => {
    expect(wrapper.find(FontAwesomeIcon).prop("icon")).toEqual([
      "far",
      "play-circle",
    ]);
  });

  it("invokes onChangeState with Paused if the button is clicked", () => {
    wrapper.find("button").prop("onClick")();
    expect(onChangeState).toHaveBeenCalledWith(Synchronizing);
  });
});
