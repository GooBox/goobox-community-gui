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
import styled from "styled-components";
import {BlueButton, WhiteButton} from "./buttons";
import Sidebar from "./sidebar"

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

export class StorjLogin extends React.Component {

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
    if (this.props.processing) {
      return
    }

    let warn = false;
    if (!this.state.email) {
      warn = true;
      this.setState({emailWarn: true});
    }
    if (!this.state.password) {
      warn = true;
      this.setState({passwordWarn: true});
    }
    if (!this.state.key) {
      warn = true;
      this.setState({keyWarn: true});
    }
    if (!warn) {
      this.props.onClickNext({
        email: this.state.email,
        password: this.state.password,
        key: this.state.key,
      });
    }
  }

  render() {

    return (
      <div className={classNames("clearfix", {wait: this.props.processing})}>
        <Sidebar className="float-left"/>
        <main className="float-right d-flex flex-column">
          <h1>Login to your Storj account</h1>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <InputBox id="email" type="text"
                      className={classNames("form-control", {"is-invalid": this.state.emailWarn})}
                      value={this.state.email}
                      onChange={e => this.props.processing || this.setState({email: e.target.value})}/>
            <div className="invalid-feedback">Please enter a valid email address</div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <InputBox id="password" type="password"
                      className={classNames("form-control", {"is-invalid": this.state.passwordWarn})}
                      value={this.state.password}
                      onChange={e => this.props.processing || this.setState({password: e.target.value})}/>
            <div className="invalid-feedback">Please enter the correct password</div>
          </div>
          <div className="form-group">
            <div className="d-flex align-self-center justify-content-between">
              <label htmlFor="key">
                Encryption Key&nbsp;
                <Popover>
                  <i className="fas fa-info-circle info-button"/>
                  <span>If you already have a encryption key for Goobox please enter it, otherwise click on "Generate".</span>
                </Popover>
              </label>
              <GenSeedButton id="generate-mnemonic-btn"
                             onClick={() => this.props.processing || this.props.onClickGenerateSeed()}>generate seed
              </GenSeedButton>
            </div>
            <InputBox id="key" className={classNames("form-control", {"is-invalid": this.state.keyWarn})}
                      value={this.state.key}
                      onChange={e => this.props.processing || this.setState({key: e.target.value})}/>
            <div className="invalid-feedback">Please enter the correct encryption key</div>
          </div>
          <div className="mt-auto d-flex justify-content-between">
            <WhiteButton id="back-btn"
                         onClick={() => this.props.processing || this.props.onClickBack()}>Back</WhiteButton>
            <BlueButton id="next-btn" onClick={this._onClickNext}>Next</BlueButton>
          </div>
        </main>
      </div>
    );
  }

}

StorjLogin.propTypes = {
  // If true, showing wait mouse cursor and preventing all actions.
  processing: PropTypes.bool.isRequired,
  encryptionKey: PropTypes.string.isRequired,
  onClickCreateAccount: PropTypes.func.isRequired,
  onClickGenerateSeed: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  emailWarn: PropTypes.bool,
  passwordWarn: PropTypes.bool,
  keyWarn: PropTypes.bool,
};

export default StorjLogin;
