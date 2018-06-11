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
} from "../../../../src/render/installer/containers/select-folder";

describe("mapStateToProps", () => {

  it("maps storj, sia, folder, and mainState", () => {
    const main = {
      storj: false,
      sia: true,
      folder: "/tmp",
    };
    expect(mapStateToProps({main})).toEqual({
      ...main,
      mainState: main,
    });
  });

});

describe("mapDispatchToProps", () => {

  const dispatch = jest.fn();
  beforeEach(() => {
    dispatch.mockReset();
  });

  it("maps onClickBack to stopSyncApps and push ChooseCloudService", () => {
    mapDispatchToProps(dispatch).onClickBack();
    expect(dispatch).toHaveBeenCalledWith(actions.stopSyncApps());
    expect(dispatch).toHaveBeenCalledWith(push(screens.ChooseCloudService));
  });

  it("maps onClickNext to push StorjLogin if storj is true", () => {
    mapDispatchToProps(dispatch).onClickNext({storj: true});
    expect(dispatch).toHaveBeenCalledWith(push(screens.StorjLogin));
  });

  it("maps onClickNext to push SiaWallet if storj is false and siaAccount has address", () => {
    mapDispatchToProps(dispatch).onClickNext({storj: false, siaAccount: {address: "xxx xxx xxx"}});
    expect(dispatch).toHaveBeenCalledWith(push(screens.SiaWallet));
  });

  it("maps onClickNext to push SiaPreparation and requestSiaWalletInfo", () => {
    const mainState = {storj: false, siaAccount: {address: null}};
    mapDispatchToProps(dispatch).onClickNext(mainState);
    expect(dispatch).toHaveBeenCalledWith(push(screens.SiaPreparation));
    expect(dispatch).toHaveBeenCalledWith(actions.requestSiaWalletInfo(mainState));
  });

  it("maps onSelectFolder to selectFolder", () => {
    const folder = "/tmp";
    mapDispatchToProps(dispatch).onSelectFolder(folder);
    expect(dispatch).toHaveBeenCalledWith(actions.selectFolder(folder));
  });

});

describe("mergeProps", () => {

  it("merge props and bind mainState to onClickNext, then remove mainState", () => {
    const main = {
      storj: false,
      sia: true,
      folder: "/tmp",
    };
    const stateProps = {
      ...main,
      mainState: main,
    };
    const dispatchProps = {
      onClickBack: jest.fn(),
      onClickNext: jest.fn(),
      onSelectFolder: jest.fn(),
    };
    const ownProps = {
      some: "value"
    };

    const res = mergeProps(stateProps, dispatchProps, ownProps);
    expect(res).toEqual({
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onClickNext: expect.any(Function),
      mainState: undefined
    });
    res.onClickNext();
    expect(dispatchProps.onClickNext).toHaveBeenCalledWith(main);
  });

});




