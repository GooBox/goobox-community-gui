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

import {app} from "electron";
import {willQuit} from "../../../../src/main/popup/handlers";

describe("core app will quit handler", () => {
  let handler;
  const event = {
    preventDefault: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    handler = willQuit(app);
  });

  afterEach(() => {
    delete global.storj;
    delete global.sia;
  });

  it("does not prevent when global.storj and global.sia are not defined", async () => {
    await handler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(app.exit).not.toHaveBeenCalled();
  });

  it("does not prevent when global.storj is defined but is closed", async () => {
    global.storj = {
      closed: true,
    };
    await handler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(app.exit).not.toHaveBeenCalled();
  });

  it("does not prevent when global.sia is defined but is closed", async () => {
    global.sia = {
      closed: true,
    };
    await handler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(app.exit).not.toHaveBeenCalled();
  });

  it("prevents default when storj is running, closes the process, and exists", async () => {
    global.storj = {
      close: jest.fn().mockResolvedValue(null),
    };
    await handler(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(global.storj.close).toHaveBeenCalled();
    expect(app.exit).toHaveBeenCalled();
  });

  it("prevents default when sia is running, closes the process, and exists", async () => {
    global.sia = {
      close: jest.fn().mockResolvedValue(null),
    };
    await handler(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(global.sia.close).toHaveBeenCalled();
    expect(app.exit).toHaveBeenCalled();
  });
});
