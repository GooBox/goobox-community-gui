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

import * as actions from "../../../../src/render/popup/modules/actions";
import * as constants from "../../../../src/render/popup/modules/types";

describe("actions of popup module", () => {
  it("provides change state action", () => {
    const state = "sample state";
    expect(actions.changeState(state)).toEqual({
      type: constants.CHANGE_STATE,
      payload: state,
    });
  });

  it("provides pause action", () => {
    expect(actions.pause()).toEqual({
      type: constants.PAUSE,
    });
  });

  it("provides restart action", () => {
    expect(actions.restart()).toEqual({
      type: constants.RESTART,
    });
  });

  it("provides set volume size action", () => {
    const size = 12345;
    expect(actions.setVolumeSize(size)).toEqual({
      type: constants.SET_VOLUME_SIZE,
      payload: size,
    });
  });

  it("provides open sync folder action", () => {
    expect(actions.openSyncFolder()).toEqual({
      type: constants.OPEN_SYNC_FOLDER,
    });
  });

  it("provides open about window action", () => {
    expect(actions.openAboutWindow()).toEqual({
      type: constants.OPEN_ABOUT_WINDOW,
    });
  });

  it("provides enable action", () => {
    expect(actions.enable()).toEqual({
      type: constants.ENABLE,
    });
  });

  it("provides disable action", () => {
    expect(actions.disable()).toEqual({
      type: constants.DISABLE,
    });
  });

  it("provides set total volume size action", () => {
    const size = 12345;
    expect(actions.setTotalVolumeSize(size)).toEqual({
      type: constants.SET_TOTAL_VOLUME_SIZE,
      payload: size,
    });
  });

  it("provides open settings action", () => {
    expect(actions.openSettings()).toEqual({
      type: constants.OPEN_SETTINGS,
    });
  });

  it("provides import drive action", () => {
    expect(actions.importDrive()).toEqual({
      type: constants.IMPORT_DRIVE,
    });
  });
});
