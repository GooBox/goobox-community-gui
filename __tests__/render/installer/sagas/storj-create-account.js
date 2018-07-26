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
import {call, put} from "redux-saga/effects";
import * as ipcActions from "../../../../src/ipc/actions";
import sendAsync from "../../../../src/ipc/send";
import * as actions from "../../../../src/render/installer/actions/index";
import * as screens from "../../../../src/render/installer/constants/screens";
import storjCreateAccount from "../../../../src/render/installer/sagas/storj-create-account";

describe("storjCreateAccount", () => {

  const action = {
    payload: {
      email: "test@example.com",
      password: "abcdefg",
      key: "xxxx xxxx xxxx xxxx xxxxx xxxxxx xxxxxx xxxx",
      emailWarn: false,
      passwordWarn: false,
      keyWarn: false,
      warnMsg: "",
      syncFolder: "/tmp"
    }
  };

  it("calls sendAsync with storjCreateAccount action and puts storjCreateAccountSuccess if the call successes", () => {
    const encryptionKey = "yyy yyy yyy yyy";
    const saga = storjCreateAccount(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.storjCreateAccount({
      email: action.payload.email,
      password: action.payload.password,
      syncFolder: action.payload.syncFolder,
    })));
    expect(saga.next(encryptionKey).value).toEqual(put(actions.storjCreateAccountSuccess({
      ...action.payload,
      key: encryptionKey,
      syncFolder: undefined,
    })));
    expect(saga.next().value).toEqual(put(push(screens.StorjEncryptionKey)));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
    expect(saga.next().done).toBeTruthy();
  });

  it("calls sendAsync and puts storjCreateAccountFailure if the call fails", () => {
    const err = "expected error";
    const saga = storjCreateAccount(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.storjCreateAccount({
      email: action.payload.email,
      password: action.payload.password,
      syncFolder: action.payload.syncFolder,
    })));
    expect(saga.throw(err).value).toEqual(put(actions.storjCreateAccountFailure({
      ...action.payload,
      emailWarn: true,
      passwordWarn: true,
      warnMsg: err,
      syncFolder: undefined
    })));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
    expect(saga.next().done).toBeTruthy();
  });

});
