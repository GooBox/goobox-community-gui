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
import downArrowWhiteImage from "../assets/down_arrow_white.svg";
import leftArrowImage from "../assets/left_arrow.svg";
import leftWhiteIcon from "../assets/left_white_icon.svg";
import rightArrowImage from "../assets/right_arrow.svg";

const dialog = remote.dialog;


const style = {
  main: {
    color: "white",
    display: "table",
    fontSize: "30px",
    textAlign: "left",
    margin: "52px auto 0 auto",
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
    color: "white",
    fontSize: "30px",
    textAlign: "center",
    marginTop: "12px",
  },
  browseBtn: {
    fontSize: "30px",
    color: "white",
    textAlign: "center",
    marginTop: "16px",
  },
  selectedFolder: {
    fontSize: "11px",
    textAlign: "center",
    paddingTop: "9px",
    color: "white",
  },
};

export default class SelectFolder extends React.Component {

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
      <div className="background-gradation">
        <header><img className="icon" src={leftWhiteIcon}/></header>
        <main className="left" style={style.main}>
          <div className="f141">You chose <span className="bold service-name">{service}</span>.</div>
          <div className="f211 bold">
            Now, choose the location of your <span className="underlined bold">sync folder</span>.
          </div>
        </main>
        <main style={style.downArrow}>
          <img className="up-and-down" src={downArrowWhiteImage} width={17} height={29}/>
        </main>
        <main style={style.browseBtn}>
          <button style={style.button} onClick={() => this._onClickBrowse().catch(console.debug)}>Browse...
          </button>
          <br/>
          <span className="folder" style={style.selectedFolder}>{this.props.folder}</span>
        </main>
        <footer>
          <a className="back-btn" onClick={this._onClickBack} role="button">
            <img className="arrow" src={leftArrowImage}/> Back
          </a>
          <a className="next-btn" onClick={this._onClickNext} role="button">
            Next <img className="arrow" src={rightArrowImage}/>
          </a>
        </footer>
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