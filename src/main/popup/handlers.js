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
import opn from "opn";
import path from "path";
import {AppID, Idle, Paused, Synchronizing} from "../../constants";
import {getConfig} from "../config";
import icons from "../icons";
import {notifyAsync} from "../notify";
import utils from "../utils";

export const changeStateHandler = mb => async payload => {
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

export const openSyncFolderHandler = () => async () => {
  const cfg = await getConfig();
  log.info(`[GUI main] Open sync folder ${cfg.syncFolder}`);
  await opn(cfg.syncFolder);
};

export const calculateUsedVolumeHandler = () => async () => {
  const cfg = await getConfig();
  const volume = await utils.totalVolume(cfg.syncFolder);
  log.info(
    `[GUI main] Calculating volume size of ${cfg.syncFolder}: ${volume}GB`
  );
  return volume;
};

export const willQuitHandler = app => async event => {
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

export const updateStateHandler = mb => async payload => {
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

export const siaFundEventHandler = () => async payload => {
  switch (payload.eventType) {
    case "NoFunds":
      log.verbose(
        "[GUI main] Notify the user his/her wallet doesn't have sia coins"
      );
      return await notifyAsync({
        title: "Goobox",
        message: "Your wallet doesn't have sia coins",
        icon: path.join(__dirname, "../../resources/goobox.png"),
        sound: true,
        wait: true,
        appID: AppID,
      });
    case "InsufficientFunds":
      log.verbose(
        "[GUI main] Notify the user his/her wallet doesn't have sufficient funds"
      );
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon: path.join(__dirname, "../../resources/goobox.png"),
        sound: true,
        wait: true,
        appID: AppID,
      });
    case "Allocated":
      log.verbose("[GUI main] Notify the user his/her funds are allocated");
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon: path.join(__dirname, "../../resources/goobox.png"),
        sound: true,
        wait: true,
        appID: AppID,
      });
    case "Error":
      log.error(
        `[GUI main] siaFundEventHandler received an error: ${payload.message}`
      );
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon: path.join(__dirname, "../../resources/goobox.png"),
        sound: true,
        wait: true,
        appID: AppID,
      });
  }
};

export const themeChangedHandler = mb => async () => {
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
