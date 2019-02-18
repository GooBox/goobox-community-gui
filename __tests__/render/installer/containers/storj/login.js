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
import {
  mapDispatchToProps,
  mapStateToProps,
  mergeProps,
} from "../../../../../src/render/installer/containers/storj/login";
import {InitialState} from "../../../../../src/render/installer/reducers";

describe("Login container", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("mapStateToProps", () => {
    it("maps processing, warning information, and main state", () => {
      const main = {
        processing: true,
        storjAccount: {
          key: "abcdefg",
          emailWarn: false,
          passwordWarn: true,
          keyWarn: false,
          warnMsg: "warning",
        },
      };
      expect(mapStateToProps({main})).toEqual({
        processing: main.processing,
        encryptionKey: main.storjAccount.key,
        emailWarn: main.storjAccount.emailWarn,
        passwordWarn: main.storjAccount.passwordWarn,
        keyWarn: main.storjAccount.keyWarn,
        warnMsg: main.storjAccount.warnMsg,
        mainState: main,
      });
    });
  });

  describe("mapDispatchToProps", () => {
    const dispatch = jest.fn();

    it("maps onClickNext to storjLogin action with the given main state", () => {
      const info = {
        email: "another@email.com",
        password: "another password",
        key: "yyy yyy yyy",
      };
      mapDispatchToProps(dispatch).onClickNext(InitialState, info);
      expect(dispatch).toHaveBeenCalledWith(
        actions.storjLogin({
          ...InitialState,
          storjAccount: info,
        })
      );
    });

    it("maps onClickGenerateMnemonic to StorjGenerateMnemonic action", () => {
      mapDispatchToProps(dispatch).onClickGenerateSeed(InitialState);
      expect(dispatch).toHaveBeenCalledWith(
        actions.storjGenerateMnemonic({
          folder: InitialState.folder,
        })
      );
    });
  });

  describe("mergeProps", () => {
    const main = {
      processing: true,
      storjAccount: {
        emailWarn: false,
        passwordWarn: true,
        keyWarn: false,
        warnMsg: "warning",
      },
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
      onClickGenerateSeed: jest.fn(),
    };
    const ownProps = {
      key: "value",
    };

    it("merges props, bind onClickNext to the main state, and removes that state from the result", () => {
      const res = mergeProps(stateProps, dispatchProps, ownProps);
      expect(res).toEqual({
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onClickNext: expect.any(Function),
        onClickGenerateSeed: expect.any(Function),
        mainState: undefined,
      });
      res.onClickNext();
      expect(dispatchProps.onClickNext).toHaveBeenCalledWith(main);
      res.onClickGenerateSeed();
      expect(dispatchProps.onClickGenerateSeed).toHaveBeenCalledWith(main);
    });
  });
});
