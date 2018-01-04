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
import {HashRouter, Route, Switch} from "react-router-dom";
import {
  ConfigFile, JREInstallEvent, Sia, SiaWalletEvent, Storj, StorjLoginEvent,
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
import Welcome from "./welcome.jsx";

const storage = remote.require("electron-json-storage");

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
  }

  _checkJRE() {

    if (!this.requesting) {

      this.requesting = true;
      log.debug("set the wait mouse cursor");
      this.setState({wait: true}, () => {

        ipcRenderer.once(JREInstallEvent, () => {

          log.debug("JRE installation ends, reset the mouse cursor");
          this.setState({wait: false}, () => {

            log.debug("moving to the next screen");
            this.requesting = false;
            location.hash = Hash.ChooseCloudService;

          });

        });

        log.debug("requesting JRE installation");
        ipcRenderer.send(JREInstallEvent);

      });
    }

  }

  _storjLogin(info) {

    if (!this.requesting) {
      this.requesting = true;
      this.setState({wait: true}, () => {
        ipcRenderer.once(StorjLoginEvent, (_, res) => {

          this.setState({storjAccount: info, wait: false}, () => {
            this.requesting = false;
            if (this.state.sia) {
              this._requestSiaWallet();
            } else {
              this._saveConfig();
              location.hash = Hash.FinishAll;
            }
          });

        });
        ipcRenderer.send(StorjLoginEvent, info);
      });
    }

  };

  _storjRegister(info) {

    if (!this.requesting) {
      this.requesting = true;
      this.setState({wait: true}, () => {

        ipcRenderer.once(StorjRegisterationEvent, (_, key) => {

          this.setState({
            storjAccount: {
              email: info.email,
              password: info.password,
              key: key,
            },
            wait: false
          }, () => {
            location.hash = Hash.StorjEncryptionKey;
            this.requesting = false;
          });

        });
        ipcRenderer.send(StorjRegisterationEvent, info);

      });

    }

  }

  _requestSiaWallet() {

    if (this.requesting) {
      return;
    }

    if (this.state.siaAccount.address) {
      location.hash = Hash.SiaWallet;
      return;
    }

    this.requesting = true;
    this.setState({wait: true}, () => {
      ipcRenderer.once(SiaWalletEvent, (_, info, err) => {
        log.debug(`SiaWalletEvent: info = ${info}, err = ${err}`);
        if (err) {
          this.setState({wait: false}, () => {
            this.requesting = false;
            log.error(err);
          });
        } else {
          this.setState({siaAccount: info, wait: false}, () => {
            this.requesting = false;
            location.hash = Hash.SiaWallet;
          });
        }
      });
      ipcRenderer.send(SiaWalletEvent);
    });

  }

  _saveConfig() {

    storage.set(ConfigFile, {
      syncFolder: this.state.folder,
      installed: true,
      storj: this.state.storj,
      sia: this.state.sia,
    }, (err) => {
      if (err) {
        log.error(err);
      }
    });

  }

  render() {
    return (
      <div className={this.state.wait ? "wait" : ""}>
        <HashRouter hashType="noslash">
          <Switch>
            <Route exact path="/" render={() => {
              return (
                <Welcome onClickNext={this._checkJRE}/>
              );
            }}/>
            <Route path={`/${Hash.ChooseCloudService}`} render={() => {
              log.debug("Rendering the choose cloud service screen");
              return (
                <ServiceSelector
                  onSelectStorj={() => {
                    this.setState({storj: true, sia: false});
                    location.hash = Hash.StorjSelected;
                  }}
                  onSelectSia={() => {
                    this.setState({storj: false, sia: true});
                    location.hash = Hash.SiaSelected;
                  }}
                  onSelectBoth={() => {
                    this.setState({storj: true, sia: true});
                    location.hash = Hash.BothSelected;
                  }}
                />
              );
            }}/>
            <Route path={`/${Hash.StorjSelected}`} render={() => {
              return (
                <SelectFolder
                  service={Storj}
                  folder={this.state.folder}
                  onSelectFolder={folder => this.setState({folder: folder})}
                  onClickBack={() => location.hash = Hash.ChooseCloudService}
                  onClickNext={() => location.hash = Hash.StorjLogin}
                />
              );
            }}/>
            <Route path={`/${Hash.SiaSelected}`} render={() => {
              return (
                <SelectFolder
                  service={Sia}
                  folder={this.state.folder}
                  onSelectFolder={folder => this.setState({folder: folder})}
                  onClickBack={() => {
                    if (!this.requesting) {
                      location.hash = Hash.ChooseCloudService;
                    }
                  }}
                  onClickNext={this._requestSiaWallet}
                />
              );
            }}/>
            <Route path={`/${Hash.BothSelected}`} render={() => {
              return (
                <SelectFolder
                  service={`${Storj} and ${Sia}`}
                  folder={this.state.folder}
                  onSelectFolder={folder => this.setState({folder: folder})}
                  onClickBack={() => location.hash = Hash.ChooseCloudService}
                  onClickNext={() => location.hash = Hash.StorjLogin}
                />
              );
            }}/>
            <Route path={`/${Hash.StorjLogin}`} render={() => {
              return (
                <StorjLogin
                  onClickCreateAccount={() => {
                    if (!this.requesting) {
                      location.hash = Hash.StorjRegistration;
                    }
                  }}
                  onClickBack={() => {
                    if (!this.requesting) {
                      if (this.state.sia) {
                        location.hash = Hash.BothSelected;
                      } else {
                        location.hash = Hash.StorjSelected;
                      }
                    }
                  }}
                  onClickFinish={(info) => this._storjLogin(info)}
                />
              );
            }}/>
            <Route path={`/${Hash.StorjRegistration}`} render={() => {
              return (
                <StorjRegistration
                  onClickLogin={() => {
                    if (!this.requesting) {
                      location.hash = Hash.StorjLogin
                    }
                  }}
                  onClickBack={() => {
                    if (!this.requesting) {
                      if (this.state.sia) {
                        location.hash = Hash.BothSelected;
                      } else {
                        location.hash = Hash.StorjSelected;
                      }
                    }
                  }}
                  onClickNext={(info) => this._storjRegister(info)}
                />
              );
            }}/>
            <Route path={`/${Hash.StorjEncryptionKey}`} render={() => {
              return (
                <StorjEncryptionKey
                  encryptionKey={this.state.storjAccount.key}
                  onClickBack={() => location.hash = Hash.StorjRegistration}
                  onClickNext={() => location.hash = Hash.StorjEmailConfirmation}
                />
              );
            }}/>
            <Route path={`/${Hash.StorjEmailConfirmation}`} render={() => {
              return (
                <StorjEmailConfirmation
                  onClickBack={() => location.hash = Hash.StorjEncryptionKey}
                  onClickLogin={() => location.hash = Hash.StorjLogin}
                />
              );
            }}/>
            <Route path={`/${Hash.SiaWallet}`} render={() => {
              return (
                <SiaWallet
                  address={this.state.siaAccount === null || this.state.siaAccount.address}
                  seed={this.state.siaAccount === null || this.state.siaAccount.seed}
                  onClickBack={() => {
                    if (this.state.storj) {
                      location.hash = Hash.StorjLogin;
                    } else {
                      location.hash = Hash.SiaSelected;
                    }
                  }}
                  onClickNext={() => {
                    this._saveConfig();
                    location.hash = Hash.SiaFinish;
                  }}
                />
              );
            }}/>
            <Route path={`/${Hash.SiaFinish}`} render={() => {
              return (
                <SiaFinish
                  onClickBack={() => location.hash = Hash.SiaWallet}
                  onClickClose={() => remote.getCurrentWindow().close()}
                />
              );
            }}/>
            <Route path={`/${Hash.FinishAll}`} render={() => {
              return (
                <Finish
                  onClickBack={() => location.hash = Hash.StorjLogin}
                  onClickClose={() => remote.getCurrentWindow().close()}
                />
              );
            }}/>
          </Switch>
        </HashRouter>
      </div>
    );
  }

}

export default Installer;