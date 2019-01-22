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
import {delay} from "redux-saga";
import {call, fork, put} from "redux-saga/effects";
import * as ipcActions from "../../../../src/ipc/actions";
import sendAsync from "../../../../src/ipc/send";
import * as actions from "../../../../src/render/installer/actions/index";
import * as screens from "../../../../src/render/installer/constants/screens";
import incrementProgress from "../../../../src/render/installer/sagas/increment-progress";
import prepareJRE from "../../../../src/render/installer/sagas/prepare-jre";

describe("prepareJRE", () => {
  it("yields increment progress and sendAsync with installJRE ipc action", () => {
    const saga = prepareJRE();
    const inc = {
      cancel: jest.fn(),
    };
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(
      call(sendAsync, ipcActions.installJRE())
    );
    expect(inc.cancel).not.toHaveBeenCalled();
    // returns false which means the installation of JRE was skipped.
    expect(saga.next(false).value).toEqual(
      put(push(screens.ChooseCloudService))
    );
    expect(inc.cancel).toHaveBeenCalled();
    expect(saga.next().value).toEqual(put(actions.setProgressValue(0)));
    expect(saga.next().done).toBeTruthy();
  });

  it("increases the progress bar to 100% and waits a second if installJRE returns true", () => {
    const saga = prepareJRE();
    const inc = {
      cancel: jest.fn(),
    };
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(
      call(sendAsync, ipcActions.installJRE())
    );
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
      cancel: jest.fn(),
    };
    const err = "expected error";
    expect(saga.next().value).toEqual(fork(incrementProgress));
    expect(saga.next(inc).value).toEqual(
      call(sendAsync, ipcActions.installJRE())
    );
    expect(inc.cancel).not.toHaveBeenCalled();

    // throw an error.
    expect(saga.throw(err).value).toEqual(put(actions.prepareJREFailure(err)));
    expect(inc.cancel).toHaveBeenCalled();
    expect(saga.next().done).toBeTruthy();
  });
});
