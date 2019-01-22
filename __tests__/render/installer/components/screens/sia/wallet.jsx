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

import {mount} from "enzyme";
import React from "react";
import {StaticRouter} from "react-router";
import CopyButton from "../../../../../../src/render/installer/components/buttons/copy-button";
import {Main} from "../../../../../../src/render/installer/components/partials/main";
import Wallet from "../../../../../../src/render/installer/components/screens/sia/wallet";
import {SiaWallet} from "../../../../../../src/render/installer/constants/screens";

describe("Wallet component", () => {

  const address = "address:12345678901234567890";
  const seed = "seed:12345678901234567890";
  const prev = "previous-screen";
  const next = "next-screen";
  const onClickNext = jest.fn();

  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = mount(
      <StaticRouter location={SiaWallet} context={{}}>
        <Wallet address={address} seed={seed} prev={prev} next={next} onClickNext={onClickNext}/>
      </StaticRouter>);
  });

  it("renders Main component", () => {
    const c = wrapper.find(Main);
    expect(c.prop("next")).toEqual(next);
    expect(c.prop("prev")).toEqual(prev);
    expect(c.prop("onClickNext")).toEqual(onClickNext);
    expect(c.prop("processing")).toBeFalsy();
  });

  it("shows a wallet address given via wallet prop", () => {
    expect(wrapper.find("input#address").prop("value")).toEqual(address);
  });

  it("shows a seed given via seed prop", () => {
    expect(wrapper.find("textarea#seed").prop("value")).toEqual(seed);
  });

  it("renders CopyButton for address", () => {
    expect(wrapper.find(CopyButton).filter("#copy-address-btn").prop("text")).toEqual(address);
  });

  it("renders CopyButton for seed", () => {
    expect(wrapper.find(CopyButton).filter("#copy-seed-btn").prop("text")).toEqual(seed);
  });

});
