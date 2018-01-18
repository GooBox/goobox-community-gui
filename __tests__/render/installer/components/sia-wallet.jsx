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
import SiaWallet from "../../../../src/render/installer/components/sia-wallet.jsx";

describe("SiaWallet component", () => {

  const wallet = "12345678901234567890";
  const seed = "12345678901234567890";
  let wrapper, back, next;
  beforeEach(() => {
    back = jest.fn();
    next = jest.fn();
    wrapper = shallow(<SiaWallet address={wallet} seed={seed} onClickBack={back} onClickNext={next}/>);
  });

  it("has background-gradation class", () => {
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("shows a wallet address given via wallet prop", () => {
    expect(wrapper.find("#address").prop("value")).toEqual(wallet);
  });

  it("shows a seed given via seed prop", () => {
    expect(wrapper.find("#seed").text()).toEqual(seed);
  });

  it("has a back link", () => {
    const link = wrapper.find(".back-btn");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("has a login link", () => {
    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(next).toHaveBeenCalledTimes(1);
  });

});