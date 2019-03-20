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
import {Idle, Synchronizing} from "../../../../src/constants";
import icons from "../../../../src/main/icons";
import {updateState} from "../../../../src/main/popup/handlers/updateState";

describe("updateState event handler", () => {
  let handler;
  beforeEach(async () => {
    jest.clearAllMocks();
    menubarMock.appState = null;
    handler = updateState(menubarMock);
  });

  it("sets the synchronizing icon when receiving a synchronizing event", async () => {
    await expect(handler({newState: Synchronizing})).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
    expect(menubarMock.appState).toEqual(Synchronizing);
  });

  it("sets the idle icon when receiving an idle event", async () => {
    await expect(handler({newState: Idle})).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
    expect(menubarMock.appState).toEqual(Idle);
  });
});
