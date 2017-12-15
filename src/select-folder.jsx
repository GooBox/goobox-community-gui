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

import React from "react";
import PropTypes from "prop-types";
import {remote} from "electron";

const dialog = remote.dialog;


const style = {
  main: {
    color: "white",
    position: "absolute",
    top: "116px",
    fontSize: "30px",
    textAlign: "left",
    width: "600px",
    paddingLeft: "91px"
  },
  button: {
    width: "123px",
    height: "31px",
    fontSize: "11px",
    backgroundColor: "white",
    borderRadius: "5px",
    borderStyle: "none"
  },
  downArrow: {
    position: "absolute",
    top: "179px",
    paddingRight: "89px",
    color: "white",
    fontSize: "30px",
    textAlign: "center",
    width: "600px",
    paddingLeft: "91px"
  },
  browseBtn: {
    position: "absolute",
    top: 236,
    paddingRight: "89px",
    color: "white",
    fontSize: "30px",
    textAlign: "center",
    width: "600px",
    paddingLeft: "91px"
  },
  f141: {
    fontSize: "14.1px"
  },
  f211: {
    fontSize: "21.1px"
  }

};

export default class SelectFolder extends React.Component {

  constructor(props) {
    super(props);
    this._onClickBack = this._onClickBack.bind(this);
    this._onClickNext = this._onClickNext.bind(this);
    this._onClickBrowse = this._onClickBrowse.bind(this);
    this.selecting = false;
  }

  _onClickBack() {
    if (this.props.onClickBack && !this.selecting) {
      this.props.onClickBack();
    }
  }

  _onClickNext() {
    if (this.props.onClickNext && !this.selecting) {
      this.props.onClickNext();
    }
  }

  _onClickBrowse() {

    if (this.selecting) {
      return Promise.reject("already opened");
    }

    let err;
    this.selecting = true;
    return new Promise(resolve => {

      dialog.showOpenDialog(null, {
        defaultPath: this.props.folder,
        properties: ["openDirectory"]
      }, resolve);

    }).then(selected => {

      if (selected && selected.length > 0 && this.props.onSelectFolder) {
        this.props.onSelectFolder(selected[0]);
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
    return (
      <div className="background-gradation">
        <header><img className="icon" src="../resources/left_white_icon.svg"/></header>
        <main className="left" style={style.main}>
          <div style={style.f141}>You chose <span className="bold service-name">{this.props.service}</span>.</div>
          <div className="bold" style={style.f211}>
            Now, choose the location of your <span className="underlined bold">sync folder</span>.
          </div>
        </main>
        <main style={style.downArrow}>
          <img className="up-and-down" src="../resources/down_arrow_white.svg" width="17px" height="29px"/>
        </main>
        <main style={style.browseBtn}>
          <div>
            <button style={style.button} onClick={this._onClickBrowse}>Browse...</button>
          </div>
        </main>
        <footer>
          <a className="back-btn" onClick={this._onClickBack} role="button">
            <img className="arrow" src="../resources/left_arrow.svg"/> Back
          </a>
          <a className="next-btn" onClick={this._onClickNext} role="button">
            Next <img className="arrow" src="../resources/right_arrow.svg"/>
          </a>
        </footer>
      </div>
    );
  }

}

SelectFolder.propsTypes = {
  service: PropTypes.string,
  folder: PropTypes.string,
  onClickBack: PropTypes.func,
  onClickNext: PropTypes.func,
  onSelectFolder: PropTypes.func
};