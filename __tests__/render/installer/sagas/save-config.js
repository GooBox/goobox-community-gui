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

import {call} from "redux-saga/effects";
import {saveConfig as saveConfigAsync} from "../../../../src/config";
import {InitialState} from "../../../../src/render/installer/reducers/index";
import saveConfig from "../../../../src/render/installer/sagas/save-config";

describe("saveConfig", () => {
  it("forks saveConfigAsync with given action's payload", () => {
    const action = {
      payload: InitialState,
    };
    const saga = saveConfig(action);
    expect(saga.next().value).toEqual(
      call(saveConfigAsync, {
        syncFolder: InitialState.folder,
        installed: true,
        storj: InitialState.storj,
        sia: InitialState.sia,
      })
    );
    expect(saga.next().done);
  });
});
