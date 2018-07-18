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

import notifier from "node-notifier";
import {notifyAsync} from "../../src/main/notify";

jest.mock("node-notifier");

describe("notify module", () => {

  const result = "test result";
  const option = "test option";

  let err;
  beforeAll(() => {
    notifier.notify.mockImplementation((opt, cb) => cb(err, result));
  });

  beforeEach(() => {
    err = null;
    jest.clearAllMocks();
  });

  it("invokes notifier.notify with the given options", async () => {
    await notifyAsync(option);
    expect(notifier.notify).toHaveBeenCalledWith(option, expect.any(Function));
  });

  it("returns the result which notifier.notify returned", async () => {
    await expect(notifyAsync(option)).resolves.toEqual(result);
  });

  it("returns the error if notifier.notify returns an error", async () => {
    err = new Error("test error");
    await expect(notifyAsync(option)).rejects.toEqual(err);
  });


});
