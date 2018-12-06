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

import {mount} from "enzyme";
import React from "react";
import {Paused, Synchronizing} from "../../../../src/constants";
import Footer from "../../../../src/render/popup/components/footer";

describe("Footer component", () => {

  const used = 12.334;
  const total = 30;
  const onChangeState = jest.fn();

  let wrapper;
  beforeEach(() => {
    onChangeState.mockClear();
    wrapper = mount(<Footer
      usedVolume={used}
      totalVolume={total}
      state={Synchronizing}
      onChangeState={onChangeState}
    />);
  });

  it("has a synchronized icon and text when the state is synchronizing", () => {
    expect(wrapper.find(".state-icon").prop("icon")).toEqual(["far", "pause-circle"]);
    expect(wrapper.find(".state-text").text()).toEqual("Goobox is up to date.");
  });

  it("has a paused icon and text when the state is paused", () => {
    wrapper.setProps({state: Paused});
    expect(wrapper.find(".state-icon").prop("icon")).toEqual(["far", "play-circle"]);
    expect(wrapper.find(".state-text").text()).toEqual("File transfers paused.");
  });

  it("has a pause button when the state is synchronizing", () => {
    const pause = wrapper.find(".pause-sync-btn");
    expect(pause.exists()).toBeTruthy();

    pause.simulate("click");
    expect(onChangeState).toHaveBeenCalledWith("paused");
  });

  it("has a restart button when the state is paused", () => {
    wrapper.setProps({state: Paused});
    const restart = wrapper.find(".sync-again-btn");
    expect(restart.exists()).toBeTruthy();

    restart.simulate("click");
    expect(onChangeState).toHaveBeenCalledWith(Synchronizing);
  });

  it("has a usage percentage box", () => {
    const usage = wrapper.find(".usage-rate");
    expect(usage.exists()).toBeTruthy();
    expect(usage.text()).toEqual(`Using ${Math.round(used / total * 100)}% of ${total}GB`);
  });

});
