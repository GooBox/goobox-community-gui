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
import {Paused, Synchronizing} from "../../../constants";
import {getConfig} from "../../config";
import icons from "../../icons";

export const changeState = mb => async payload => {
  if (payload === Synchronizing) {
    const cfg = await getConfig();
    if (global.storj) {
      global.storj.start(cfg.syncFolder);
    }
    if (global.sia) {
      global.sia.start(cfg.syncFolder);
    }
    log.debug("[GUI main] Update the tray icon to the idle icon");
    mb.tray.setImage(icons.getSyncIcon());
    mb.appState = Synchronizing;
  } else {
    if (global.storj) {
      await global.storj.close();
    }
    if (global.sia) {
      await global.sia.close();
    }
    log.debug("[GUI main] Update the tray icon to the paused icon");
    mb.tray.setImage(icons.getPausedIcon());
    mb.appState = Paused;
  }
  return payload;
};

export default changeState;
