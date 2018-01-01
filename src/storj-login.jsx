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

import PropTypes from "prop-types";
import React from "react";

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
    };
    this._onClickCreateAccount = this._onClickCreateAccount.bind(this);
    this._onClickBack = this._onClickBack.bind(this);
    this._onClickFinish = this._onClickFinish.bind(this);
  }

  _onClickCreateAccount() {
    if (this.props.onClickCreateAccount) {
      this.props.onClickCreateAccount();
    }
  }

  _onClickBack() {
    if (this.props.onClickBack) {
      this.props.onClickBack();
    }
  }

  _onClickFinish() {
    if (this.props.onClickFinish) {
      this.props.onClickFinish({
        email: this.state.email,
        password: this.state.password,
        key: this.state.key,
      });
    }
  }

  render() {
    return (
      <div className="background-gradation">
        <header><img className="icon" src="../resources/left_white_icon.svg"/></header>
        <main style={style.main}>
          <div className="f141">One last thing.</div>
          <div className="f211">Please login to your <span className="underlined bold">Storj account</span>
          </div>
        </main>
        <main className="account-info" style={style.accountInfo}>
          <div>
            <input id="email" placeholder="e-mail" value={this.state.email} style={style.input}
                   onChange={e => this.setState({email: e.target.value})}/>
          </div>
          <div>
            <input id="password" type="password" placeholder="password" style={style.input}
                   onChange={e => this.setState({password: e.target.value})}/>
          </div>
          <div>
            <input id="key" type="password" placeholder="encryption key" style={style.input}
                   onChange={e => this.setState({key: e.target.value})}/>
          </div>
        </main>
        <main className="create-account" style={style.createAccount}>
          <div style={style.createAccountText}>
            Don't have an account?
          </div>
          <button id="create-account-btn" style={style.createAccountButton} onClick={this._onClickCreateAccount}>
            click here to create
          </button>
        </main>
        <footer>
          <a className="back-btn" onClick={this._onClickBack}>
            <img className="arrow" src="../resources/left_arrow.svg"/> Back
          </a>
          <a className="next-btn" onClick={this._onClickFinish}>
            Finish <img className="arrow" src="../resources/right_arrow.svg"/>
          </a>
        </footer>
      </div>
    );
  }

}

StorjLogin.propTypes = {
  onClickCreateAccount: PropTypes.func,
  onClickBack: PropTypes.func,
  onClickFinish: PropTypes.func
};