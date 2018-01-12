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

import {ipcRenderer, remote} from "electron";
import log from "electron-log";
import React from "react";
import util from "util";
import {saveConfig} from "./config";
import {
  JREInstallEvent, Sia, SiaWalletEvent, StopSyncAppsEvent, Storj, StorjLoginEvent,
  StorjRegisterationEvent
} from "./constants";
import Finish from "./finish-all";
import SelectFolder from "./select-folder";
import ServiceSelector from "./service-selector";
import SiaFinish from "./sia-finish";
import SiaWallet from "./sia-wallet";
import StorjEmailConfirmation from "./storj-email-confirmation";
import StorjEncryptionKey from "./storj-encryption-key";
import StorjLogin from "./storj-login";
import StorjRegistration from "./storj-registration";
import Welcome from "./welcome";

export const Hash = {
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
};


export class Installer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // current screen.
      screen: "",
      // true if the user chooses Storj.
      storj: false,
      // true if the user chooses SIA.
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
    };

    this.requesting = false;
    this._checkJRE = this._checkJRE.bind(this);
    this._storjLogin = this._storjLogin.bind(this);
    this._storjRegister = this._storjRegister.bind(this);
    this._requestSiaWallet = this._requestSiaWallet.bind(this);
    this._saveConfig = this._saveConfig.bind(this);
    this._stopSyncApps = this._stopSyncApps.bind(this);
  }

  async _checkJRE() {

    if (this.requesting) {
      return;
    }

    this.requesting = true;
    return new Promise(resolve => {

      log.debug("set the wait mouse cursor");
      this.setState({wait: true}, () => {
        ipcRenderer.once(JREInstallEvent, (_, succeeded, msg) => {

          if (succeeded) {
            log.debug("JRE installation ends, reset the mouse cursor, and move to the next screen");
            this.setState({wait: false, screen: Hash.ChooseCloudService}, resolve);
          } else {
            log.debug(`JRE installation fails: ${msg}`);
            this.setState({wait: false}, resolve);
          }

        });

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
                this.setState({screen: Hash.FinishAll}, resolve);
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

  };

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
              screen: Hash.StorjEncryptionKey
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
      return new Promise(resolve => this.setState({screen: Hash.SiaWallet}, resolve));
    }

    this.requesting = true;
    return new Promise(resolve => {

      this.setState({wait: true}, () => {
        ipcRenderer.once(SiaWalletEvent, (_, info, err) => {

          log.debug(`SiaWalletEvent: info = ${info}, err = ${err}`);
          if (err) {
            // TODO: Show this error.
            log.error(err);
            this.setState({wait: false}, resolve);
          } else {
            this.setState({siaAccount: info, wait: false, screen: Hash.SiaWallet}, resolve);
          }

        });
        ipcRenderer.send(SiaWalletEvent);
      });

    }).then(() => this.requesting = false);

  }

  async _saveConfig() {

    try {
      await saveConfig({
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

//   return (
// <Preparation progress={10}>
// Getting some tools.<br/>
// <span class="bold">Please wait.</span>
// </Preparation>
// );


  render() {
    log.debug(`rendering a screen for ${this.state.screen || "the initial screen"}`);
    let screen;
    switch (this.state.screen) {
      case Hash.ChooseCloudService:
        screen = <ServiceSelector
          onSelectStorj={() => {
            this.setState({storj: true, sia: false, screen: Hash.StorjSelected});
          }}
          onSelectSia={() => {
            this.setState({storj: false, sia: true, screen: Hash.SiaSelected});
          }}
          onSelectBoth={() => {
            this.setState({storj: true, sia: true, screen: Hash.BothSelected});
          }}
        />;
        break;

      case Hash.StorjSelected:
        screen = <SelectFolder
          service={Storj}
          folder={this.state.folder}
          onSelectFolder={folder => this.setState({folder: folder})}
          onClickBack={async () => {
            await this._stopSyncApps();
            return new Promise(resolve => this.setState({screen: Hash.ChooseCloudService}, resolve));
          }}
          onClickNext={() => this.setState({screen: Hash.StorjLogin})}
        />;
        break;

      case Hash.SiaSelected:
        screen = <SelectFolder
          service={Sia}
          folder={this.state.folder}
          onSelectFolder={folder => this.setState({folder: folder})}
          onClickBack={async () => {
            if (this.requesting) {
              return
            }
            await this._stopSyncApps();
            new Promise(resolve => this.setState({screen: Hash.ChooseCloudService}, resolve));
          }}
          onClickNext={async () => this._requestSiaWallet()}
        />;
        break;

      case Hash.BothSelected:
        screen = <SelectFolder
          service={`${Storj} and ${Sia}`}
          folder={this.state.folder}
          onSelectFolder={folder => this.setState({folder: folder})}
          onClickBack={async () => {
            await this._stopSyncApps();
            return new Promise(resolve => this.setState({screen: Hash.ChooseCloudService}, resolve));
          }}
          onClickNext={() => this.setState({screen: Hash.StorjLogin})}
        />;
        break;

      case Hash.StorjLogin:
        screen = <StorjLogin
          onClickCreateAccount={() => {
            if (!this.requesting) {
              this.setState({screen: Hash.StorjRegistration});
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
                screen: this.state.sia ? Hash.BothSelected : Hash.StorjSelected
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

      case Hash.StorjRegistration:
        screen = <StorjRegistration
          onClickLogin={() => {
            if (!this.requesting) {
              this.setState({screen: Hash.StorjLogin});
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
                screen: this.state.sia ? Hash.BothSelected : Hash.StorjSelected,
              });
            }
          }}
          onClickNext={async (info) => this._storjRegister(info)}
          emailWarn={this.state.storjAccount.emailWarn}
          passwordWarn={this.state.storjAccount.passwordWarn}
          warnMsg={this.state.storjAccount.warnMsg}
        />;
        break;

      case Hash.StorjEncryptionKey:
        screen = <StorjEncryptionKey
          encryptionKey={this.state.storjAccount.key || ""}
          onClickBack={() => this.setState({screen: Hash.StorjRegistration})}
          onClickNext={() => this.setState({screen: Hash.StorjEmailConfirmation})}
        />;
        break;

      case Hash.StorjEmailConfirmation:
        screen = <StorjEmailConfirmation
          onClickBack={() => this.setState({screen: Hash.StorjEncryptionKey})}
          onClickLogin={() => this.setState({screen: Hash.StorjLogin})}
        />;
        break;

      case Hash.SiaWallet:
        screen = <SiaWallet
          address={this.state.siaAccount === null || this.state.siaAccount.address}
          seed={this.state.siaAccount === null || this.state.siaAccount.seed}
          onClickBack={() => {
            this.setState({screen: this.state.storj ? Hash.StorjLogin : Hash.SiaSelected})
          }}
          onClickNext={async () => {
            await this._saveConfig();
            return new Promise(resolve => this.setState({screen: Hash.SiaFinish}, resolve));
          }}
        />;
        break;

      case Hash.SiaFinish:
        screen = <SiaFinish
          onClickBack={() => this.setState({screen: Hash.SiaWallet})}
          onClickClose={() => remote.getCurrentWindow().close()}
        />;
        break;

      case Hash.FinishAll:
        screen = <Finish
          onClickBack={() => this.setState({screen: Hash.StorjLogin})}
          onClickClose={() => remote.getCurrentWindow().close()}
        />;
        break;

      default:
        screen = <Welcome onClickNext={async () => this._checkJRE()}/>;
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