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
import StorjEncryptionKey from "../src/storj-encryption-key.jsx";

describe("StorjEncryptionKey component", () => {

  it("has background-gradation class", () => {
    const wrapper = shallow(<StorjEncryptionKey/>);
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("shows an encryption key given via key property", () => {
    const encryptionKey = "1234567890abcdefghijklmn";
    const wrapper = shallow(<StorjEncryptionKey encryptionKey={encryptionKey}/>);
    expect(wrapper.find("#encryption-key").prop("value")).toEqual(encryptionKey);
  });

  it("has a back link", () => {
    const fn = jest.fn();
    const wrapper = shallow(<StorjEncryptionKey onClickBack={fn}/>);

    const link = wrapper.find(".back-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has a next link", () => {
    const fn = jest.fn();
    const wrapper = shallow(<StorjEncryptionKey onClickNext={fn}/>);

    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

});