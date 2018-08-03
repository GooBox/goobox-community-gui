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

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Popover from "react-awesome-popover";
import {CopyToClipboard} from "react-copy-to-clipboard";
import styled from "styled-components";
import {SleepTimeToShowCopyButton} from "../constants";
import {BlueButton, WhiteButton} from "./buttons";
import Sidebar from "./sidebar";

const AddressBox = styled.input.attrs({
  className: "form-control",
  type: "text",
  readOnly: true,
})`
  height: 52px;
  border: solid 0.8px #dddddd;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.09);
  background-color: #ffffff;
`;

const SeedBox = styled.textarea.attrs({
  className: "form-control",
  readOnly: true,
})`
  height: 149px;
  border: solid 0.8px #dddddd;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.09);
  background-color: #ffffff;
`;

const CopyButton = styled.button.attrs({
  className: "btn btn-light",
  type: "button",
})`
  width: 65px;
  border: solid 0.8px #dddddd;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.09);
  font-size: 15px;
  text-align: center
  background-color: #ffffff;
`;


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

  _copyAddressBtn() {
    if (this.state.addressCopied) {
      return (
        <div className="text-success">
          <FontAwesomeIcon icon={["far", "check-circle"]}/>
          <br/>
          copied
        </div>
      );
    }
    return (
      <FontAwesomeIcon className="text-black-50" icon={["far", "clone"]}/>
    );
  }

  _copySeedBtn() {
    if (this.state.seedCopied) {
      return (
        <div className="text-success">
          <FontAwesomeIcon icon={["far", "check-circle"]}/>
          <br/>
          copied
        </div>
      );
    }
    return (
      <FontAwesomeIcon className="text-black-50" icon={["far", "clone"]}/>
    );
  }

  render() {

    return (
      <div className={classNames("clearfix", {wait: this.props.processing})}>
        <Sidebar className="float-left"/>
        <main className="float-right d-flex flex-column">
          <h1>Installing Sia</h1>

          <div className="form-group mb-3">
            <label htmlFor="address">
              Please save your &nbsp;
              <span className="font-weight-bold">Sia wallet address</span>&nbsp;
              <Popover contentClass="rap-popover-content">
                <FontAwesomeIcon icon="info-circle" className="info-button"/>
                <span>Send Sia tokens to this address in order to top-up your account.</span>
              </Popover>
            </label>
            <div className="input-group">
              <AddressBox id="address" value={this.props.address}/>
              <div className="input-group-append">
                <CopyToClipboard text={this.props.address} onCopy={this._addressCopied}>
                  <CopyButton id="copy-address-btn">{this._copyAddressBtn()}</CopyButton>
                </CopyToClipboard>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="seed">
              And your &nbsp;
              <span className="font-weight-bold">Sia seed</span>&nbsp;
              <Popover contentClass="rap-popover-content">
                <FontAwesomeIcon icon="info-circle" className="info-button"/>
                <span>Save your Sia seed somewhere safe.  It is the key to your account.</span>
              </Popover>
            </label>
            <div className="input-group">
              <SeedBox id="seed" value={this.props.seed}/>
              <div className="input-group-append">
                <CopyToClipboard text={this.props.seed} onCopy={this._seedCopied}>
                  <CopyButton id="copy-seed-btn">{this._copySeedBtn()}</CopyButton>
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
