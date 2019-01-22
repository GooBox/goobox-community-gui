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
import Header from "../../../../src/render/popup/components/header";

describe("Header component", () => {
  const onClickSettings = jest.fn();
  const onClickInfo = jest.fn();

  let wrapper;
  beforeEach(() => {
    onClickSettings.mockClear();
    onClickInfo.mockClear();
    wrapper = shallow(
      <Header onClickSettings={onClickSettings} onClickInfo={onClickInfo} />
    );
  });

  it("has a settings button", () => {
    const settings = wrapper.find("#settings-btn");
    expect(settings.exists()).toBeTruthy();

    settings.simulate("click");
    expect(onClickSettings).toHaveBeenCalledTimes(1);
  });

  it("has an info button", () => {
    const info = wrapper.find("#info-btn");
    expect(info.exists()).toBeTruthy();

    info.simulate("click");
    expect(onClickInfo).toHaveBeenCalledTimes(1);
  });
});
