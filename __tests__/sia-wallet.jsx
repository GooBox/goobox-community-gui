/*
 * Copyright (C) 2017 Junpei Kawamoto
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

import React from "react";
import {shallow} from "enzyme";
import SiaWallet from "../src/sia-wallet.jsx";

describe("SiaWallet component", () => {

  it("has background-gradation class", () => {
    const wrapper = shallow(<SiaWallet/>);
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("shows a wallet address given via wallet prop", () => {
    const wallet = "12345678901234567890";
    const wrapper = shallow(<SiaWallet address={wallet}/>);
    expect(wrapper.find("#wallet").prop("value")).toEqual(wallet);
  });

  it("shows a seed given via seed prop", () => {
    const seed = "12345678901234567890";
    const wrapper = shallow(<SiaWallet seed={seed}/>);
    expect(wrapper.find("#seed").text()).toEqual(seed);
  });

  it("has a back link", () => {
    const fn = jest.fn();
    const wrapper = shallow(<SiaWallet onClickBack={fn}/>);

    const link = wrapper.find(".back-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has a login link", () => {
    const fn = jest.fn();
    const wrapper = shallow(<SiaWallet onClickNext={fn}/>);

    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

});