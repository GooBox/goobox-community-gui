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

import openAboutWindow from "about-window";
import log from "electron-log";
import icon from "./assets/goobox.svg";

export default async function showInfoWindowAsync() {
  log.debug("opening the info window");
  return new Promise(resolve => {
    // noinspection SpellCheckingInspection
    const about = openAboutWindow({
      icon_path: icon,
      bug_report_url: "https://github.com/GooBox/goobox-community-gui/issues",
      copyright: "Goobox",
      homepage: "http://goobox.io/",
      description: "Goobox community edition sync app for sia and storj 🎉🚀",
      license: "GPL-v3",
      win_options: {
        resizable: false,
        fullscreenable: false,
        minimizable: false,
        maximizable: false
      }
    });
    about.on("closed", resolve);
  });
}
