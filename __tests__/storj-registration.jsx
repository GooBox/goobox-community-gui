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
import StorjRegistration from "../src/storj-registration.jsx";

describe("StorjRegistration component", () => {

  it("has background-gradation class", () => {
    const wrapper = shallow(<StorjRegistration/>);
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("has an input box for an email address and email state", () => {
    const wrapper = shallow(<StorjRegistration/>);
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
    const wrapper = shallow(<StorjRegistration/>);
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

  it("has a button to login", () => {
    const fn = jest.fn();
    const wrapper = shallow(<StorjRegistration onClickLogin={fn}/>);
    const btn = wrapper.find("#login-btn");
    expect(btn.exists()).toBeTruthy();

    btn.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has a back link", () => {
    const fn = jest.fn();
    const wrapper = shallow(<StorjRegistration onClickBack={fn}/>);

    const link = wrapper.find(".back-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("has a next link", () => {
    const fn = jest.fn();
    const sampleEmail = "test@example.com";
    const samplePassword = "1234567";
    const wrapper = shallow(<StorjRegistration onClickNext={fn}/>);
    wrapper.setState({
      email: sampleEmail,
      password: samplePassword,
    });

    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({
      email: sampleEmail,
      password: samplePassword,
    });
  });

});
