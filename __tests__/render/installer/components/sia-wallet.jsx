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

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {mount} from "enzyme";
import React from "react";
import {CopyToClipboard} from "react-copy-to-clipboard";
import SiaWallet from "../../../../src/render/installer/components/sia-wallet";

describe("SiaWallet component", () => {

  const address = "address:12345678901234567890";
  const seed = "seed:12345678901234567890";
  const back = jest.fn();
  const next = jest.fn();

  let wrapper;
  beforeEach(() => {
    back.mockClear();
    next.mockClear();
    wrapper = mount(<SiaWallet address={address} seed={seed} onClickBack={back} onClickNext={next}/>);
  });

  it("shows a wallet address given via wallet prop", () => {
    expect(wrapper.find("input#address").prop("value")).toEqual(address);
  });

  it("shows a seed given via seed prop", () => {
    expect(wrapper.find("textarea#seed").prop("value")).toEqual(seed);
  });

  it("has a back button", () => {
    const link = wrapper.find("button#back-btn");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("has a next button", () => {
    const link = wrapper.find("button#next-btn");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("shows fa-clone icon in copy address button if addressCopied is false", () => {
    wrapper.setState({addressCopied: false});
    expect(wrapper.find("#copy-address-btn").find(FontAwesomeIcon).prop("icon")).toEqual(["far", "clone"]);
  });

  it("shows fa-check-circle icon in copy address button if addressCopied is true", () => {
    wrapper.setState({addressCopied: true});
    expect(wrapper.find("#copy-address-btn").find(FontAwesomeIcon).prop("icon")).toEqual(["far", "check-circle"]);
  });

  it("copies the given address and set true to addressCopied if the button is clicked", () => {
    const btn = wrapper.find(CopyToClipboard).filterWhere(v => v.prop("text") === address);
    expect(btn.exists()).toBeTruthy();

    btn.prop("onCopy")();
    expect(wrapper.state("addressCopied")).toBeTruthy();
  });

  it("shows fa-clone icon in copy address button if seedCopied is false", () => {
    wrapper.setState({seedCopied: false});
    expect(wrapper.find("#copy-seed-btn").find(FontAwesomeIcon).prop("icon")).toEqual(["far", "clone"]);
  });

  it("shows fa-check-circle icon in copy address button if seedCopied is true", () => {
    wrapper.setState({seedCopied: true});
    expect(wrapper.find("#copy-seed-btn").find(FontAwesomeIcon).prop("icon")).toEqual(["far", "check-circle"]);
  });

  it("copies the given seed and set true to seedCopied if the button is clicked", () => {
    const btn = wrapper.find(CopyToClipboard).filterWhere(v => v.prop("text") === seed);
    expect(btn.exists()).toBeTruthy();

    btn.prop("onCopy")();
    expect(wrapper.state("seedCopied")).toBeTruthy();
  });

});
