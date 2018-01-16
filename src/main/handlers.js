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
import {Synchronizing} from "../constants";
import {getConfig} from "./config";
import icons from "./icons";
import utils from "./utils";

export const changeStateHandler = (mb, storjEventHandler, siaEventHandler) => async payload => {
  if (payload === Synchronizing) {
    if (global.storj) {
      global.storj.start();
      global.storj.stdout.on("line", storjEventHandler);
    }
    if (global.sia) {
      global.sia.start();
      global.sia.stdout.on("line", siaEventHandler);
    }
    log.debug("Update the tray icon to the idle icon");
    mb.tray.setImage(icons.getSyncIcon());
  } else {
    if (global.storj) {
      global.storj.stdout.removeListener("line", storjEventHandler);
      await global.storj.close();
    }
    if (global.sia) {
      global.sia.stdout.removeListener("line", siaEventHandler);
      await global.sia.close();
    }
    log.debug("Update the tray icon to the paused icon");
    mb.tray.setImage(icons.getPausedIcon());
  }
  return payload;
};

export const openSyncFolderHandler = () => async () => {
  const cfg = await getConfig();
  log.info(`Open sync folder ${cfg.syncFolder}`);
  utils.openDirectory(cfg.syncFolder);
};

export const calculateUsedVolumeHandler = () => async () => {
  const cfg = await getConfig();
  const volume = await utils.totalVolume(cfg.syncFolder);
  log.info(`Calculating volume size of ${cfg.syncFolder}: ${volume / 1024 / 1024}GB`);
  return volume / 1024 / 1024;
};
