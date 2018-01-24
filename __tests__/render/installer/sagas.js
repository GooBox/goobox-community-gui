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

import {remote} from "electron";
import {push} from "react-router-redux";
import {delay} from "redux-saga";
import {call, fork, put, takeEvery} from "redux-saga/effects";
import {saveConfig as saveConfigAsync} from "../../../src/config";
import * as ipcActions from "../../../src/ipc/actions";
import sendAsync from "../../../src/ipc/send";
import * as actions from "../../../src/render/installer/actions";
import * as actionTypes from "../../../src/render/installer/constants/action-types";
import * as screens from "../../../src/render/installer/constants/screens";
import {InitialState} from "../../../src/render/installer/reducers";
import rootSaga from "../../../src/render/installer/sagas";
import closeWindow from "../../../src/render/installer/sagas/close-window";
import incrementProgress from "../../../src/render/installer/sagas/increment-progress";
import prepareJRE, {prepareJREAsync} from "../../../src/render/installer/sagas/prepare-jre";
import requestSiaWallet, {requestSiaWalletAsync} from "../../../src/render/installer/sagas/request-sia-wallet";
import saveConfig from "../../../src/render/installer/sagas/save-config";
import stopSyncApps, {stopSyncAppsAsync} from "../../../src/render/installer/sagas/stop-sync-apps";
import storjCreateAccount, {storjCreateAccountAsync} from "../../../src/render/installer/sagas/storj-create-account";
import storjLogin from "../../../src/render/installer/sagas/storj-login";

describe("rootSaga", () => {

  it("yields all child sagas", () => {
    const saga = rootSaga();
    expect(saga.next().value).toEqual(takeEvery(actionTypes.PrepareJRE, prepareJRE));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.StorjLogin, storjLogin));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.StorjCreateAccount, storjCreateAccount));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.RequestSiaWalletInfo, requestSiaWallet));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.SaveConfig, saveConfig));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.StopSyncApps, stopSyncApps));
    expect(saga.next().value).toEqual(takeEvery(actionTypes.CloseWindow, closeWindow));
    expect(saga.next().done).toBeTruthy();
  });

});

describe("closeWindow", () => {

  it("yields close method of the current window", () => {
    const close = jest.fn();
    remote.getCurrentWindow.mockReturnValue({close: close});
    const saga = closeWindow();
    expect(saga.next().value).toEqual(call(remote.getCurrentWindow().close));
    expect(saga.next().done).toBeTruthy();
  });

});

describe("incrementProgress", () => {

  it("yields calling delay with 500msec and putting set new progress value action", () => {
    const saga = incrementProgress();
    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
    expect(saga.next().value).toEqual(put(actions.setProgressValue(expect.any(Number))));
    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
  });

});

describe("prepareJRE", () => {

  it("yields increment progress and sendAsync with installJRE ipc action", () => {
    const saga = prepareJRE();
    const inc = {
      cancel: jest.fn()
    };
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(call(sendAsync, ipcActions.installJRE()));
    expect(inc.cancel).not.toHaveBeenCalled();
    // returns false which means the installation of JRE was skipped.
    expect(saga.next(false).value).toEqual(put(push(screens.ChooseCloudService)));
    expect(inc.cancel).toHaveBeenCalled();
    expect(saga.next().value).toEqual(put(actions.setProgressValue(0)));
    expect(saga.next().done).toBeTruthy();
  });

  it("increases the progress bar to 100% and waits a second if installJRE returns true", () => {
    const saga = prepareJRE();
    const inc = {
      cancel: jest.fn()
    };
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(call(sendAsync, ipcActions.installJRE()));
    expect(inc.cancel).not.toHaveBeenCalled();
    // returns true which means a new JRE was installed.
    expect(saga.next(true).value).toEqual(put(actions.setProgressValue(100)));
    expect(inc.cancel).toHaveBeenCalled();
    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
    expect(saga.next().value).toEqual(put(push(screens.ChooseCloudService)));
    expect(saga.next().value).toEqual(put(actions.setProgressValue(0)));
    expect(saga.next().done).toBeTruthy();
  });

  it("yields prepareJREFailure action and stops increasing progress when installJRE throws an error", () => {
    const saga = prepareJRE();
    const inc = {
      cancel: jest.fn()
    };
    const err = "expected error";
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(call(sendAsync, ipcActions.installJRE()));
    expect(inc.cancel).not.toHaveBeenCalled();

    // throw an error.
    expect(saga.throw(err).value).toEqual(put(actions.prepareJREFailure(err)));
    expect(inc.cancel).toHaveBeenCalled();
    expect(saga.next().done).toBeTruthy();
  });

});

describe("requestSiaWallet", () => {

  const dir = "/tmp";
  const action = {
    payload: {
      folder: dir,
    }
  };

  it("yields incrementProgress and sendAsync with a siaRequestWalletInfo ipc action", () => {
    const info = "wallet information";
    const inc = {
      cancel: jest.fn()
    };
    const saga = requestSiaWallet(action);
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(call(sendAsync, ipcActions.siaRequestWalletInfo({syncFolder: dir})));
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.next(info).value).toEqual(put(actions.requestSiaWalletInfoSuccess(info)));
    expect(inc.cancel).toHaveBeenCalled();
    expect(saga.next().value).toEqual(put(actions.setProgressValue(100)));

    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
    expect(saga.next().value).toEqual(put(push(screens.SiaWallet)));
    expect(saga.next().value).toEqual(put(actions.setProgressValue(0)));
    expect(saga.next().done);
  });

  it("yields incrementProgress and sendAsync, and handle errors", () => {
    const err = "expected error";
    const inc = {
      cancel: jest.fn()
    };
    const saga = requestSiaWallet(action);
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(call(sendAsync, ipcActions.siaRequestWalletInfo({syncFolder: dir})));
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.throw(err).value).toEqual(put(actions.requestSiaWalletInfoFailure(err)));
    expect(inc.cancel).toHaveBeenCalled();
    expect(saga.next().value).toEqual(put(push(screens.SiaWallet)));
    expect(saga.next().value).toEqual(put(actions.setProgressValue(0)));
    expect(saga.next().done);
  });

});

describe("saveConfig", () => {

  it("forks saveConfigAsync with given action's payload", () => {
    const action = {
      payload: InitialState
    };
    const saga = saveConfig(action);
    expect(saga.next().value).toEqual(call(saveConfigAsync, {
      syncFolder: InitialState.folder,
      installed: true,
      storj: InitialState.storj,
      sia: InitialState.sia,
    }));
    expect(saga.next().done);
  });

});

describe("stopSyncApp", () => {

  it("puts ProcessingStart, calls sendAsync with stopSyncApps ipc actions, and then ProcessingEnd", () => {
    const saga = stopSyncApps();
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.stopSyncApps()));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
    expect(saga.next().done);
  });

});

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
    }
  };

  it("calls sendAsync with storjCreateAccount action and puts storjCreateAccountSuccess if the call successes", () => {
    const encryptionKey = "yyy yyy yyy yyy";
    const saga = storjCreateAccount(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.storjCreateAccount({
      email: action.payload.email,
      password: action.payload.password,
    })));
    expect(saga.next(encryptionKey).value).toEqual(put(actions.storjCreateAccountSuccess({
      ...action.payload,
      key: encryptionKey,
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
    })));
    expect(saga.throw(err).value).toEqual(put(actions.storjCreateAccountFailure({
      ...action.payload,
      emailWarn: true,
      passwordWarn: true,
      warnMsg: err,
    })));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
    expect(saga.next().done).toBeTruthy();
  });

});

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
        storjAccount: storjAccount,
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
