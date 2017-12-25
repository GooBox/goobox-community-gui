/*
 * Copyright (C) 2017 Junpei Kawamoto
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

import {app} from "electron";
import {menubar, menuberMock} from "menubar";
import path from "path";

describe("main process of the core app invoked by the installer", () => {

  beforeAll(() => {
    app.isReady.mockReturnValue(true);
    menuberMock.tray.listeners.mockReturnValue([() => null]);
    menubar.mockClear();
    menuberMock.showWindow.mockClear();
    require("../../src/main-process/main");
  });

  it("starts the initialization process immediately", () => {
    expect(menubar).toHaveBeenCalledWith({
      index: "file://" + path.join(__dirname, "../../static/popup.html"),
      icon: expect.anything(),
      tooltip: app.getName(),
      preloadWindow: true,
      width: 518,
      height: 400,
      alwaysOnTop: true,
      showDockIcon: false,
    });
    expect(menuberMock.showWindow).toHaveBeenCalled();
  });

});