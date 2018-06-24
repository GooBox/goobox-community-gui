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

import {remote} from "electron";
import PropTypes from "prop-types";
import React from "react";
import {Sia, Storj} from "../../../constants";
import {BlueButton, WhiteButton} from "./buttons";
import Sidebar from "./sidebar";

const dialog = remote.dialog;

const style = {
  inputBox: {
    width: "342px",
    height: "48px",
  },
};

export class SelectFolder extends React.Component {

  constructor(props) {
    super(props);
    this._onClickBack = this._onClickBack.bind(this);
    this._onClickNext = this._onClickNext.bind(this);
    this._onClickBrowse = this._onClickBrowse.bind(this);
    this.selecting = false;
    this.state = {
      disabled: false,
    };
  }

  _onClickBack() {
    if (this.state.disabled) {
      return;
    }
    if (this.props.onClickBack && !this.selecting) {
      this.setState({disabled: true}, this.props.onClickBack);
    }
  }

  _onClickNext() {
    if (this.state.disabled) {
      return;
    }
    if (this.props.onClickNext && !this.selecting) {
      this.setState({disabled: true}, this.props.onClickNext);
    }
  }

  async _onClickBrowse() {

    if (this.state.disabled) {
      throw "disabled";
    }

    if (this.selecting) {
      throw "already opened";
    }

    let err;
    this.selecting = true;
    return new Promise(resolve => {

      dialog.showOpenDialog(null, {
        defaultPath: this.props.folder,
        properties: ["openDirectory", "createDirectory"]
      }, resolve);

    }).then(selected => {

      if (selected && selected.length > 0 && this.props.onSelectFolder) {
        let dir = selected[0];
        if (dir.endsWith("\\")) {
          dir = dir.substr(0, dir.length - 1);
        }
        this.props.onSelectFolder(dir);
      }

    }).catch(reason => {
      err = reason;
    }).then(() => {
      this.selecting = false;
      if (err) {
        return Promise.reject(err);
      }
    });

  }

  render() {
    let service;
    if (this.props.storj) {
      if (this.props.sia) {
        service = `${Storj} & ${Sia}`;
      } else {
        service = Storj;
      }
    } else {
      service = Sia;
    }

    return (
      <div className="clearfix">
        <Sidebar className="float-left"/>
        <main className="float-right d-flex flex-column">
          <h1>{`Installing ${service}`}</h1>
          <p>Choose the folder you want to sync with Goobox</p>
          <div className="form-row">
            <input id="folder" type="text" className="form-control mr-2" readOnly={true} style={style.inputBox}
                   value={this.props.folder}/>
            <button id="change-folder-btn" type="button" className="btn btn-outline-primary"
                    onClick={() => this._onClickBrowse().catch(console.debug)}>Change folder
            </button>
            <small className="form-text text-muted"> Everything in this folder will be encrypted and safely stored.
            </small>
          </div>
          <div className="mt-auto d-flex justify-content-between">
            <WhiteButton id="back-btn" onClick={this._onClickBack}>Back</WhiteButton>
            <BlueButton id="next-btn" onClick={this._onClickNext}>Choose this folder</BlueButton>
          </div>
        </main>
      </div>
    );
  }

}

SelectFolder.propsTypes = {
  storj: PropTypes.bool.isRequired,
  sia: PropTypes.bool.isRequired,
  folder: PropTypes.string.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  onSelectFolder: PropTypes.func.isRequired
};

export default SelectFolder;
