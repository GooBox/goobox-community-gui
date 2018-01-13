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
import {Paused, Synchronizing} from "../../../../src/constants";
import Status from "../../../../src/render/popup/components/status";


describe("Status component", () => {

  const used = 12.334;
  const total = 30;

  it("has a synchronized icon and text when the state is synchronizing", () => {
    const wrapper = shallow(<Status state={Synchronizing}/>);
    // expect(wrapper.find(".state-icon").prop("src")).toEqual("../resources/synchronized.svg");
    expect(wrapper.find(".state-text").text()).toEqual("Goobox is up to date.");
  });

  it("has a paused icon and text when the state is paused", () => {
    const wrapper = shallow(<Status state={Paused}/>);
    // expect(wrapper.find(".state-icon").prop("src")).toEqual("../resources/paused.svg");
    expect(wrapper.find(".state-text").text()).toEqual("File transfers paused.");
  });

  it("has a pause button when the state is synchronizing", () => {
    const fn = jest.fn();
    const wrapper = shallow(<Status state={Synchronizing} onChangeState={fn}/>);
    const pause = wrapper.find(".pause-sync-btn");
    expect(pause.exists()).toBeTruthy();

    pause.simulate("click");
    expect(fn).toHaveBeenCalledWith("paused");
  });

  it("has a restart button when the state is paused", () => {
    const fn = jest.fn();
    const wrapper = shallow(<Status state={Paused} onChangeState={fn}/>);
    const restart = wrapper.find(".sync-again-btn");
    expect(restart.exists()).toBeTruthy();

    restart.simulate("click");
    expect(fn).toHaveBeenCalledWith(Synchronizing);
  });

  it("has a settings button", () => {
    const fn = jest.fn();
    const wrapper = shallow(<Status onClickSettings={fn}/>);
    const settings = wrapper.find(".settings-btn");
    expect(settings.exists()).toBeTruthy();

    settings.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has an info button", () => {
    const fn = jest.fn();
    const wrapper = shallow(<Status onClickInfo={fn}/>);
    const info = wrapper.find(".info-btn");
    expect(info.exists()).toBeTruthy();

    info.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has a sync folder button", () => {
    const fn = jest.fn();
    const wrapper = shallow(<Status onClickSyncFolder={fn}/>);
    const folder = wrapper.find(".sync-folder");
    expect(folder.exists()).toBeTruthy();

    folder.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has an import drive button", () => {
    const fn = jest.fn();
    const wrapper = shallow(<Status onClickImportDrive={fn}/>);
    const drive = wrapper.find(".import-drive");
    expect(drive.exists()).toBeTruthy();

    drive.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has a usage text box", () => {
    const wrapper = shallow(<Status usedVolume={used}/>);
    const usage = wrapper.find(".usage");
    expect(usage.exists()).toBeTruthy();
    expect(usage.text()).toEqual(`Usage: ${used.toFixed(2)}GB`);
  });

  it("has a usage percentage box", () => {
    const wrapper = shallow(<Status usedVolume={used} totalVolume={total}/>);
    const usage = wrapper.find(".usage-rate");
    expect(usage.exists()).toBeTruthy();
    expect(usage.text()).toEqual(`${Math.round(used / total * 100)}% of ${total}GB`);
  });

  it("has a usage bar", () => {
    const wrapper = shallow(<Status usedVolume={used} totalVolume={total}/>);
    const usageBar = wrapper.find(".bar");
    expect(usageBar.exists()).toBeTruthy();
    expect(usageBar.prop("style")).toEqual({
      width: `${Math.round(used / total * 100)}%`
    });
  });

});

