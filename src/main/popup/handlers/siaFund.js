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

import log from "electron-log";
import path from "path";
import {AppID} from "../../../constants";
import {notifyAsync} from "../../notify";

const icon = path.join(__dirname, "../../../resources/goobox.png");

export const siaFund = () => async payload => {
  switch (payload.eventType) {
    case "NoFunds":
      log.verbose(
        "[GUI main] Notify the user his/her wallet doesn't have sia coins"
      );
      return await notifyAsync({
        title: "Goobox",
        message: "Your wallet doesn't have sia coins",
        icon,
        sound: true,
        wait: true,
        appID: AppID,
      });
    case "InsufficientFunds":
      log.verbose(
        "[GUI main] Notify the user his/her wallet doesn't have sufficient funds"
      );
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon,
        sound: true,
        wait: true,
        appID: AppID,
      });
    case "Allocated":
      log.verbose("[GUI main] Notify the user his/her funds are allocated");
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon,
        sound: true,
        wait: true,
        appID: AppID,
      });
    case "Error":
      log.error(
        `[GUI main] siaFundEventHandler received an error: ${payload.message}`
      );
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon,
        sound: true,
        wait: true,
        appID: AppID,
      });
  }
};

export default siaFund;
