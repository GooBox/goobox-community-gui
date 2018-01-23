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

import * as actions from "../../../src/render/installer/actions";

describe("Initial state", () => {

  let InitialState;
  const oldFolder = process.env.DEFAULT_SYNC_FOLDER;
  const testFolder = "/tmp";
  beforeAll(() => {
    process.env.DEFAULT_SYNC_FOLDER = testFolder;
    InitialState = require("../../../src/render/installer/reducers").InitialState;
  });

  afterAll(() => {
    process.env.DEFAULT_SYNC_FOLDER = oldFolder;
  });

  it("has storj and sia flags", () => {
    expect(InitialState).toHaveProperty("storj", expect.any(Boolean));
    expect(InitialState).toHaveProperty("sia", expect.any(Boolean));
  });

  it("has the sync folder path", () => {
    const oldFolder = process.env.DEFAULT_SYNC_FOLDER;
    const testFolder = "/tmp";
    process.env.DEFAULT_SYNC_FOLDER = testFolder;
    try {
      expect(InitialState).toHaveProperty("folder", expect.any(String));
    } finally {
      process.env.DEFAULT_SYNC_FOLDER = oldFolder;
    }
  });

  it("has storj account information", () => {
    expect(InitialState.storjAccount).toHaveProperty("email", expect.any(String));
    expect(InitialState.storjAccount).toHaveProperty("password", expect.any(String));
    expect(InitialState.storjAccount).toHaveProperty("key", expect.any(String));
    expect(InitialState.storjAccount).toHaveProperty("emailWarn", expect.any(Boolean));
    expect(InitialState.storjAccount).toHaveProperty("passwordWarn", expect.any(Boolean));
    expect(InitialState.storjAccount).toHaveProperty("keyWarn", expect.any(Boolean));
    expect(InitialState.storjAccount).toHaveProperty("warnMsg", expect.any(String));
  });

  it("has sia account information", () => {
    expect(InitialState.siaAccount).toHaveProperty("address", expect.any(String));
    expect(InitialState.siaAccount).toHaveProperty("seed", expect.any(String));
  });

  it("has processing flag", () => {
    expect(InitialState).toHaveProperty("processing", expect.any(Boolean));
  });

  it("has progress value", () => {
    expect(InitialState).toHaveProperty("progress", expect.any(Number));
  });

});

describe("reducer", () => {

  let reducer, state;
  beforeAll(() => {
    reducer = require("../../../src/render/installer/reducers").default;
  });

  beforeEach(() => {
    state = require("../../../src/render/installer/reducers").InitialState;
  });

  it("returns the initial state by undefined action", () => {
    expect(reducer(undefined, {type: "unknown action"})).toEqual(state);
  });

  it("updates folder state by SelectFolder action", () => {
    const folder = "/tmp/dir";
    expect(reducer(state, actions.selectFolder(folder))).toEqual({
      ...state,
      folder: folder,
    });
  });

  it("sets storj true and sia false by SelectStorj action", () => {
    expect(reducer(state, actions.selectStorj())).toEqual({
      ...state,
      storj: true,
      sia: false,
    });
  });

  it("sets storj false and sia true by SelectSia action", () => {
    expect(reducer(state, actions.selectSia())).toEqual({
      ...state,
      storj: false,
      sia: true,
    });
  });

  it("sets both storj and sia true by SelectBoth action", () => {
    expect(reducer(state, actions.selectBoth())).toEqual({
      ...state,
      storj: true,
      sia: true,
    });
  });

  it("updates progress value by SetProgressValue action", () => {
    const value = 94;
    expect(reducer(state, actions.setProgressValue(value))).toEqual({
      ...state,
      progress: value,
    });
  });

  it("updates storjAccount by StorjLoginSuccess action", () => {
    const info = "dummy account info";
    expect(reducer(state, actions.storjLoginSuccess(info))).toEqual({
      ...state,
      storjAccount: info,
    });
  });

  it("updates storjAccount by StorjLoginFailure action", () => {
    const info = "dummy account info";
    expect(reducer(state, actions.storjLoginFailure(info))).toEqual({
      ...state,
      storjAccount: info,
    });
  });

  it("updates storjAccount by StorjCreateAccountSuccess", () => {
    const info = "dummy account info";
    expect(reducer(state, actions.storjCreateAccountSuccess(info))).toEqual({
      ...state,
      storjAccount: info,
    });
  });

  it("updates storjAccount by StorjCreateAccountFailure", () => {
    const info = "dummy account info";
    expect(reducer(state, actions.storjCreateAccountFailure(info))).toEqual({
      ...state,
      storjAccount: info,
    });
  });

  it("update siaAccount by RequestSiaWalletInfoSuccess action", () => {
    const info = "dummy sia info";
    expect(reducer(state, actions.requestSiaWalletInfoSuccess(info))).toEqual({
      ...state,
      siaAccount: info,
    });
  });

  // TODO: RequestSiaWalletInfoFailure.

  it("sets processing true by ProcessingStart action", () => {
    expect(reducer(state, actions.processingStart())).toEqual({
      ...state,
      processing: true,
    });
  });

  it("sets processing false by ProcessingEnd action", () => {
    expect(reducer(state, actions.processingEnd())).toEqual({
      ...state,
      processing: false,
    });
  });

  it("sets the given error message to errorMsg state", () => {
    const error = "expected error";
    expect(reducer(state, actions.setErrorMsg(error))).toEqual({
      ...state,
      errorMsg: error,
    });

  });

});

