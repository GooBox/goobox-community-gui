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

import log from "electron-log";
import PropTypes from "prop-types";
import React from "react";
import leftArrowImage from "../assets/left_arrow.svg";
import leftWhiteIcon from "../assets/left_white_icon.svg";
import rightArrowImage from "../assets/right_arrow.svg";

const style = {
  main: {
    color: "white",
    position: "absolute",
    top: "116px",
    fontSize: "30px",
    textAlign: "left",
    width: "600px",
    paddingLeft: "140px"
  },
  button: {
    width: "123px",
    height: "31px",
    fontSize: "11px",
    backgroundColor: "white",
    borderRadius: "5px",
    borderStyle: "none",
  },
  input: {
    width: "198px",
    height: "27px",
    marginBottom: 0,
  },
  accountInfo: {
    position: "absolute",
    top: "187px",
    paddingRight: "140px",
    fontSize: "30px",
    textAlign: "center",
    width: "600px",
    paddingLeft: "140px"
  },
  createAccount: {
    position: "absolute",
    top: "320px",
    fontSize: "11px",
    paddingRight: "140px",
    textAlign: "center",
    width: "600px",
    paddingLeft: "140px"
  },
  createAccountText: {
    paddingBottom: "9px",
    color: "white",
  },
  createAccountButton: {
    fontSize: "9px",
    height: "15px",
    width: "90px",
    backgroundColor: "white",
    borderRadius: "5px",
    borderStyle: "none",
  },
};

export default class StorjLogin extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      key: "",
      emailWarn: props.emailWarn,
      passwordWarn: props.passwordWarn,
      keyWarn: props.keyWarn,
    };
    this._onClickFinish = this._onClickFinish.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      emailWarn: props.emailWarn,
      passwordWarn: props.passwordWarn,
      keyWarn: props.keyWarn,
    });
  }

  _onClickFinish() {
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
      this.props.onClickFinish({
        email: this.state.email,
        password: this.state.password,
        encryptionKey: this.state.key,
      });
    }
  }

  render() {
    log.silly(`StorjLogin(emailWarn: ${this.state.emailWarn}, passwordWarn: ${this.state.passwordWarn}, keyWarn: ${this.state.keyWarn})`);
    let msg;
    if (this.state.emailWarn || this.state.passwordWarn || this.state.keyWarn) {
      if (this.props.warnMsg) {
        msg = (
          <main className="warnMsg" style={style.main}>
            <div className="f141">Ooops.</div>
            <div className="f211">{this.props.warnMsg}...</div>
          </main>
        );
      } else {
        msg = (
          <main className="warnMsg" style={style.main}>
            <div className="f141">Ooops.</div>
            <div className="f211">It looks your <span className="underlined bold">information is incorrect</span>...
            </div>
          </main>
        );
      }
    } else {
      msg = (
        <main className="info" style={style.main}>
          <div className="f141">One last thing.</div>
          <div className="f211">Please login to your <span className="underlined bold">Storj account</span></div>
        </main>
      )
    }

    return (
      <div className="background-gradation">
        <header><img className="icon" src={leftWhiteIcon}/></header>
        {msg}
        <main className="account-info" style={style.accountInfo}>
          <div>
            <input className={this.state.emailWarn ? "warn" : ""} id="email"
                   placeholder="e-mail" value={this.state.email} style={style.input}
                   onChange={e => this.setState({email: e.target.value})}/>
          </div>
          <div>
            <input className={this.state.passwordWarn ? "warn" : ""} id="password" type="password"
                   placeholder="password" value={this.state.password} style={style.input}
                   onChange={e => this.setState({password: e.target.value})}/>
          </div>
          <div>
            <input className={this.state.keyWarn ? "warn" : ""} id="key" type="password"
                   placeholder="encryption key" value={this.state.key} style={style.input}
                   onChange={e => this.setState({key: e.target.value})}/>
          </div>
        </main>
        <main className="create-account" style={style.createAccount}>
          <div style={style.createAccountText}>
            Don't have an account?
          </div>
          <button id="create-account-btn" style={style.createAccountButton} onClick={this.props.onClickCreateAccount}>
            click here to create
          </button>
        </main>
        <footer>
          <a className="back-btn" onClick={this.props.onClickBack}>
            <img className="arrow" src={leftArrowImage}/> Back
          </a>
          <a className="next-btn" onClick={this._onClickFinish}>
            Finish <img className="arrow" src={rightArrowImage}/>
          </a>
        </footer>
      </div>
    );
  }

}

StorjLogin.propTypes = {
  onClickCreateAccount: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickFinish: PropTypes.func.isRequired,
  emailWarn: PropTypes.bool,
  passwordWarn: PropTypes.bool,
  keyWarn: PropTypes.bool,
  warnMsg: PropTypes.string,
};