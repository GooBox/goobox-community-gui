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

import {ipcRenderer, remote} from "electron";
import {push} from "react-router-redux";
import {delay} from "redux-saga";
import {call, fork, put, takeEvery} from "redux-saga/effects";
import {saveConfig as saveConfigAsync} from "../../../src/config";
import {
  JREInstallEvent, SiaWalletEvent, StopSyncAppsEvent, StorjLoginEvent,
  StorjRegisterationEvent
} from "../../../src/constants";
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
import storjLogin, {storjLoginAsync} from "../../../src/render/installer/sagas/storj-login";

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

describe("prepareJREAsync", () => {

  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
  });

  it("sends JRE install request", async () => {
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, true);
        }
      });
    });
    await expect(prepareJREAsync()).resolves.not.toBeDefined();
    expect(ipcRenderer.once).toHaveBeenCalledWith(JREInstallEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(JREInstallEvent);
  });

  it("returns a rejected promise with the error when the request fails", async () => {
    const err = "expected error";
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, false, err);
        }
      });
    });
    await expect(prepareJREAsync()).rejects.toEqual(err);
  });

});

describe("prepareJRE", () => {

  it("yields increment progress and prepareJREAsync", () => {
    const saga = prepareJRE();
    const inc = {
      cancel: jest.fn()
    };
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(call(prepareJREAsync));
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.next().value).toEqual(put(actions.setProgressValue(100)));
    expect(inc.cancel).toHaveBeenCalled();
    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
    expect(saga.next().value).toEqual(put(push(screens.ChooseCloudService)));
    expect(saga.next().value).toEqual(put(actions.setProgressValue(0)));
    expect(saga.next().done).toBeTruthy();
  });

});

describe("requestSiaWalletAsync", () => {

  const address = "1234567890";
  const seed = "xxx xxx xxx xxx";
  const info = {
    address: address,
    seed: seed
  };

  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
  });

  it("requests sia wallet information", async () => {
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, info);
        }
      });
    });
    await expect(requestSiaWalletAsync()).resolves.toEqual(info);
    expect(ipcRenderer.once).toHaveBeenCalledWith(SiaWalletEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(SiaWalletEvent);
  });

  it("returns a rejected promise with the error when the IPC request fails", async () => {
    const error = "expected error";
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, null, error);
        }
      });
    });
    await expect(requestSiaWalletAsync()).rejects.toEqual(error);
  });

});

describe("requestSiaWallet", () => {

  it("yields incrementProgress and requestSiaWalletAsync", () => {
    const info = "wallet information";
    const inc = {
      cancel: jest.fn()
    };
    const saga = requestSiaWallet();
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(call(requestSiaWalletAsync));
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.next(info).value).toEqual(put(actions.requestSiaWalletInfoSuccess(info)));
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.next().value).toEqual(put(actions.setProgressValue(100)));
    expect(inc.cancel).toHaveBeenCalled();

    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
    expect(saga.next().value).toEqual(put(push(screens.SiaWallet)));
    expect(saga.next().value).toEqual(put(actions.setProgressValue(0)));
    expect(saga.next().done);
  });

  it("yields incrementProgress and requestSiaWalletAsync, and handle errors", () => {
    const err = "expected error";
    const inc = {
      cancel: jest.fn()
    };
    const saga = requestSiaWallet();
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(call(requestSiaWalletAsync));
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.throw(err).value).toEqual(put(actions.requestSiaWalletInfoFailure(err)));
    expect(inc.cancel).not.toHaveBeenCalled();
    expect(saga.next().value).toEqual(put(actions.setProgressValue(100)));
    expect(inc.cancel).toHaveBeenCalled();

    // noinspection JSCheckFunctionSignatures
    expect(saga.next().value).toEqual(call(delay, 500));
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

describe("stopSyncAppsAsync", () => {

  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
  });

  it("sends a stop sync apps request and returns a resolved promise if the request succeeds", async () => {
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null);
        }
      });
    });
    await expect(stopSyncAppsAsync()).resolves.not.toBeDefined();
    expect(ipcRenderer.once).toHaveBeenCalledWith(StopSyncAppsEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(StopSyncAppsEvent);
  });

  it("sends a stop sync apps request and returns a rejected promise if the request fails", async () => {
    const err = "expected error";
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, err);
        }
      });
    });
    await expect(stopSyncAppsAsync()).rejects.toEqual(err);
    expect(ipcRenderer.once).toHaveBeenCalledWith(StopSyncAppsEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(StopSyncAppsEvent);
  });

});

describe("stopSyncApp", () => {

  it("puts ProcessingStart, calls stopSyncAppsAsync, and then ProcessingEnd", () => {
    const saga = stopSyncApps();
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(stopSyncAppsAsync));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
    expect(saga.next().done);
  });

});


describe("storjCreateAccountAsync", () => {

  const info = {
    email: "sample@email.com",
    password: "01234567"
  };
  const key = "xxx xxx xxx";
  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
  });

  it("takes account info, sends StorjRegistrationEvent request and returns the account info if successes", async () => {
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, true, key);
        }
      });
    });
    await expect(storjCreateAccountAsync(info)).resolves.toEqual({
      ...info,
      encryptionKey: key
    });
    expect(ipcRenderer.once).toHaveBeenCalledWith(StorjRegisterationEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(StorjRegisterationEvent, info);
  });

  it("returns a rejected promise with an error message if the request fails", async () => {
    const err = "expected error";
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, false, err);
        }
      });
    });
    await expect(storjCreateAccountAsync(info)).rejects.toEqual({
      emailWarn: true,
      passwordWarn: true,
      warnMsg: err
    });
  });

  it("returns a rejected promise without error messages if not given", async () => {
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, false);
        }
      });
    });
    await expect(storjCreateAccountAsync(info)).rejects.toEqual({
      emailWarn: true,
      passwordWarn: true,
      warnMsg: null,
    });
  });

});

describe("storjCreateAccount", () => {

  const action = {
    payload: "sample account information"
  };

  it("calls storjCreateAccountAsync and puts storjCreateAccountSuccess if the call successes", () => {
    const info = "succeeded result";
    const saga = storjCreateAccount(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(storjCreateAccountAsync, action.payload));
    expect(saga.next(info).value).toEqual(put(actions.storjCreateAccountSuccess(info)));
    expect(saga.next().value).toEqual(put(push(screens.StorjEncryptionKey)));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
    expect(saga.next().done).toBeTruthy();
  });

  it("calls storjCreateAccountAsync and puts storjCreateAccountFailure if the call fails", () => {
    const err = "expected error";
    const saga = storjCreateAccount(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(storjCreateAccountAsync, action.payload));
    expect(saga.throw(err).value).toEqual(put(actions.storjCreateAccountFailure(err)));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
    expect(saga.next().done).toBeTruthy();
  });

});

describe("storjLoginAsync", () => {

  const info = {
    email: "test@sample.com",
    password: "01234",
    key: "xxx xxx xxx",
  };
  beforeEach(() => {
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
  });

  it("sends a StorjLoginEvent request with given account information, and returns the information if successes", async () => {
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, true);
        }
      });
    });
    await expect(storjLoginAsync(info)).resolves.toEqual(info);
    expect(ipcRenderer.once).toHaveBeenCalledWith(StorjLoginEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(StorjLoginEvent, info);
  });

  it("returns account information and validation result if the request fails", async () => {
    const err = "expected error";
    const validation = {
      email: true,
      password: false,
      encryptionKey: true,
    };
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, false, err, validation);
        }
      });
    });
    await expect(storjLoginAsync(info)).rejects.toEqual({
      ...info,
      emailWarn: !validation.email,
      passwordWarn: !validation.password,
      keyWarn: !validation.encryptionKey,
      warnMsg: err,
    });
    expect(ipcRenderer.once).toHaveBeenCalledWith(StorjLoginEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(StorjLoginEvent, info);
  });

  it("returns account information and validation result without error message if not given", async () => {
    const validation = {
      email: true,
      password: false,
      encryptionKey: true,
    };
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method) => {
        if (listen === method) {
          cb(null, false, null, validation);
        }
      });
    });
    await expect(storjLoginAsync(info)).rejects.toEqual({
      ...info,
      emailWarn: !validation.email,
      passwordWarn: !validation.password,
      keyWarn: !validation.encryptionKey,
      warnMsg: null,
    });
    expect(ipcRenderer.once).toHaveBeenCalledWith(StorjLoginEvent, expect.any(Function));
    expect(ipcRenderer.send).toHaveBeenCalledWith(StorjLoginEvent, info);
  });

});

describe("storjLogin", () => {

  let action;
  beforeEach(() => {
    action = {
      payload: {
        storjAccount: "sample storj account info",
        sia: true,
      }
    };
  });

  it("calls storjLoginAsync and puts storjLoginSuccess if the call successes, then puts requestSiaWalletInfo", () => {
    const res = "successful result";
    const saga = storjLogin(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(storjLoginAsync, action.payload.storjAccount));
    expect(saga.next(res).value).toEqual(put(actions.storjLoginSuccess(res)));
    expect(saga.next().value).toEqual(put(actions.requestSiaWalletInfo()));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
  });

  it("calls storjLoginAsync and puts storjLoginSuccess if the call successes, then puts FinishAll if sia = false", () => {
    const res = "successful result";
    action.payload.sia = false;
    const saga = storjLogin(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(storjLoginAsync, action.payload.storjAccount));
    expect(saga.next(res).value).toEqual(put(actions.storjLoginSuccess(res)));
    expect(saga.next().value).toEqual(put(actions.saveConfig(action.payload)));
    expect(saga.next().value).toEqual(put(push(screens.FinishAll)));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
  });

  it("calls storjLoginAsync and puts storjLoginFailure if the call fails", () => {
    const err = "expected error";
    const saga = storjLogin(action);
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(call(storjLoginAsync, action.payload.storjAccount));
    expect(saga.throw(err).value).toEqual(put(actions.storjLoginFailure(err)));
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
  });

});
