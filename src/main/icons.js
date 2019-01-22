/*
 * Copyright (C) 2017 Junpei Kawamoto
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

import {systemPreferences} from "electron";
import os from "os";
import path from "path";
import semver from "semver";

export const icons = {};

if (process.platform === "darwin") {
  // mac
  const getIcon = name => {
    if (systemPreferences.isDarkMode()) {
      return path.join(__dirname, `../../resources/mac/dark/${name}.png`);
    }
    return path.join(__dirname, `../../resources/mac/${name}.png`);
  };
  icons.getIdleIcon = () => getIcon("idle");
  icons.getSyncIcon = () => getIcon("sync");
  icons.getPausedIcon = () => getIcon("paused");
  icons.getErrorIcon = () => getIcon("error");
  icons.getWarnIcon = () => getIcon("warn");
} else {
  // windows
  let version = os.release();
  if (version.split(".").length === 2) {
    version += ".0";
  }

  let idleIcon, syncIcon, pausedIcon, errorIcon, warnIcon;
  if (semver.satisfies(version, "<6.2")) {
    // windows7 or older.
    idleIcon = path.join(__dirname, "../../resources/win7/idle.png");
    syncIcon = path.join(__dirname, "../../resources/win7/sync.png");
    pausedIcon = path.join(__dirname, "../../resources/win7/paused.png");
    errorIcon = path.join(__dirname, "../../resources/win7/error.png");
    warnIcon = path.join(__dirname, "../../resources/win7/warn.png");
  } else {
    // windows8 or later.
    idleIcon = path.join(__dirname, "../../resources/win/idle.png");
    syncIcon = path.join(__dirname, "../../resources/win/sync.png");
    pausedIcon = path.join(__dirname, "../../resources/win/paused.png");
    errorIcon = path.join(__dirname, "../../resources/win/error.png");
    warnIcon = path.join(__dirname, "../../resources/win/warn.png");
  }

  icons.getIdleIcon = () => idleIcon;
  icons.getSyncIcon = () => syncIcon;
  icons.getPausedIcon = () => pausedIcon;
  icons.getErrorIcon = () => errorIcon;
  icons.getWarnIcon = () => warnIcon;
}

export default icons;
