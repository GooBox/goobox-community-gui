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

const style = {
  main: {
    color: "white",
    position: "absolute",
    top: "116px",
    fontSize: "30px",
    textAlign: "left",
    width: "600px",
    paddingLeft: "140px",
  },
  button: {
    width: "123px",
    backgroundColor: "white",
    borderRadius: "5px",
    borderStyle: "none",
    fontSize: "9px",
    height: "15px"
  },
  input: {
    width: "198px",
    height: "27px",
  },
  accountInfo: {
    color: "white",
    fontSize: "30px",
    textAlign: "center",
    width: "600px",
    paddingLeft: "140px",
    position: "absolute",
    top: "201px",
    paddingRight: "140px",
  },
  storjLogin: {
    color: "white",
    textAlign: "center",
    width: "600px",
    paddingLeft: "140px",
    position: "absolute",
    top: "309px",
    fontSize: "11px",
    paddingRight: "140px",
  },
  storjLoginText: {
    paddingBottom: "9px",
  },
};

export default class StorjRegistration extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
    this._onClickNext = this._onClickNext.bind(this);
  }

  _onClickNext() {
    if (this.props.onClickNext) {
      this.props.onClickNext({
        email: this.state.email,
        password: this.state.password,
      });
    }
  }

  render() {
    return (
      <div className="background-gradation">
        <header><img className="icon" src="../resources/left_white_icon.svg"/></header>
        <main style={style.main}>
          <div className="f141">Storj new account.</div>
          <div className="f211">Please create your <span className="underlined bold">Storj account</span></div>
        </main>
        <main style={style.accountInfo}>
          <div>
            <input id="email" placeholder="e-mail" value={this.state.email} style={style.input}
                   onChange={e => this.setState({email: e.target.value})}/>
          </div>
          <div>
            <input id="password" type="password" placeholder="password" value={this.state.password} style={style.input}
                   onChange={e => this.setState({password: e.target.value})}/>
          </div>
        </main>
        <main style={style.storjLogin}>
          <div style={style.storjLoginText}>
            Already have an account?
          </div>
          <button id="login-btn" style={style.button}
                  onClick={() => this.props.onClickLogin && this.props.onClickLogin()}>
            Click here to login
          </button>
        </main>
        <footer>
          <a className="back-btn" onClick={() => this.props.onClickBack && this.props.onClickBack()}>
            <img className="arrow" src="../resources/left_arrow.svg"/> Back
          </a>
          <a className="next-btn" onClick={this._onClickNext}>
            Next <img className="arrow" src="../resources/right_arrow.svg"/>
          </a>
        </footer>
      </div>
    );
  }

}

StorjRegistration.propTypes = {
  onClickLogin: PropTypes.func,
  onClickBack: PropTypes.func,
  onClickNext: PropTypes.func,
};