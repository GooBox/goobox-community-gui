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

import {ipcRenderer, remote} from "electron";
import log from "electron-log";
import React from "react";
import util from "util";
import {saveConfig} from "../../../config";
import {
  JREInstallEvent, Sia, SiaWalletEvent, StopSyncAppsEvent, Storj, StorjLoginEvent,
  StorjRegisterationEvent
} from "../../../constants";
import Finish from "./finish-all";
import Preparation from "./preparation";
import SelectFolder from "./select-folder";
import ServiceSelector from "./service-selector";
import SiaFinish from "./sia-finish";
import SiaWallet from "./sia-wallet";
import StorjEmailConfirmation from "./storj-email-confirmation";
import StorjEncryptionKey from "./storj-encryption-key";
import StorjLogin from "./storj-login";
import StorjRegistration from "./storj-registration";
import Welcome from "./welcome";

export const Screen = {
  ChooseCloudService: "choose-cloud-service",
  StorjSelected: "storj-selected",
  SiaSelected: "sia-selected",
  BothSelected: "both-selected",
  StorjLogin: "storj-login",
  StorjRegistration: "storj-registration",
  StorjEncryptionKey: "storj-encryption-key",
  StorjEmailConfirmation: "storj-email-confirmation",
  SiaWallet: "sia-wallet",
  SiaFinish: "sia-finish",
  FinishAll: "finish-all",
  JREPreparation: "jre-preparation",
  SiaPreparation: "sia-preparation",
};


export class Installer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // current screen.
      screen: "",
      // true if the user chooses Storj.
      storj: false,
      // true if the user chooses Sia.
      sia: false,
      // default sync folder: <home>/<app-name>
      folder: process.env.DEFAULT_SYNC_FOLDER,
      // Storj account information.
      storjAccount: {
        email: "",
        password: "",
        key: "xxxx xxxx xxxx xxxx xxxxx xxxxxx xxxxxx xxxx",
        emailWarn: false,
        passwordWarn: false,
        keyWarn: false,
        warnMsg: null,
      },
      // Sia account information.
      siaAccount: {
        address: "",
        seed: "",
      },
      // true if the background process is working.
      wait: false,
      // used to show current progress in a progress bar.
      progress: 0,
    };

    this.requesting = false;
    this._prepareJRE = this._prepareJRE.bind(this);
    this._storjLogin = this._storjLogin.bind(this);
    this._storjRegister = this._storjRegister.bind(this);
    this._requestSiaWallet = this._requestSiaWallet.bind(this);
    this._saveConfig = this._saveConfig.bind(this);
    this._stopSyncApps = this._stopSyncApps.bind(this);
  }

  async _prepareJRE() {

    if (this.requesting) {
      return;
    }

    this.requesting = true;
    return new Promise(resolve => {

      let timerID;
      log.debug("set the wait mouse cursor");
      this.setState({wait: true, screen: Screen.JREPreparation, progress: 0}, () => {
        ipcRenderer.once(JREInstallEvent, (_, succeeded, msg) => {

          if (timerID) {
            clearInterval(timerID);
          }
          if (succeeded) {
            log.debug("JRE installation ends, reset the mouse cursor, and move to the next screen");
            this.setState({wait: false, progress: 100, screen: Screen.ChooseCloudService}, resolve);
          } else {
            log.debug(`JRE installation fails: ${msg}`);
            this.setState({wait: false}, resolve);
          }

        });

        timerID = setInterval(() => {
          const current = this.state.progress;
          if (current < 95) {
            this.setState({progress: current + 1})
          }
        }, 500);

        log.debug("requesting JRE installation");
        ipcRenderer.send(JREInstallEvent);

      });

    }).then(() => this.requesting = false);

  }

  async _storjLogin(info) {

    if (this.requesting) {
      return;
    }

    this.requesting = true;
    return new Promise(resolve => {

      this.setState({wait: true}, () => {
        ipcRenderer.once(StorjLoginEvent, (_, succeeded, msg, validKeys) => {

          if (succeeded) {
            this.setState({storjAccount: info, wait: false}, async () => {
              if (this.state.sia) {
                await this._requestSiaWallet();
                resolve();
              } else {
                await this._saveConfig();
                this.setState({screen: Screen.FinishAll}, resolve);
              }
            });
          } else {
            log.debug({
                storjAccount: {
                  emailWarn: !validKeys.email,
                  passwordWarn: !validKeys.password,
                  keyWarn: !validKeys.encryptionKey,
                  warnMsg: msg,
                }
              }
            );
            this.setState({
              wait: false,
              storjAccount: {
                emailWarn: !validKeys.email,
                passwordWarn: !validKeys.password,
                keyWarn: !validKeys.encryptionKey,
                warnMsg: util.isString(msg) ? msg : null,
              }
            }, resolve);
          }

        });
        ipcRenderer.send(StorjLoginEvent, info);
      });

    }).then(() => this.requesting = false);

  }
  ;

  async _storjRegister(info) {

    if (this.requesting) {
      return;
    }

    this.requesting = true;
    return new Promise(resolve => {

      this.setState({wait: true}, () => {
        ipcRenderer.once(StorjRegisterationEvent, (_, succeeded, args) => {

          if (succeeded) {
            this.setState({
              storjAccount: {
                email: info.email,
                password: info.password,
                encryptionKey: args,
              },
              wait: false,
              screen: Screen.StorjEncryptionKey
            }, resolve);
          } else {
            this.setState({
              wait: false,
              storjAccount: {
                emailWarn: true,
                passwordWarn: true,
                warnMsg: util.isString(args) ? args : null,
              }
            }, resolve);
          }

        });
        ipcRenderer.send(StorjRegisterationEvent, info);
      });

    }).then(() => this.requesting = false);

  }

  async _requestSiaWallet() {

    if (this.requesting) {
      return;
    }

    if (this.state.siaAccount.address) {
      return new Promise(resolve => this.setState({screen: Screen.SiaWallet}, resolve));
    }

    this.requesting = true;
    return new Promise(resolve => {

      this.setState({wait: true, progress: 0, screen: Screen.SiaPreparation}, () => {

        let timerID;
        ipcRenderer.once(SiaWalletEvent, (_, info, err) => {

          log.debug(`SiaWalletEvent: info = ${info}, err = ${err}`);
          if (timerID) {
            clearInterval(timerID);
          }

          if (err) {
            // TODO: Show this error.
            log.error(err);
            this.setState({wait: false}, resolve);
          } else {
            this.setState({siaAccount: info, wait: false, progress: 100, screen: Screen.SiaWallet}, resolve);
          }

        });

        timerID = setInterval(() => {
          const current = this.state.progress;
          if (current < 95) {
            this.setState({progress: current + 1})
          }
        }, 200);

        log.info("requesting sia wallet information")
        ipcRenderer.send(SiaWalletEvent);
      });

    }).then(() => this.requesting = false);

  }

  async _saveConfig() {

    try {
      await
        saveConfig({
          syncFolder: this.state.folder,
          installed: true,
          storj: this.state.storj,
          sia: this.state.sia,
        });
    } catch (err) {
      // TODO: Show this error message.
      log.error(err);
    }

  }

  async _stopSyncApps() {

    if (this.requesting) {
      return;
    }
    this.requesting = true;
    return new Promise(resolve => {

      this.setState({wait: true}, () => {
        ipcRenderer.once(StopSyncAppsEvent, (_, err) => {

          log.debug(`StopSyncAppsEvent: err = ${err}`);
          this.setState({wait: false}, resolve);

        });
        ipcRenderer.send(StopSyncAppsEvent);
      });

    }).then(() => this.requesting = false);

  }

  render() {
    log.debug(`rendering a screen for ${this.state.screen || "the initial screen"}`);
    let screen;
    switch (this.state.screen) {
      case Screen.ChooseCloudService:
        screen = <ServiceSelector
          onSelectStorj={() => {
            this.setState({storj: true, sia: false, screen: Screen.StorjSelected});
          }}
          onSelectSia={() => {
            this.setState({storj: false, sia: true, screen: Screen.SiaSelected});
          }}
          onSelectBoth={() => {
            this.setState({storj: true, sia: true, screen: Screen.BothSelected});
          }}
        />;
        break;

      case Screen.StorjSelected:
        screen = <SelectFolder
          service={Storj}
          folder={this.state.folder}
          onSelectFolder={folder => this.setState({folder: folder})}
          onClickBack={async () => {
            await this._stopSyncApps();
            return new Promise(resolve => this.setState({screen: Screen.ChooseCloudService}, resolve));
          }}
          onClickNext={() => this.setState({screen: Screen.StorjLogin})}
        />;
        break;

      case Screen.SiaSelected:
        screen = <SelectFolder
          service={Sia}
          folder={this.state.folder}
          onSelectFolder={folder => this.setState({folder: folder})}
          onClickBack={async () => {
            if (this.requesting) {
              return
            }
            await this._stopSyncApps();
            new Promise(resolve => this.setState({screen: Screen.ChooseCloudService}, resolve));
          }}
          onClickNext={async () => this._requestSiaWallet()}
        />;
        break;

      case Screen.BothSelected:
        screen = <SelectFolder
          service={`${Storj} and ${Sia}`}
          folder={this.state.folder}
          onSelectFolder={folder => this.setState({folder: folder})}
          onClickBack={async () => {
            await this._stopSyncApps();
            return new Promise(resolve => this.setState({screen: Screen.ChooseCloudService}, resolve));
          }}
          onClickNext={() => this.setState({screen: Screen.StorjLogin})}
        />;
        break;

      case Screen.StorjLogin:
        screen = <StorjLogin
          onClickCreateAccount={() => {
            if (!this.requesting) {
              this.setState({screen: Screen.StorjRegistration});
            }
          }}
          onClickBack={() => {
            if (!this.requesting) {
              this.setState({
                storjAccount: {
                  emailWarn: false,
                  passwordWarn: false,
                  keyWarn: false,
                  warnMsg: null,
                },
                screen: this.state.sia ? Screen.BothSelected : Screen.StorjSelected
              });
            }
          }}
          onClickFinish={async (info) => this._storjLogin(info)}
          emailWarn={this.state.storjAccount.emailWarn}
          passwordWarn={this.state.storjAccount.passwordWarn}
          keyWarn={this.state.storjAccount.keyWarn}
          warnMsg={this.state.storjAccount.warnMsg}
        />;
        break;

      case Screen.StorjRegistration:
        screen = <StorjRegistration
          onClickLogin={() => {
            if (!this.requesting) {
              this.setState({screen: Screen.StorjLogin});
            }
          }}
          onClickBack={() => {
            if (!this.requesting) {
              this.setState({
                storjAccount: {
                  emailWarn: false,
                  passwordWarn: false,
                  warnMsg: null,
                },
                screen: this.state.sia ? Screen.BothSelected : Screen.StorjSelected,
              });
            }
          }}
          onClickNext={async (info) => this._storjRegister(info)}
          emailWarn={this.state.storjAccount.emailWarn}
          passwordWarn={this.state.storjAccount.passwordWarn}
          warnMsg={this.state.storjAccount.warnMsg}
        />;
        break;

      case Screen.StorjEncryptionKey:
        screen = <StorjEncryptionKey
          encryptionKey={this.state.storjAccount.key || ""}
          onClickBack={() => this.setState({screen: Screen.StorjRegistration})}
          onClickNext={() => this.setState({screen: Screen.StorjEmailConfirmation})}
        />;
        break;

      case Screen.StorjEmailConfirmation:
        screen = <StorjEmailConfirmation
          onClickBack={() => this.setState({screen: Screen.StorjEncryptionKey})}
          onClickLogin={() => this.setState({screen: Screen.StorjLogin})}
        />;
        break;

      case Screen.SiaWallet:
        screen = <SiaWallet
          address={this.state.siaAccount.address || ""}
          seed={this.state.siaAccount.seed || ""}
          onClickBack={() => {
            this.setState({screen: this.state.storj ? Screen.StorjLogin : Screen.SiaSelected})
          }}
          onClickNext={async () => {
            await this._saveConfig();
            return new Promise(resolve => this.setState({screen: Screen.SiaFinish}, resolve));
          }}
        />;
        break;

      case Screen.SiaFinish:
        screen = <SiaFinish
          onClickBack={() => this.setState({screen: Screen.SiaWallet})}
          onClickClose={() => remote.getCurrentWindow().close()}
        />;
        break;

      case Screen.FinishAll:
        screen = <Finish
          onClickBack={() => this.setState({screen: Screen.StorjLogin})}
          onClickClose={() => remote.getCurrentWindow().close()}
        />;
        break;

      case Screen.JREPreparation:
        screen = (
          <Preparation progress={this.state.progress}>
            Getting some tools.<br/>
            <span className="bold">Please wait.</span>
          </Preparation>
        );
        break;

      case Screen.SiaPreparation:
        screen = (
          <Preparation progress={this.state.progress}>
            Setting up your <span className="bold">sia wallet</span>.
          </Preparation>
        );
        break;

      default:
        screen = <Welcome onClickNext={async () => this._prepareJRE()}/>;
        break;

    }

    return (
      <div className={this.state.wait ? "wait" : ""}>
        {screen}
      </div>
    );
  }

}

export default Installer;