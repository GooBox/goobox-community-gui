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
import StorjRegistration from "../src/storj-registration.jsx";

describe("StorjRegistration component", () => {

  const sampleEmail = "test@example.com";
  const samplePassword = "1234567";

  let wrapper, login, back, next;
  beforeEach(() => {
    login = jest.fn();
    back = jest.fn();
    next = jest.fn();
    wrapper = shallow(
      <StorjRegistration onClickLogin={login} onClickBack={back} onClickNext={next}/>
    );
  });

  it("has background-gradation class", () => {
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("has an input box for an email address and email state", () => {
    const email = wrapper.find("#email");
    expect(email.exists()).toBeTruthy();
    expect(email.hasClass("warn")).toBeFalsy();

    const sampleEmail = "test@example.com";
    email.simulate("change", {
      target: {
        value: sampleEmail
      }
    });
    expect(wrapper.state("email")).toEqual(sampleEmail);
  });

  it("has an input box for a password", () => {
    const password = wrapper.find("#password");
    expect(password.exists()).toBeTruthy();
    expect(password.hasClass("warn")).toBeFalsy();

    const samplePassword = "1234567";
    password.simulate("change", {
      target: {
        value: samplePassword
      }
    });
    expect(wrapper.state("password")).toEqual(samplePassword);
  });

  it("has a button to login", () => {
    const btn = wrapper.find("#login-btn");
    expect(btn.exists()).toBeTruthy();

    btn.simulate("click");
    expect(login).toHaveBeenCalledTimes(1);
  });

  it("has a back link", () => {
    const link = wrapper.find(".back-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("has a next link", () => {
    wrapper.setState({
      email: sampleEmail,
      password: samplePassword,
    });

    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      email: sampleEmail,
      password: samplePassword,
    });
  });

  it("sets warn class if emailWarn is true", () => {
    wrapper.setState({emailWarn: true});
    expect(wrapper.find("#email").hasClass("warn")).toBeTruthy();
  });

  it("sets warn class if passwordWarn is true", () => {
    wrapper.setState({passwordWarn: true});
    expect(wrapper.find("#password").hasClass("warn")).toBeTruthy();
  });

  it("sets emailWarn true if the next link is clicked but email is empty", () => {
    wrapper.setState({
      password: samplePassword,
    });

    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(next).not.toHaveBeenCalled();
    expect(wrapper.state("emailWarn")).toBeTruthy();
  });

  it("sets passwordWarn true if the next link is clicked but password is empty", () => {
    wrapper.setState({
      email: sampleEmail,
    });

    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(next).not.toHaveBeenCalled();
    expect(wrapper.state("passwordWarn")).toBeTruthy();
  });

});
