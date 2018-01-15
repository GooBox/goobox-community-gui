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

import {push} from "react-router-redux";
import * as actions from "../../../../src/render/installer/actions";
import * as screens from "../../../../src/render/installer/constants/screens";
import {mapDispatchToProps, mapStateToProps, mergeProps} from "../../../../src/render/installer/containers/storj-login";
import {InitialState} from "../../../../src/render/installer/reducers";

describe("mapStateToProps", () => {

  it("maps processing, warning information, and main state", () => {
    const main = {
      processing: true,
      storjAccount: {
        emailWarn: false,
        passwordWarn: true,
        keyWarn: false,
        warnMsg: "warning",
      }
    };
    expect(mapStateToProps({main: main})).toEqual({
      processing: main.processing,
      ...main.storjAccount,
      mainState: main,
    });
  });

});

describe("mapDispatchToProps", () => {

  const dispatch = jest.fn();
  beforeEach(() => {
    dispatch.mockReset();
  });

  it("maps onClickBack to push StorjSelected", () => {
    mapDispatchToProps(dispatch).onClickBack();
    expect(dispatch).toHaveBeenCalledWith(push(screens.StorjSelected));
  });

  it("maps onClickNext to storjLogin action with the given main state", () => {
    const info = {
      email: "another@email.com",
      password: "another password",
      key: "yyy yyy yyy"
    };
    mapDispatchToProps(dispatch).onClickNext(InitialState, info);
    expect(dispatch).toHaveBeenCalledWith(actions.storjLogin({
      ...InitialState,
      storjAccount: info,
    }));
  });

  it("maps onClickCreateAccount to push StorjRegistration", () => {
    mapDispatchToProps(dispatch).onClickCreateAccount();
    expect(dispatch).toHaveBeenCalledWith(push(screens.StorjRegistration));
  });

});

describe("mergeProps", () => {

  it("merges props, bind onClickNext to the main state, and removes that state from the result", () => {
    const main = {
      processing: true,
      storjAccount: {
        emailWarn: false,
        passwordWarn: true,
        keyWarn: false,
        warnMsg: "warning",
      }
    };
    const stateProps = {
      processing: main.processing,
      ...main.storjAccount,
      mainState: main,
    };
    const dispatchProps = {
      onClickBack: jest.fn(),
      onClickNext: jest.fn(),
      onClickCreateAccount: jest.fn(),
    };
    const ownProps = {
      key: "value"
    };
    const res = mergeProps(stateProps, dispatchProps, ownProps);
    expect(res).toEqual({
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onClickNext: expect.any(Function),
      mainState: undefined,
    });
    res.onClickNext();
    expect(dispatchProps.onClickNext).toHaveBeenCalledWith(main);
  });

});


