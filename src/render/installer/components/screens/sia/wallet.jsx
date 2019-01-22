/*
 * Copyright (C) 2017-2019 Junpei Kawamoto
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
/* eslint jsx-a11y/label-has-associated-control: 0 */

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import Popover from "react-awesome-popover";
import styled from "styled-components";
import {CopyButton} from "../../buttons";
import Main from "../../partials/main";

const AddressBox = styled.input.attrs({
  className: "form-control",
  type: "text",
  readOnly: true,
})`
  height: 52px !important;
  border: solid 0.8px #dddddd !important;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.09) !important;
  background-color: #ffffff !important;
`;

const SeedBox = styled.textarea.attrs({
  className: "form-control",
  readOnly: true,
})`
  height: 149px !important;
  border: solid 0.8px #dddddd !important;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.09) !important;
  background-color: #ffffff !important;
`;


export const Wallet = ({address, seed, processing, next, prev, onClickNext}) => (
  <Main processing={processing} next={next} prev={prev} onClickNext={onClickNext} nextCaption="Set-up my Goobox">
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
        <AddressBox id="address" value={address}/>
        <div className="input-group-append">
          <CopyButton id="copy-address-btn" text={address}/>
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
        <SeedBox id="seed" value={seed}/>
        <div className="input-group-append">
          <CopyButton id="copy-seed-btn" text={seed}/>
        </div>
      </div>
    </div>
  </Main>
);

Wallet.propTypes = {
  address: PropTypes.string.isRequired,
  seed: PropTypes.string.isRequired,
  onClickNext: PropTypes.func.isRequired,
  processing: PropTypes.bool,
  next: PropTypes.string.isRequired,
  prev: PropTypes.string.isRequired,
};

Wallet.defaultProps = {
  processing: false,
};

export default Wallet;
