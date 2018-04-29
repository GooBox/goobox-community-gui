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
import StorjLogin from "../../../../src/render/installer/components/storj-login.jsx";

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
      <StorjLogin onClickBack={back} onClickNext={finish} onClickCreateAccount={createAccount} processing={false}/>
    );
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

  it("disables updating the input box for the email address when processing is true", () => {
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

  it("disables updating the input box for the password when processing is true", () => {
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

  it("has an input box for a user's encryption key", () => {
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

  it("disables updating the input box for the encryption key when processing is true", () => {
    wrapper.setProps({processing: true});
    const key = wrapper.find("#key");
    expect(key.exists()).toBeTruthy();
    expect(key.hasClass("warn")).toBeFalsy();

    const oldKey = wrapper.state("key");
    const newKey = "abcdefg";
    key.simulate("change", {
      target: {
        value: newKey
      }
    });
    expect(wrapper.state("key")).toEqual(oldKey);
  });

  // it("has a button to create an account", () => {
  //   const btn = wrapper.find("#create-account-btn");
  //   expect(btn.exists()).toBeTruthy();
  //
  //   btn.simulate("click");
  //   expect(createAccount).toHaveBeenCalled();
  // });
  //
  // it("disables the button to create an account when processing is true", () => {
  //   wrapper.setProps({processing: true});
  //   const btn = wrapper.find("#create-account-btn");
  //   expect(btn.exists()).toBeTruthy();
  //
  //   btn.simulate("click");
  //   expect(createAccount).not.toHaveBeenCalled();
  // });

  it("has a back link which invokes onClickBack function", () => {
    const btn = wrapper.find("#back-btn");
    expect(btn.exists()).toBeTruthy();
    btn.simulate("click");
    expect(back).toHaveBeenCalled();
  });

  it("disables the back link when processing is true", () => {
    wrapper.setProps({processing: true});
    const btn = wrapper.find("#back-btn");
    expect(btn.exists()).toBeTruthy();
    btn.simulate("click");
    expect(back).not.toHaveBeenCalled();
  });

  it("has a next link which invokes onClickNext function with given account information", () => {
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

    const next = wrapper.find("#next-btn");
    expect(next.exists()).toBeTruthy();
    next.simulate("click");
    expect(finish).toHaveBeenCalledWith({
      email: sampleEmail,
      password: samplePassword,
      key: sampleKey
    });
  });

  it("disables the next link when processing is true", () => {
    wrapper.setProps({processing: true});
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
    const next = wrapper.find("#next-btn");
    expect(next.exists()).toBeTruthy();
    next.simulate("click");
    expect(finish).not.toHaveBeenCalled();
  });

  it("sets warn class if emailWarn state is true", () => {
    wrapper.setState({emailWarn: true});
    expect(wrapper.find("#email").hasClass("is-invalid")).toBeTruthy();
  });

  it("sets warn class if passwordWarn state is true", () => {
    wrapper.setState({passwordWarn: true});
    expect(wrapper.find("#password").hasClass("is-invalid")).toBeTruthy();
  });

  it("sets warn class if keyWarn state is true", () => {
    wrapper.setState({keyWarn: true});
    expect(wrapper.find("#key").hasClass("is-invalid")).toBeTruthy();
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

    const btn = wrapper.find("#next-btn");
    btn.simulate("click");
    expect(finish).not.toHaveBeenCalled();
    expect(wrapper.state("emailWarn")).toBeTruthy();
  });

  it("warns when the next button is clicked but password is empty", () => {
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

    const btn = wrapper.find("#next-btn");
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

    const btn = wrapper.find("#next-btn");
    btn.simulate("click");
    expect(finish).not.toHaveBeenCalled();
    expect(wrapper.state("keyWarn")).toBeTruthy();
  });

  it("takes emailWarn prop and sets the given value to emailWarn state", () => {
    wrapper = shallow(
      <StorjLogin onClickBack={back} onClickNext={finish} onClickCreateAccount={createAccount}
                  emailWarn={true} processing={false}/>
    );
    expect(wrapper.state("emailWarn")).toBeTruthy();
  });

  it("takes passowrdWarn prop and sets the given value to passwordWarn state", () => {
    wrapper = shallow(
      <StorjLogin onClickBack={back} onClickNext={finish} onClickCreateAccount={createAccount}
                  passwordWarn={true} processing={false}/>
    );
    expect(wrapper.state("passwordWarn")).toBeTruthy();
  });

  it("takes keyWarn prop and sets the given value to keyWarn state", () => {
    wrapper = shallow(
      <StorjLogin onClickBack={back} onClickNext={finish} onClickCreateAccount={createAccount}
                  keyWarn={true} processing={false}/>
    );
    expect(wrapper.state("keyWarn")).toBeTruthy();
  });

  it("sets new given props to states by componentWillReceiveProps", () => {
    expect(wrapper.state("emailWarn")).toBeFalsy();
    expect(wrapper.state("passwordWarn")).toBeFalsy();
    expect(wrapper.state("keyWarn")).toBeFalsy();
    wrapper.instance().componentWillReceiveProps({
      emailWarn: true,
      passwordWarn: true,
      keyWarn: true,
    });
    expect(wrapper.state("emailWarn")).toBeTruthy();
    expect(wrapper.state("passwordWarn")).toBeTruthy();
    expect(wrapper.state("keyWarn")).toBeTruthy();
  });

});