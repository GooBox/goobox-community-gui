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
import {
  BlueButton,
  WhiteButton,
} from "../../../../../../src/render/installer/components/buttons";
import EmailConfirmation from "../../../../../../src/render/installer/components/screens/storj/email-confirmation";

describe.skip("EmailConfirmation", () => {
  const onClickBack = jest.fn();
  const onClickNext = jest.fn();

  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallow(
      <EmailConfirmation onClickBack={onClickBack} onClickNext={onClickNext} />
    );
  });

  it("has background-gradation class", () => {
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("has a back link", () => {
    expect(wrapper.find(WhiteButton).prop("onClick")).toEqual(onClickBack);
  });

  it("has a login link", () => {
    expect(wrapper.find(BlueButton).prop("onClick")).toEqual(onClickNext);
  });
});
