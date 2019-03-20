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

import path from "path";
import {AppID} from "../../../../src/constants";
import {notifyAsync} from "../../../../src/main/notify";
import {siaFund} from "../../../../src/main/popup/handlers/siaFund";

jest.mock("../../../../src/main/notify");

describe("siaFund event handler", () => {
  beforeAll(() => {
    notifyAsync.mockResolvedValue(undefined);
  });

  const icon = path.join(__dirname, "../../../../src/resources/goobox.png");
  let handler;
  beforeEach(() => {
    jest.clearAllMocks();
    handler = siaFund();
  });

  it("notifies the user that his/her current balance is 0", async () => {
    await expect(handler({eventType: "NoFunds"})).resolves.not.toBeDefined();
    expect(notifyAsync).toHaveBeenCalledWith({
      title: "Goobox",
      message: "Your wallet doesn't have sia coins",
      icon,
      sound: true,
      wait: true,
      appID: AppID,
    });
  });

  it("notifies the user that his/her funds are insufficient", async () => {
    const message = "sample message";
    await expect(
      handler({eventType: "InsufficientFunds", message})
    ).resolves.not.toBeDefined();
    expect(notifyAsync).toHaveBeenCalledWith({
      title: "Goobox",
      message,
      icon,
      sound: true,
      wait: true,
      appID: AppID,
    });
  });

  it("notifies the user that a fund allocation has been succeeded", async () => {
    const message = "sample message";
    await expect(
      handler({eventType: "Allocated", message})
    ).resolves.not.toBeDefined();
    expect(notifyAsync).toHaveBeenCalledWith({
      title: "Goobox",
      message,
      icon,
      sound: true,
      wait: true,
      appID: AppID,
    });
  });

  it("notifies the user when an error occurs", async () => {
    const message = "sample message";
    await expect(
      handler({eventType: "Error", message})
    ).resolves.not.toBeDefined();
    expect(notifyAsync).toHaveBeenCalledWith({
      title: "Goobox",
      message,
      icon,
      sound: true,
      wait: true,
      appID: AppID,
    });
  });

  it("does nothing for other events", async () => {
    await expect(
      handler({eventType: "AnotherEvent"})
    ).resolves.not.toBeDefined();
    expect(notifyAsync).not.toHaveBeenCalled();
  });
});
