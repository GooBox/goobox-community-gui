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

export const willQuit = app => async event => {
  if (
    (!global.storj || global.storj.closed) &&
    (!global.sia || global.sia.closed)
  ) {
    return;
  }
  log.info(
    "[GUI main] Goobox will quit but synchronization processes are still running"
  );
  event.preventDefault();

  if (global.storj) {
    await global.storj.close();
  }
  if (global.sia) {
    await global.sia.close();
  }
  app.exit();
};

export default willQuit;
