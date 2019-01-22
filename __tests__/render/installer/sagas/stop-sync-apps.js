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

import {call, put} from "redux-saga/effects";
import * as ipcActions from "../../../../src/ipc/actions";
import sendAsync from "../../../../src/ipc/send";
import * as actions from "../../../../src/render/installer/actions/index";
import stopSyncApps from "../../../../src/render/installer/sagas/stop-sync-apps";

describe("stopSyncApp", () => {
  it("puts ProcessingStart, calls sendAsync with stopSyncApps ipc actions, and then ProcessingEnd", () => {
    const saga = stopSyncApps();
    expect(saga.next().value).toEqual(put(actions.processingStart()));
    expect(saga.next().value).toEqual(
      call(sendAsync, ipcActions.stopSyncApps())
    );
    expect(saga.next().value).toEqual(put(actions.processingEnd()));
    expect(saga.next().done);
  });
});
