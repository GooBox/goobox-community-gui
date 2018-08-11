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
import {BlueButton, WhiteButton} from "../../../../src/render/installer/components/buttons";
import StorjRegistration from "../../../../src/render/installer/components/storj-registration";

describe("StorjRegistration component", () => {

  const sampleEmail = "test@example.com";
  const samplePassword = "1234567";

  const login = jest.fn();
  const back = jest.fn();
  const next = jest.fn();

  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallow(
      <StorjRegistration onClickLogin={login} onClickBack={back} onClickNext={next} processing={false}/>
    );
  });

  it("has background-gradation class", () => {
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("has an input box for a user's email address and email state to remember the address", () => {
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

  it("disables the input box for the email address when processing is true", () => {
    wrapper.setProps({processing: true});
    const email = wrapper.find("#email");
    expect(email.exists()).toBeTruthy();
    expect(email.hasClass("warn")).toBeFalsy();

    const oldEmail = wrapper.state("email");
    const newEmail = "test@example.com";
    email.simulate("change", {
      target: {
        value: newEmail
      }
    });
    expect(wrapper.state("email")).toEqual(oldEmail);
  });

  it("has an input box for a user's password", () => {
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

  it("disables the input box for the password when processing is true", () => {
    wrapper.setProps({processing: true});
    const password = wrapper.find("#password");
    expect(password.exists()).toBeTruthy();
    expect(password.hasClass("warn")).toBeFalsy();

    const oldPassword = wrapper.state("password");
    const newPassword = "1234567";
    password.simulate("change", {
      target: {
        value: newPassword
      }
    });
    expect(wrapper.state("password")).toEqual(oldPassword);
  });

  it("has a button to login", () => {
    const btn = wrapper.find("#login-btn");
    expect(btn.exists()).toBeTruthy();

    btn.simulate("click");
    expect(login).toHaveBeenCalled();
  });

  it("disables the login button when processing is true", () => {
    wrapper.setProps({processing: true});
    const btn = wrapper.find("#login-btn");
    expect(btn.exists()).toBeTruthy();

    btn.simulate("click");
    expect(login).not.toHaveBeenCalled();
  });

  it("has a back link", () => {
    wrapper.find(WhiteButton).prop("onClick")();
    expect(back).toHaveBeenCalled();
  });

  it("disables the back link when processing is ture", () => {
    wrapper.setProps({processing: true});
    wrapper.find(WhiteButton).prop("onClick")();
    expect(back).not.toHaveBeenCalled();
  });

  it("has a next link", () => {
    wrapper.setState({
      email: sampleEmail,
      password: samplePassword,
    });

    wrapper.find(BlueButton).prop("onClick")();
    expect(next).toHaveBeenCalledWith({
      email: sampleEmail,
      password: samplePassword,
    });
  });

  it("disables the next link when processing is true", () => {
    wrapper.setProps({processing: true});
    wrapper.setState({
      email: sampleEmail,
      password: samplePassword,
    });

    wrapper.find(BlueButton).prop("onClick")();
    expect(next).not.toHaveBeenCalled();
  });

  it("sets warn class if emailWarn is true", () => {
    wrapper.setState({emailWarn: true});
    expect(wrapper.find("#email").hasClass("warn")).toBeTruthy();
  });

  it("sets warn class if passwordWarn is true", () => {
    wrapper.setState({passwordWarn: true});
    expect(wrapper.find("#password").hasClass("warn")).toBeTruthy();
  });

  it("shows an info message when any warnings are not set", () => {
    expect(wrapper.find(".info").exists()).toBeTruthy();
    expect(wrapper.find(".warnMsg").exists()).toBeFalsy();
  });

  it("shows a warn message when emailWarn is true", () => {
    wrapper.setState({emailWarn: true});
    expect(wrapper.find(".info").exists()).toBeFalsy();
    expect(wrapper.find(".warnMsg").exists()).toBeTruthy();
  });

  it("shows a warn message when passwordWarn is true", () => {
    wrapper.setState({passwordWarn: true});
    expect(wrapper.find(".info").exists()).toBeFalsy();
    expect(wrapper.find(".warnMsg").exists()).toBeTruthy();
  });

  it("sets emailWarn true if the next link is clicked but email is empty", () => {
    wrapper.setState({
      password: samplePassword,
    });

    wrapper.find(BlueButton).prop("onClick")();
    expect(next).not.toHaveBeenCalled();
    expect(wrapper.state("emailWarn")).toBeTruthy();
  });

  it("sets passwordWarn true if the next link is clicked but password is empty", () => {
    wrapper.setState({
      email: sampleEmail,
    });

    wrapper.find(BlueButton).prop("onClick")();
    expect(next).not.toHaveBeenCalled();
    expect(wrapper.state("passwordWarn")).toBeTruthy();
  });

  it("takes emailWarn prop and sets the given value to emailWarn state", () => {
    wrapper.setProps({emailWarn: true});
    expect(wrapper.state("emailWarn")).toBeTruthy();
  });

  it("takes passowrdWarn prop and sets the given value to passwordWarn state", () => {
    wrapper.setProps({passwordWarn: true});
    expect(wrapper.state("passwordWarn")).toBeTruthy();
  });

  it("takes a warning message and uses it", () => {
    const msg = "expected warning";
    wrapper.setProps({passwordWarn: true, warnMsg: msg});
    expect(wrapper.find(".warnMsg").html()).toContain(msg);
  });

  it("sets new given props to states by componentWillReceiveProps", () => {
    expect(wrapper.state("emailWarn")).toBeFalsy();
    expect(wrapper.state("passwordWarn")).toBeFalsy();
    wrapper.instance().componentWillReceiveProps({
      emailWarn: true,
      passwordWarn: true,
    });
    expect(wrapper.state("emailWarn")).toBeTruthy();
    expect(wrapper.state("passwordWarn")).toBeTruthy();
  });

});
