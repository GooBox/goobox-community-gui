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
import storjLogin from "../../../../src/render/installer/sagas/storj-login";

describe("storjLogin", () => {

  const dir = "/tmp";
  const storjAccount = {
    email: "test@example.com",
    password: "abcdefg",
    key: "xxxx xxxx xxxx xxxx xxxxx xxxxxx xxxxxx xxxx",
    emailWarn: false,
    passwordWarn: false,
    keyWarn: false,
    warnMsg: "",
  };
  let action;
  beforeEach(() => {
    action = {
      payload: {
        storjAccount,
        sia: true,
        folder: dir,
      }
    };
  });

  it("calls sendAsync and puts storjLoginSuccess if successes, then puts requestSiaWalletInfo if sia = true", () => {
    const saga = storjLogin(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.storjLogin({
      email: storjAccount.email,
      password: storjAccount.password,
      encryptionKey: storjAccount.key,
      syncFolder: dir,
    })));
    expect(saga.next().value).toEqual(put(actions.storjLoginSuccess({
      ...storjAccount
    })));
    expect(saga.next().value).toEqual(put(actions.requestSiaWalletInfo()));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
  });

  it("calls sendAsync and puts storjLoginSuccess if successes, then puts FinishAll if sia = false", () => {
    action.payload.sia = false;
    const saga = storjLogin(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.storjLogin({
      email: storjAccount.email,
      password: storjAccount.password,
      encryptionKey: storjAccount.key,
      syncFolder: dir,
    })));
    expect(saga.next().value).toEqual(put(actions.storjLoginSuccess({
      ...storjAccount
    })));
    expect(saga.next().value).toEqual(put(actions.saveConfig(action.payload)));
    expect(saga.next().value).toEqual(put(push(screens.FinishAll)));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
  });

  it("calls sendAsync and puts storjLoginFailure if fails", () => {
    const err = {
      error: "expected error",
      email: false,
      password: false,
      encryptionKey: true,
    };
    const saga = storjLogin(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.storjLogin({
      email: storjAccount.email,
      password: storjAccount.password,
      encryptionKey: storjAccount.key,
      syncFolder: dir,
    })));
    expect(saga.throw(err).value).toEqual(put(actions.storjLoginFailure({
      ...storjAccount,
      emailWarn: err.email,
      passwordWarn: err.password,
      keyWarn: err.encryptionKey,
      warnMsg: err.error,
    })));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
  });

});
