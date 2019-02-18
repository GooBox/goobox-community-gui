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
import path from "path";
import {AppID} from "../../constants";
import {getConfig} from "../config";
import * as desktop from "../desktop";
import {installJRE} from "../jre";
import {notifyAsync} from "../notify";
import popup from "../popup";
import Sia from "../sia";
import Storj from "../storj";
import utils from "../utils";

export const installJREHandler = () => async () => installJRE();

export const siaRequestWalletInfoHandler = () => async payload => {
  if (!global.sia) {
    global.sia = new Sia();
  }
  try {
    const res = await global.sia.wallet();
    global.sia.start(payload.syncFolder, true);

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

export const storjGenerateMnemonicHandler = () => async payload => {
  log.info("[GUI main] Generating a mnemonic code");
  if (global.storj && global.storj.proc) {
    await global.storj.close();
  }
  global.storj = new Storj();
  global.storj.start(payload.syncFolder, true);

  return global.storj.generateMnemonic();
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
    await global.storj.login(
      payload.email,
      payload.password,
      payload.encryptionKey
    );
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
  return global.storj.createAccount(payload.email, payload.password);
};

export const startSynchronizationHandler = () => async payload => {
  if (payload.newState !== "startSynchronization") {
    return;
  }
  log.verbose("[GUI main] Notify the sia account is ready");
  return notifyAsync({
    title: "Goobox",
    message: "Your sia account is ready",
    icon: path.join(__dirname, "../../resources/goobox.png"),
    sound: true,
    wait: true,
    appID: AppID,
  });
};

export const installerWindowAllClosedHandler = app => async () => {
  log.info("[GUI main] Loading the config file");
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

      utils.openDirectory(cfg.syncFolder);

      // if the installation process is finished.
      log.info(
        "[GUI main] Installation has been succeeded, now starting synchronization"
      );
      await popup();
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
