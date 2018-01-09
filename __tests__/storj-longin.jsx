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
import StorjLogin from "../src/storj-login.jsx";

describe("StorjLogin component", () => {

  const sampleEmail = "test@example.com";
  const samplePassword = "1234567";
  const sampleKey = "abcdefg";

  let wrapper, back, finish, createAccount;
  beforeEach(() => {
    back = jest.fn();
    finish = jest.fn();
    createAccount = jest.fn();
    wrapper = shallow(
      <StorjLogin onClickBack={back} onClickFinish={finish} onClickCreateAccount={createAccount}/>
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

  it("has an input box for an encryption key", () => {
    const key = wrapper.find("#key");
    expect(key.exists()).toBeTruthy();
    expect(key.hasClass("warn")).toBeFalsy();

    const sampleKey = "abcdefg";
    key.simulate("change", {
      target: {
        value: sampleKey
      }
    });
    expect(wrapper.state("key")).toEqual(sampleKey);
  });

  it("has a button to create an account", () => {
    const btn = wrapper.find("#create-account-btn");
    expect(btn.exists()).toBeTruthy();

    btn.simulate("click");
    expect(createAccount).toHaveBeenCalledTimes(1);
  });

  it("has a back link which invokes onClickBack function", () => {
    const btn = wrapper.find(".back-btn");
    expect(btn.exists()).toBeTruthy();
    btn.simulate("click");
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("has a next link which invokes onClickFinish function with given account information", () => {
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
    expect(finish).toHaveBeenCalledWith({
      email: sampleEmail,
      password: samplePassword,
      encryptionKey: sampleKey
    });
  });

  it("sets warn class if emailWarn state is true", () => {
    wrapper.setState({emailWarn: true});
    expect(wrapper.find("#email").hasClass("warn")).toBeTruthy();
  });

  it("sets warn class if passwordWarn state is true", () => {
    wrapper.setState({passwordWarn: true});
    expect(wrapper.find("#password").hasClass("warn")).toBeTruthy();
  });

  it("sets warn class if keyWarn state is true", () => {
    wrapper.setState({keyWarn: true});
    expect(wrapper.find("#key").hasClass("warn")).toBeTruthy();
  });

  it("shows am info message when any warning isn't set", () => {
    expect(wrapper.find(".info").exists()).toBeTruthy();
    expect(wrapper.find(".warn").exists()).toBeFalsy();
  });

  it("shows a warn message when emailWarn is true", () => {
    wrapper.setState({emailWarn: true});
    expect(wrapper.find(".info").exists()).toBeFalsy();
    expect(wrapper.find(".warn").exists()).toBeTruthy();
  });

  it("shows a warn message when passwordWarn is true", () => {
    wrapper.setState({passwordWarn: true});
    expect(wrapper.find(".info").exists()).toBeFalsy();
    expect(wrapper.find(".warn").exists()).toBeTruthy();
  });

  it("shows a warn message when keyWarn is true", () => {
    wrapper.setState({keyWarn: true});
    expect(wrapper.find(".info").exists()).toBeFalsy();
    expect(wrapper.find(".warn").exists()).toBeTruthy();
  });

  it("warns when the next button is clicked but email address is empty", () => {
    wrapper.find("#email").simulate("change", {
      target: {
        value: ""
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

    const btn = wrapper.find(".next-btn");
    btn.simulate("click");
    expect(finish).not.toHaveBeenCalled();
    expect(wrapper.state("emailWarn")).toBeTruthy();
  });

  it("warns when the next button is clicked but passoword is empty", () => {
    wrapper.find("#email").simulate("change", {
      target: {
        value: sampleEmail
      }
    });
    wrapper.find("#password").simulate("change", {
      target: {
        value: ""
      }
    });
    wrapper.find("#key").simulate("change", {
      target: {
        value: sampleKey
      }
    });

    const btn = wrapper.find(".next-btn");
    btn.simulate("click");
    expect(finish).not.toHaveBeenCalled();
    expect(wrapper.state("passwordWarn")).toBeTruthy();
  });

  it("warns when the next button is clicked but key is empty", () => {
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
        value: ""
      }
    });

    const btn = wrapper.find(".next-btn");
    btn.simulate("click");
    expect(finish).not.toHaveBeenCalled();
    expect(wrapper.state("keyWarn")).toBeTruthy();
  });

});