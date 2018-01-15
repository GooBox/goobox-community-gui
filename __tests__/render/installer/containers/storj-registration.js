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
import {mapDispatchToProps, mapStateToProps} from "../../../../src/render/installer/containers/storj-registration";

describe("mapStateToProps", () => {

  it("maps processing and warning messages", () => {
    const main = {
      processing: true,
      storjAccount: {
        emailWarn: false,
        passwordWarn: true,
        warnMsg: "some message",
      }
    };
    expect(mapStateToProps({main: main})).toEqual({
      ...main.storjAccount,
      processing: main.processing,
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
    const info = "storj account information";
    mapDispatchToProps(dispatch).onClickNext(info);
    expect(dispatch).toHaveBeenCalledWith(actions.storjCreateAccount(info));
  });

  it("maps onClickLogin to push StorjLogin", () => {
    mapDispatchToProps(dispatch).onClickLogin();
    expect(dispatch).toHaveBeenCalledWith(push(screens.StorjLogin));
  });

});


