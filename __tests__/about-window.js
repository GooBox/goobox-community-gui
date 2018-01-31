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

jest.mock("about-window");

import openAboutWindow from "about-window";
import showInfoWindowAsync from "../src/about-window";
import icon from "../src/assets/goobox.svg";


describe("showInfoWindowAsync function", () => {

  const on = jest.fn();
  openAboutWindow.mockReturnValue({
    on: on,
  });

  beforeEach(() => {
    on.mockReset();
    openAboutWindow.mockClear();
  });

  it("opens an about window and returns a promise, which is resolved by closed event", async () => {
    on.mockImplementation((event, callback) => {
      expect(event).toEqual("closed");
      callback();
    });

    await expect(showInfoWindowAsync()).resolves.not.toBeDefined();
    // noinspection SpellCheckingInspection
    expect(openAboutWindow).toHaveBeenCalledWith({
      icon_path: icon,
      bug_report_url: expect.any(String),
      copyright: expect.any(String),
      homepage: expect.any(String),
      description: expect.any(String),
      license: expect.any(String),
      win_options: {
        resizable: false,
        fullscreenable: false,
        minimizable: false,
        maximizable: false
      }
    });

  });

});
