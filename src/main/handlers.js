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
import path from "path";
import * as desktop from "../../src/main/desktop";
import {AppID, Idle, Paused, Synchronizing} from "../constants";
import {getConfig} from "./config";
import {core} from "./core";
import icons from "./icons";
import {installJRE} from "./jre";
import Sia from "./sia";
import Storj from "./storj";
import utils from "./utils";

const notifyAsync = async opts => {
  return new Promise(resolve => {
    // noinspection JSUnresolvedFunction
    notifier.notify(opts, (err, res) => {
      if (err) {
        log.warn(`Notification failed, maybe the user canceled it: ${err}`);
      } else {
        resolve(res);
      }
    });
  });
};

// Handlers for the main app.
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
  utils.openDirectory(cfg.syncFolder);
};

export const calculateUsedVolumeHandler = () => async () => {
  const cfg = await getConfig();
  const volume = await utils.totalVolume(cfg.syncFolder);
  log.info(`[GUI main] Calculating volume size of ${cfg.syncFolder}: ${volume}GB`);
  return volume;
};

export const willQuitHandler = (app) => async event => {

  if ((!global.storj || global.storj.closed) && (!global.sia || global.sia.closed)) {
    return;
  }
  log.info("[GUI main] Goobox will quit but synchronization processes are still running");
  event.preventDefault();

  if (global.storj) {
    await global.storj.close();
  }
  if (global.sia) {
    await global.sia.close();
  }
  app.exit();

};

// Handlers for the installer.
export const installJREHandler = () => async () => {
  return await installJRE();
};

export const siaRequestWalletInfoHandler = () => async payload => {

  if (!global.sia) {
    global.sia = new Sia();
  }
  try {
    const res = await global.sia.wallet();
    global.sia.start(payload.syncFolder, true);

    // Until https://github.com/NebulousLabs/Sia/issues/2741 is fixed, restart sync-sia when wallet scan finishes.
    if (global.sia.stderr) {
      global.sia.stderr.on("line", async line => {
        if (line.indexOf("io.goobox.sync.sia.SiaDaemon - Done!") !== -1) {
          log.info("Restarting sync-sia");
          await global.sia.close();
          global.sia.start(payload.syncFolder);
        }
      });
    }
    // --

    return {
      address: res["wallet address"],
      seed: res["primary seed"],
    };

  } catch (error) {
    log.error(error);
    delete global.sia;
    throw error;
  }

};

export const stopSyncAppsHandler = () => async () => {
  if (global.storj) {
    await global.storj.close();
    delete global.storj;
  }
  if (global.sia) {
    await global.sia.close();
    delete global.sia;
  }
};


export const storjLoginHandler = () => async payload => {

  log.info(`[GUI main] Logging in to Storj: ${payload.email}`);
  if (global.storj && global.storj.proc) {
    await global.storj.close();
  }
  global.storj = new Storj();
  global.storj.start(payload.syncFolder, true);

  try {
    await global.storj.checkMnemonic(payload.encryptionKey);
  } catch (err) {
    log.error(`[GUI main] Invalid mnemonic: ${err}`);
    throw {
      error: err,
      email: false,
      password: false,
      encryptionKey: true,
    };
  }

  try {
    await global.storj.login(payload.email, payload.password, payload.encryptionKey);
  } catch (err) {
    log.error(`[GUI main] Failed to log in to Storj: ${err}`);
    throw {
      error: err,
      email: true,
      password: true,
      encryptionKey: false,
    };
  }

};

export const storjCreateAccountHandler = () => async payload => {
  log.info(`[GUI main] Creating a new Storj account for ${payload.email}`);
  if (global.storj && global.storj.proc) {
    await global.storj.close();
  }
  global.storj = new Storj();
  global.storj.start(payload.syncFolder, true);
  return await global.storj.createAccount(payload.email, payload.password);
};

export const startSynchronizationHandler = () => async payload => {
  if (payload.newState !== "startSynchronization") {
    return;
  }
  log.verbose("[GUI main] Notify the sia account is ready");
  return await notifyAsync({
    title: "Goobox",
    message: "Your sia account is ready",
    icon: path.join(__dirname, "../../resources/goobox.png"),
    sound: true,
    wait: true,
    appID: AppID
  });
};

export const installerWindowAllClosedHandler = (app) => async () => {

  log.info(`[GUI main] Loading the config file`);
  try {

    const cfg = await getConfig();
    if (cfg && cfg.installed) {

      try {
        await desktop.register(cfg.syncFolder);
      } catch (err) {
        log.error(`[GUI main] Failed to register the folder icon: ${err}`);
      }

      if (global.sia) {
        log.debug("[GUI main] Register startSynchronizationHandler");
        global.sia.once("syncState", startSynchronizationHandler());
      }

      // if the installation process is finished.
      log.info("[GUI main] Installation has been succeeded, now starting synchronization");
      await core();

    } else {

      // otherwise
      log.info("[GUI main] Installation has been canceled");
      if (global.storj) {
        log.info("[GUI main] Closing the storj instance");
        await global.storj.close();
        delete global.storj;
      }
      if (global.sia) {
        log.info("[GUI main] Closing the sia instance");
        await global.sia.close();
        delete global.sia;
      }
      app.quit();

    }

  } catch (err) {
    log.error(`[GUI main] Failed to read/write the config: ${err}`);
    if (global.storj) {
      await global.storj.close();
    }
    if (global.sia) {
      await global.sia.close();
    }
    app.quit();
  }

};

// Handlers for sync-storj/sync-sia apps.
export const updateStateHandler = mb => async payload => {
  switch (payload.newState) {
    case "synchronizing":
      log.debug("[GUI main] Set the synchronizing icon");
      mb.tray.setImage(icons.getSyncIcon());
      mb.appState = Synchronizing;
      break;
    case "idle":
      log.debug("[GUI main] Set the idle icon");
      mb.tray.setImage(icons.getIdleIcon());
      mb.appState = Idle;
      break;
    default:
      log.debug(`[GUI main] Received argument ${JSON.stringify(payload)} is not handled in updateStateHandler`);
  }
};

export const siaFundEventHandler = () => async payload => {
  switch (payload.eventType) {
    case "NoFunds":
      log.verbose("[GUI main] Notify the user his/her wallet doesn't have sia coins");
      return await notifyAsync({
        title: "Goobox",
        message: "Your wallet doesn't have sia coins",
        icon: path.join(__dirname, "../../resources/goobox.png"),
        sound: true,
        wait: true,
        appID: AppID
      });
    case "InsufficientFunds":
      log.verbose("[GUI main] Notify the user his/her wallet doesn't have sufficient funds");
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon: path.join(__dirname, "../../resources/goobox.png"),
        sound: true,
        wait: true,
        appID: AppID
      });
    case "Allocated":
      log.verbose("[GUI main] Notify the user his/her funds are allocated");
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon: path.join(__dirname, "../../resources/goobox.png"),
        sound: true,
        wait: true,
        appID: AppID
      });
    case "Error":
      log.error(`[GUI main] siaFundEventHandler received an error: ${payload.message}`);
      return await notifyAsync({
        title: "Goobox",
        message: payload.message,
        icon: path.join(__dirname, "../../resources/goobox.png"),
        sound: true,
        wait: true,
        appID: AppID
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