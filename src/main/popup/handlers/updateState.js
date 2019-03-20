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
import {Idle, Synchronizing} from "../../../constants";
import icons from "../../icons";

export const updateState = mb => async payload => {
  switch (payload.newState) {
    case Synchronizing:
      log.debug("[GUI main] Set the synchronizing icon");
      mb.tray.setImage(icons.getSyncIcon());
      mb.appState = Synchronizing;
      break;

    case Idle:
      log.debug("[GUI main] Set the idle icon");
      mb.tray.setImage(icons.getIdleIcon());
      mb.appState = Idle;
      break;

    default:
      log.debug(
        `[GUI main] Received argument ${JSON.stringify(
          payload
        )} is not handled in updateStateHandler`
      );
  }
};

export default updateState;
