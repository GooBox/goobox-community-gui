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
import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Popover from "react-awesome-popover";
import styled from "styled-components";
import {BlueButton, WhiteButton} from "../buttons";
import Sidebar from "../sidebar";

const InputBox = styled.input`
  width: 489px;
  height: 48px;
  border-radius: 2.9px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.09);
  background-color: #ffffff;
`;

const GenSeedButton = styled.button.attrs({
  className: "btn btn-link",
  type: "button",
})`
  padding: 0;
`;

export class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      key: props.encryptionKey,
      emailWarn: props.emailWarn,
      passwordWarn: props.passwordWarn,
      keyWarn: props.keyWarn,
    };
    this._onClickNext = this._onClickNext.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      key: props.encryptionKey,
      emailWarn: props.emailWarn,
      passwordWarn: props.passwordWarn,
      keyWarn: props.keyWarn,
    });
  }

  _onClickNext() {
    const {processing, onClickNext} = this.props;
    const {email, password, key} = this.state;
    if (processing) {
      return;
    }

    let warn = false;
    if (!email) {
      warn = true;
      this.setState({emailWarn: true});
    }
    if (!password) {
      warn = true;
      this.setState({passwordWarn: true});
    }
    if (!key) {
      warn = true;
      this.setState({keyWarn: true});
    }
    if (!warn) {
      onClickNext({email, password, key});
    }
  }

  render() {

    const {processing, onClickGenerateSeed, onClickBack} = this.props;
    const {email, emailWarn, password, passwordWarn, key, keyWarn} = this.state;
    return (
      <div className={classNames("clearfix", {wait: processing})}>
        <Sidebar className="float-left"/>
        <main className="float-right d-flex flex-column">
          <h1>Login to your Storj account</h1>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <InputBox
              id="email"
              type="text"
              className={classNames("form-control", {"is-invalid": emailWarn})}
              value={email}
              onChange={e => processing || this.setState({email: e.target.value})}
            />
            <div className="invalid-feedback">Please enter a valid email address</div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <InputBox
              id="password"
              type="password"
              className={classNames("form-control", {"is-invalid": passwordWarn})}
              value={password}
              onChange={e => processing || this.setState({password: e.target.value})}
            />
            <div className="invalid-feedback">Please enter the correct password</div>
          </div>
          <div className="form-group">
            <div className="d-flex align-self-center justify-content-between">
              <label htmlFor="key">
                Encryption Key&nbsp;
                <Popover contentClass="rap-popover-content">
                  <FontAwesomeIcon icon="info-circle" className="info-button"/>
                  <span>If you already have a encryption key for Goobox please enter it, otherwise click on &quot;Generate&quot;.</span>
                </Popover>
              </label>
              <GenSeedButton
                id="generate-mnemonic-btn"
                onClick={() => processing || onClickGenerateSeed()}
              >generate seed
              </GenSeedButton>
            </div>
            <InputBox
              id="key"
              className={classNames("form-control", {"is-invalid": keyWarn})}
              value={key}
              onChange={e => processing || this.setState({key: e.target.value})}
            />
            <div className="invalid-feedback">Please enter the correct encryption key</div>
          </div>
          <div className="mt-auto d-flex justify-content-between">
            <WhiteButton id="back-btn" onClick={() => processing || onClickBack()}>Back </WhiteButton>
            <BlueButton id="next-btn" onClick={this._onClickNext}>Next</BlueButton>
          </div>
        </main>
      </div>
    );
  }

}

Login.propTypes = {
  // If true, showing wait mouse cursor and preventing all actions.
  processing: PropTypes.bool.isRequired,
  encryptionKey: PropTypes.string.isRequired,
  // onClickCreateAccount: PropTypes.func.isRequired,
  onClickGenerateSeed: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  emailWarn: PropTypes.bool,
  passwordWarn: PropTypes.bool,
  keyWarn: PropTypes.bool,
};

Login.defaultProps = {
  emailWarn: false,
  passwordWarn: false,
  keyWarn: false
};

export default Login;
