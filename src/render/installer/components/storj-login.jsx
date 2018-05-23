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
import Sidebar from "./sidebar";

const style = {
  input: {
    width: "489px",
    height: "48px",
    borderRadius: "2.9px",
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.09)",
    backgroundColor: "#ffffff",
  },
  button: {
    width: "239.1px",
    height: "47.3px",
    borderRadius: "3.2px",
    border: "solid 0.8px #dddddd"
  },
  genSeedButton: {
    padding: 0,
  }
};

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
            <input id="email" className={classNames("form-control", {"is-invalid": this.state.emailWarn})}
                   type="text" style={style.input} value={this.state.email}
                   onChange={e => this.props.processing || this.setState({email: e.target.value})}/>
            <div className="invalid-feedback">Please enter a valid email address</div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" className={classNames("form-control", {"is-invalid": this.state.passwordWarn})}
                   type="password" style={style.input} value={this.state.password}
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
              <button id="generate-mnemonic-btn" type="button" className="btn btn-link" style={style.genSeedButton}
                      onClick={() => this.props.processing || this.props.onClickGenerateSeed()}>generate seed
              </button>
            </div>
            <input id="key" className={classNames("form-control", {"is-invalid": this.state.keyWarn})}
                   type="text" style={style.input} value={this.state.key}
                   onChange={e => this.props.processing || this.setState({key: e.target.value})}/>
            <div className="invalid-feedback">Please enter the correct encryption key</div>
          </div>
          <div className="mt-auto d-flex justify-content-between">
            <button id="back-btn" type="button" className="btn btn-light"
                    onClick={() => this.props.processing || this.props.onClickBack()}
                    style={style.button}> Back
            </button>
            <button id="next-btn" type="button" className="btn btn-primary" onClick={this._onClickNext}
                    style={style.button}> Next
            </button>
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