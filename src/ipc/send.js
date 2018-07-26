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

import {ipcRenderer} from "electron";
import log from "electron-log";

export default async function sendAsync(action) {
  log.debug(`[GUI render] Sending ${action.type} request`);
  return new Promise((resolve, reject) => {
    ipcRenderer.once(action.type, (_, payload, error, meta) => {
      if (error) {
        log.error(`[GUI render] Received an error response for the ${action.type} request: ${payload}`);
        reject(payload, meta);
      } else {
        log.debug(`[GUI render] Received an successful response for the ${action.type} request: ${JSON.stringify(payload)}`);
        resolve(payload, meta);
      }
    });
    ipcRenderer.send(action.type, action.payload, action.error, action.meta);
  });
}
