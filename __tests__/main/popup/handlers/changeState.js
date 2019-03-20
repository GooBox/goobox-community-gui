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

import {menubarMock} from "menubar";
import {Paused, Synchronizing} from "../../../../src/constants";
import {getConfig} from "../../../../src/main/config";
import icons from "../../../../src/main/icons";
import changeState from "../../../../src/main/popup/handlers/changeState";

jest.mock("../../../../src/main/config");

describe("changeState event handler", () => {
  const dir = "/tmp";
  let handler;
  beforeAll(() => {
    getConfig.mockReturnValue({
      syncFolder: dir,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    menubarMock.appState = null;
    handler = changeState(menubarMock);
  });

  afterEach(() => {
    delete global.storj;
    delete global.sia;
  });

  it("sets the idle icon when the state is Synchronizing", async () => {
    await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
    expect(menubarMock.appState).toEqual(Synchronizing);
  });

  it("sets the paused icon when the state is Paused", async () => {
    await expect(handler(Paused)).resolves.toEqual(Paused);
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
      icons.getPausedIcon()
    );
    expect(menubarMock.appState).toEqual(Paused);
  });

  it("restart the Storj instance if exists when the new state is Synchronizing", async () => {
    const storj = {
      start: jest.fn(),
      stdout: {
        on: jest.fn(),
      },
    };
    global.storj = storj;
    await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
    expect(global.storj).toBe(storj);
    expect(global.storj.start).toHaveBeenCalledWith(dir);
  });

  it("closes the Storj instance if exists when the new state is Paused", async () => {
    const storj = {
      close: jest.fn(),
      stdout: {
        removeListener: jest.fn(),
      },
    };
    global.storj = storj;
    await expect(handler(Paused)).resolves.toEqual(Paused);
    expect(global.storj).toBe(storj);
    expect(global.storj.close).toHaveBeenCalled();
  });

  it("restart the Sia instance if exists when the new state is Synchronizing", async () => {
    const sia = {
      start: jest.fn(),
      stdout: {
        on: jest.fn(),
      },
    };
    global.sia = sia;
    await expect(handler(Synchronizing)).resolves.toEqual(Synchronizing);
    expect(global.sia).toBe(sia);
    expect(global.sia.start).toHaveBeenCalledWith(dir);
  });

  it("closes the Sia instance if exists when the new state is Paused", async () => {
    const sia = {
      close: jest.fn(),
      stdout: {
        removeListener: jest.fn(),
      },
    };
    global.sia = sia;
    await expect(handler(Paused)).resolves.toEqual(Paused);
    expect(global.sia).toBe(sia);
    expect(global.sia.close).toHaveBeenCalled();
  });
});
