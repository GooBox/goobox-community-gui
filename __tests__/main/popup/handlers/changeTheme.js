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
import {Idle, Paused, Synchronizing} from "../../../../src/constants";
import icons from "../../../../src/main/icons";
import {changeTheme} from "../../../../src/main/popup/handlers/changeTheme";

describe("changeTheme (AppleInterfaceThemeChangedNotification) event handler", () => {
  let handler;
  beforeEach(() => {
    jest.clearAllMocks();
    menubarMock.appState = null;
    handler = changeTheme(menubarMock);
  });

  it("sets idle icon if appState is Idle", async () => {
    menubarMock.appState = Idle;
    await expect(handler()).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
  });

  it("sets synchronizing icon if appState is Synchronizing", async () => {
    menubarMock.appState = Synchronizing;
    await expect(handler()).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getSyncIcon());
  });

  it("sets paused icon if appState is Paused", async () => {
    menubarMock.appState = Paused;
    await expect(handler()).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(
      icons.getPausedIcon()
    );
  });

  it("sets idle icon if appState isn't defined", async () => {
    await expect(handler()).resolves.not.toBeDefined();
    expect(menubarMock.tray.setImage).toHaveBeenCalledWith(icons.getIdleIcon());
  });
});
