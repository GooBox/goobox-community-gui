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
import {
  mapDispatchToProps,
  mapStateToProps,
  mergeProps
} from "../../../../src/render/installer/containers/storj-registration";

describe("mapStateToProps", () => {

  it("maps processing and warning messages", () => {
    const main = {
      processing: true,
      storjAccount: {
        emailWarn: false,
        passwordWarn: true,
        warnMsg: "some message",
      },
      folder: "/tmp"
    };
    expect(mapStateToProps({main})).toEqual({
      ...main.storjAccount,
      processing: main.processing,
      syncFolder: main.folder,
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

  it("maps onClickNext to storjCreateAccount action", () => {
    const syncFolder = "/tmp";
    const info = {
      email: "test@example.com",
      password: "password",
    };
    mapDispatchToProps(dispatch).onClickNext(syncFolder, info);
    expect(dispatch).toHaveBeenCalledWith(actions.storjCreateAccount({
      ...info,
      syncFolder,
    }));
  });

  it("maps onClickLogin to push StorjLogin", () => {
    mapDispatchToProps(dispatch).onClickLogin();
    expect(dispatch).toHaveBeenCalledWith(push(screens.StorjLogin));
  });

});

describe("mergeProps", () => {

  it("merges props, bind onClickNext to the main state, and removes that state from the result", () => {
    const main = {
      processing: true,
      storjAccount: {
        emailWarn: false,
        passwordWarn: true,
        warnMsg: "some message",
      },
      folder: "/tmp"
    };
    const stateProps = {
      ...main.storjAccount,
      processing: main.processing,
      syncFolder: main.syncFolder,
    };
    const dispatchProps = {
      onClickBack: jest.fn(),
      onClickNext: jest.fn(),
      onClickLogin: jest.fn(),
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
      syncFolder: undefined,
    });

    const accountInfo = {
      email: "test@exmaple.com",
      password: "password"
    };
    res.onClickNext(accountInfo);
    expect(dispatchProps.onClickNext).toHaveBeenCalledWith(main.syncFolder, accountInfo);
  });

});


