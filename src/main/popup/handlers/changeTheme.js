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

import {Idle, Paused, Synchronizing} from "../../../constants";
import icons from "../../icons";

export const changeTheme = mb => async () => {
  switch (mb.appState) {
    case Synchronizing:
      mb.tray.setImage(icons.getSyncIcon());
      break;
    case Paused:
      mb.tray.setImage(icons.getPausedIcon());
      break;
    case Idle:
    default:
      mb.tray.setImage(icons.getIdleIcon());
  }
};

export default changeTheme;
