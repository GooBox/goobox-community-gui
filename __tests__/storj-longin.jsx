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

import {shallow} from "enzyme";
import React from "react";
import StorjLogin from "../src/storj-login.jsx";

describe("StorjLogin component", () => {

  it("has background-gradation class", () => {
    const wrapper = shallow(<StorjLogin/>);
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("has an input box for an email address and email state", () => {
    const wrapper = shallow(<StorjLogin/>);
    const email = wrapper.find("#email");
    expect(email.exists()).toBeTruthy();

    const sampleEmail = "test@example.com";
    email.simulate("change", {
      target: {
        value: sampleEmail
      }
    });
    expect(wrapper.state("email")).toEqual(sampleEmail);
  });

  it("has an input box for a password", () => {
    const wrapper = shallow(<StorjLogin/>);
    const password = wrapper.find("#password");
    expect(password.exists()).toBeTruthy();

    const samplePassword = "1234567";
    password.simulate("change", {
      target: {
        value: samplePassword
      }
    });
    expect(wrapper.state("password")).toEqual(samplePassword);
  });

  it("has an input box for an encryption key", () => {
    const wrapper = shallow(<StorjLogin/>);
    const key = wrapper.find("#key");
    expect(key.exists()).toBeTruthy();

    const sampleKey = "abcdefg";
    key.simulate("change", {
      target: {
        value: sampleKey
      }
    });
    expect(wrapper.state("key")).toEqual(sampleKey);
  });

  it("has a button to create an account", () => {
    const fn = jest.fn();
    const wrapper = shallow(<StorjLogin onClickCreateAccount={fn}/>);
    const btn = wrapper.find("#create-account-btn");
    expect(btn.exists()).toBeTruthy();

    btn.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has a back link which invokes onClickBack function", () => {
    const fn = jest.fn();
    const wrapper = shallow(<StorjLogin onClickBack={fn}/>);

    const back = wrapper.find(".back-btn");
    expect(back.exists()).toBeTruthy();
    back.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has a next link which invokes onClickFinish function with given account information", () => {
    const fn = jest.fn();
    const wrapper = shallow(<StorjLogin onClickFinish={fn}/>);

    const sampleEmail = "test@example.com";
    const samplePassword = "1234567";
    const sampleKey = "abcdefg";
    wrapper.find("#email").simulate("change", {
      target: {
        value: sampleEmail
      }
    });
    wrapper.find("#password").simulate("change", {
      target: {
        value: samplePassword
      }
    });
    wrapper.find("#key").simulate("change", {
      target: {
        value: sampleKey
      }
    });

    const next = wrapper.find(".next-btn");
    expect(next.exists()).toBeTruthy();
    next.simulate("click");
    expect(fn).toHaveBeenCalledWith({
      email: sampleEmail,
      password: samplePassword,
      encryptionKey: sampleKey
    });
  });

});