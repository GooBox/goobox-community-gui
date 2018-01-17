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

import {
  calculateUsedVolume,
  changeState,
  installJRE,
  openSyncFolder,
  siaRequestWalletInfo,
  stopSyncApps,
  storjCreateAccount,
  storjLogin
} from "../../src/ipc/actions";
import * as actionTypes from "../../src/ipc/constants";

describe("action creators for IPC", () => {

  const dummyPayload = "dummyPayload";

  it("has changeState", () => {
    expect(changeState(dummyPayload)).toEqual({
      type: actionTypes.ChangeState,
      payload: dummyPayload,
    })
  });

  it("has openSyncFolder", () => {
    expect(openSyncFolder(dummyPayload)).toEqual({
      type: actionTypes.OpenSyncFolder,
      payload: dummyPayload,
    })
  });

  it("has calculateUsedVolume", () => {
    expect(calculateUsedVolume(dummyPayload)).toEqual({
      type: actionTypes.CalculateUsedVolume,
      payload: dummyPayload,
    })
  });

  it("has installJRE", () => {
    expect(installJRE(dummyPayload)).toEqual({
      type: actionTypes.InstallJRE,
      payload: dummyPayload,
    })
  });

  it("has storjLogin", () => {
    expect(storjLogin(dummyPayload)).toEqual({
      type: actionTypes.StorjLogin,
      payload: dummyPayload,
    })
  });

  it("has storjCreateAccount", () => {
    expect(storjCreateAccount(dummyPayload)).toEqual({
      type: actionTypes.StorjCreateAccount,
      payload: dummyPayload,
    })
  });

  it("has siaRequestWalletInfo", () => {
    expect(siaRequestWalletInfo(dummyPayload)).toEqual({
      type: actionTypes.SiaRequestWalletInfo,
      payload: dummyPayload,
    })
  });

  it("has stopSyncAppsEvent", () => {
    expect(stopSyncApps(dummyPayload)).toEqual({
      type: actionTypes.StopSyncApps,
      payload: dummyPayload,
    })
  });

});