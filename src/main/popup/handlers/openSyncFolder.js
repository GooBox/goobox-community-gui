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

import {shell} from "electron";
import log from "electron-log";
import {getConfig} from "../../config";

export const openSyncFolder = () => async () => {
  const cfg = await getConfig();
  log.info(`[GUI main] Open sync folder ${cfg.syncFolder}`);
  if (!shell.openItem(cfg.syncFolder)) {
    log.warn("[GUI main] failed to open the the sync folder");
  }
};

export default openSyncFolder();
