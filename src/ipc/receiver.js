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

import {ipcMain} from "electron";
import log from "electron-log";

export default function addListener(actionType, asyncCallback) {
  ipcMain.on(actionType, async (event, payload, error, meta) => {
    log.debug(
      `[GUI main] Received a ${actionType} request: ${JSON.stringify(payload)}`
    );
    try {
      const res = await asyncCallback(payload, error, meta);
      log.debug(
        `[GUI main] Sending a successful response for ${actionType} request: ${JSON.stringify(
          payload
        )}`
      );
      event.sender.send(actionType, res);
    } catch (error) {
      log.error(
        `[GUI main] Sending an error response for ${actionType} request: ${error}`
      );
      event.sender.send(actionType, error, true);
    }
  });
}
