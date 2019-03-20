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

import {shell} from "electron";
import log from "electron-log";
import {call} from "redux-saga/effects";
import openSettings from "../../../../src/render/popup/sagas/openSettings";

describe("openSettings", () => {
  let saga;
  beforeEach(() => {
    saga = openSettings();
  });

  it("calls shell.openItem", () => {
    expect(saga.next().value).toEqual(
      call(shell.openItem, log.transports.file.file)
    );
    expect(saga.next(true).done);
  });

  it("doesn't return any error even if openItem fails", () => {
    expect(saga.next().value).toEqual(
      call(shell.openItem, log.transports.file.file)
    );
    expect(saga.next(false).done);
  });
});