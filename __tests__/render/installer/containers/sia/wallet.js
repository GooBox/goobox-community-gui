/*
 * Copyright (C) 2017-2019 Junpei Kawamoto
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

import * as actions from "../../../../../src/render/installer/actions";
import * as screens from "../../../../../src/render/installer/constants/screens";
import {
  mapDispatchToProps,
  mapStateToProps,
  mergeProps
} from "../../../../../src/render/installer/containers/sia/wallet";

describe("mapStateToProps", () => {

  it("maps storj configuration", () => {
    const main = {
      storj: true,
      siaAccount: {
        address: "",
        seed: "",
      }
    };
    expect(mapStateToProps({main})).toEqual({
      ...main.siaAccount,
      mainState: main,
      next: screens.SiaFinish,
      prev: screens.StorjLogin,
    });
  });

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
      next: screens.SiaFinish,
      prev: screens.SiaSelected,
    });
  });

});

describe("mapDispatchToProps", () => {

  const dispatch = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps onClickNext to push SiaFinish", () => {
    mapDispatchToProps(dispatch).onClickNext();
    expect(dispatch).toHaveBeenCalledWith(actions.saveConfig());
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
      onClickNext: expect.any(Function),
    });
    res.onClickNext();
    expect(dispatchProps.onClickNext).toHaveBeenCalledWith(main);
  });

});

