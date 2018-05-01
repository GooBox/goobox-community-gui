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
import * as actions from "../../../../src/render/installer/actions";
import {storjGenerateMnemonic} from "../../../../src/render/installer/sagas/storj-generate-mnemonic";

describe("storjGenerateMnemonic", () => {

  const dir = "/tmp";
  const action = {
    payload: {
      folder: dir,
    }
  };
  const encryptionKey = "yyy yyy yyy yyy";

  it("yields sendAsync saga with storjGenerateMnemonic action", () => {
    const saga = storjGenerateMnemonic(action);
    expect(saga.next().value).toEqual(call(sendAsync, ipcActions.storjGenerateMnemonic({
      syncFolder: dir,
    })));
    expect(saga.next(encryptionKey).value).toEqual(put(actions.storjGenerateMnemonicSuccess(encryptionKey)));
    expect(saga.next().done).toBeTruthy();
  });

});
