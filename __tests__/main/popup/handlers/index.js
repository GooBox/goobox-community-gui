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

import * as handlers from "../../../../src/main/popup/handlers";
import changeState from "../../../../src/main/popup/handlers/changeState";
import changeTheme from "../../../../src/main/popup/handlers/changeTheme";
import openSyncFolder from "../../../../src/main/popup/handlers/openSyncFolder";
import siaFund from "../../../../src/main/popup/handlers/siaFund";
import updateState from "../../../../src/main/popup/handlers/updateState";
import usedVolume from "../../../../src/main/popup/handlers/usedVolume";
import willQuit from "../../../../src/main/popup/handlers/willQuit";

describe("handlers for popup window", () => {
  it("exports all child handlers", () => {
    expect(handlers.changeState).toEqual(changeState);
    expect(handlers.changeTheme).toEqual(changeTheme);
    expect(handlers.openSyncFolder).toEqual(openSyncFolder);
    expect(handlers.siaFund).toEqual(siaFund);
    expect(handlers.updateState).toEqual(updateState);
    expect(handlers.usedVolume).toEqual(usedVolume);
    expect(handlers.willQuit).toEqual(willQuit);
  });
});
