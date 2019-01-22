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

import {push} from "connected-react-router";
import {delay} from "redux-saga";
import {call, fork, put} from "redux-saga/effects";
import * as ipcActions from "../../../../src/ipc/actions";
import sendAsync from "../../../../src/ipc/send";
import * as actions from "../../../../src/render/installer/actions/index";
import * as screens from "../../../../src/render/installer/constants/screens";
import incrementProgress from "../../../../src/render/installer/sagas/increment-progress";
import requestSiaWallet from "../../../../src/render/installer/sagas/request-sia-wallet";

describe("requestSiaWallet", () => {
  const dir = "/tmp";
  const action = {
    payload: {
      folder: dir,
    },
  };

  it("yields incrementProgress and sendAsync with a siaRequestWalletInfo ipc action", () => {
    const info = "wallet information";
    const inc = {
      cancel: jest.fn(),
    };
    const saga = requestSiaWallet(action);
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(
      call(sendAsync, ipcActions.siaRequestWalletInfo({syncFolder: dir}))
    );
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.next(info).value).toEqual(
      put(actions.requestSiaWalletInfoSuccess(info))
    );
    expect(inc.cancel).toHaveBeenCalled();
    expect(saga.next().value).toEqual(put(actions.setProgressValue(100)));

    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
    expect(saga.next().value).toEqual(put(push(screens.SiaWallet)));
    expect(saga.next().value).toEqual(put(actions.setProgressValue(0)));
    expect(saga.next().done).toBeTruthy();
  });

  it("yields setErrorMsg action and stops increasing progress when requestSiaWallet throws an error", () => {
    const err = "expected error";
    const inc = {
      cancel: jest.fn(),
    };
    const saga = requestSiaWallet(action);
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(
      call(sendAsync, ipcActions.siaRequestWalletInfo({syncFolder: dir}))
    );
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.throw(err).value).toEqual(
      put(actions.requestSiaWalletInfoFailure(err))
    );
    expect(inc.cancel).toHaveBeenCalled();
    expect(saga.next().done).toBeTruthy();
  });
});
