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

import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Popover from "react-awesome-popover";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {SleepTimeToShowCopyButton} from "../constants";
import {BlueButton, WhiteButton} from "./buttons";
import Sidebar from "./sidebar";

const style = {
  input: {
    height: "52px",
    border: "solid 0.8px #dddddd",
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09)",
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: "149px",
    border: "solid 0.8px #dddddd",
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09)",
    backgroundColor: "#ffffff",
  },
  copyButton: {
    width: "65px",
    border: "solid 0.8px #dddddd",
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09)",
    fontSize: "15px",
    textAlign: "center",
    backgroundColor: "#ffffff",
  },
  button: {
    width: "239.1px",
    height: "47.3px",
    borderRadius: "3.2px",
    border: "solid 0.8px #dddddd",
  },
};


export class SiaWallet extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      addressCopied: false,
      seedCopied: false
    };
    this._addressCopied = this._addressCopied.bind(this);
    this._seedCopied = this._seedCopied.bind(this);
  }

  _addressCopied() {
    this.setState({addressCopied: true}, () => {
      setTimeout(() => this.setState({addressCopied: false}), SleepTimeToShowCopyButton);
    });
  }

  _seedCopied() {
    this.setState({seedCopied: true}, () => {
      setTimeout(() => this.setState({seedCopied: false}), SleepTimeToShowCopyButton);
    });
  }

  render() {
    let copyAddressBtn, copySeedBtn;
    if (this.state.addressCopied) {
      copyAddressBtn = (
        <div className="text-success">
          <i className="far fa-check-circle"/>
          <br/>
          copied
        </div>
      );
    } else {
      copyAddressBtn = (
        <i className="far fa-clone text-black-50"/>
      );
    }
    if (this.state.seedCopied) {
      copySeedBtn = (
        <div className="text-success">
          <i className="far fa-check-circle"/>
          <br/>
          copied
        </div>
      );
    } else {
      copySeedBtn = (
        <i className="far fa-clone text-black-50"/>
      );
    }

    return (
      <div className={classNames("clearfix", {wait: this.props.processing})}>
        <Sidebar className="float-left"/>
        <main className="float-right d-flex flex-column">
          <h1>Installing Sia</h1>

          <div className="form-group mb-3">
            <label htmlFor="address">
              Please save your &nbsp;
              <span className="font-weight-bold">Sia wallet address</span>&nbsp;
              <Popover>
                <i className="fas fa-info-circle info-button"/>
                <span>Send Sia tokens to this address in order to top-up your account.</span>
              </Popover>
            </label>
            <div className="input-group">
              <input id="address" className="form-control" readOnly={true}
                     type="text" style={style.input} value={this.props.address}/>
              <div className="input-group-append">
                <CopyToClipboard text={this.props.address} onCopy={this._addressCopied}>
                  <button id="copy-address-btn" className="btn btn-light" type="button" style={style.copyButton}>
                    {copyAddressBtn}
                  </button>
                </CopyToClipboard>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="seed">
              And your &nbsp;
              <span className="font-weight-bold">Sia seed</span>&nbsp;
              <Popover>
                <i className="fas fa-info-circle info-button"/>
                <span>Save your Sia seed somewhere safe.  It is the key to your account.</span>
              </Popover>
            </label>
            <div className="input-group">
              <textarea id="seed" className="form-control" readOnly={true}
                        style={style.textArea} value={this.props.seed}/>
              <div className="input-group-append">
                <CopyToClipboard text={this.props.seed} onCopy={this._seedCopied}>
                  <button id="copy-seed-btn" className="btn btn-light" type="button" style={style.copyButton}>
                    {copySeedBtn}
                  </button>
                </CopyToClipboard>
              </div>
            </div>
          </div>

          <div className="mt-auto d-flex justify-content-between">
            <WhiteButton id="back-btn" onClick={this.props.onClickBack}>Back</WhiteButton>
            <BlueButton id="next-btn" onClick={this.props.onClickNext}>Set-up my Goobox</BlueButton>
          </div>

        </main>
      </div>
    );

  }

}

SiaWallet.propTypes = {
  address: PropTypes.string.isRequired,
  seed: PropTypes.string.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
};

export default SiaWallet;
