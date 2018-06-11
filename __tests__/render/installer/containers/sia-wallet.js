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
import {mapDispatchToProps, mapStateToProps, mergeProps} from "../../../../src/render/installer/containers/sia-wallet";

describe("mapStateToProps", () => {

  it("maps siaAccount and main state", () => {
    const main = {
      siaAccount: {
        address: "0123456",
        seed: "xxx xxx xxx",
      }
    };
    expect(mapStateToProps({main})).toEqual({
      ...main.siaAccount,
      mainState: main,
    });
  });

});

describe("mapDispatchToProps", () => {

  const dispatch = jest.fn();
  beforeEach(() => {
    dispatch.mockReset();
  });

  it("maps onClickBack to push StorjLogin if storj is true", () => {
    mapDispatchToProps(dispatch).onClickBack({storj: true});
    expect(dispatch).toHaveBeenCalledWith(push(screens.StorjLogin));
  });

  it("maps onClickBack to push SiaSelected if storj is false", () => {
    mapDispatchToProps(dispatch).onClickBack({storj: false});
    expect(dispatch).toHaveBeenCalledWith(push(screens.SiaSelected));
  });

  it("maos onClickNext to push SiaFinish", () => {
    mapDispatchToProps(dispatch).onClickNext();
    expect(dispatch).toHaveBeenCalledWith(actions.saveConfig());
    expect(dispatch).toHaveBeenCalledWith(push(screens.SiaFinish));
  });

});

describe("mergeProps", () => {

  it("merges props, binds the main state to onClickBack, and removes the main state from the result", () => {
    const main = {
      siaAccount: {
        address: "0123456",
        seed: "xxx xxx xxx",
      }
    };
    const stateProps = {
      ...main.siaAccount,
      mainState: main,
    };
    const dispatchProps = {
      onClickBack: jest.fn(),
      onClickNext: jest.fn(),
    };
    const ownProps = {
      key: "value",
    };
    const res = mergeProps(stateProps, dispatchProps, ownProps);
    expect(res).toEqual({
      ...main.siaAccount,
      ...dispatchProps,
      ...ownProps,
      onClickBack: expect.any(Function),
      onClickNext: expect.any(Function),
    });
    res.onClickBack();
    expect(dispatchProps.onClickBack).toHaveBeenCalledWith(main);
    res.onClickNext();
    expect(dispatchProps.onClickNext).toHaveBeenCalledWith(main);
  });

});

