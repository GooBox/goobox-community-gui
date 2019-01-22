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

import log from "electron-log";
import notifier from "node-notifier";

export const notifyAsync = async opts =>
  new Promise((resolve, reject) => {
    // noinspection JSUnresolvedFunction
    notifier.notify(opts, (err, res) => {
      if (err) {
        log.warn(`Notification failed; the user might cancel it: ${err}`);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

export default notifyAsync;
