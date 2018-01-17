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
      emailWarn: props.emailWarn,
      passwordWarn: props.passwordWarn,
    };
    this._onClickNext = this._onClickNext.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      emailWarn: props.emailWarn,
      passwordWarn: props.passwordWarn,
    });
  }

  _onClickNext() {
    if (this.props.processing) {
      return;
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
    if (!warn) {
      this.props.onClickNext({
        email: this.state.email,
        password: this.state.password,
      });
    }
  }

  render() {
    let msg;
    if (this.state.emailWarn || this.state.passwordWarn) {
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
            <div className="f211">Invalid email or password. <span className="underlined bold">Please try again.</span>...
            </div>
          </main>
        );
      }
    } else {
      msg = (
        <main className="info" style={style.main}>
          <div className="f141">Storj new account.</div>
          <div className="f211">Please create your <span className="underlined bold">Storj account</span></div>
        </main>
      );
    }

    return (
      <div className="background-gradation">
        <header><img className="icon" src={leftWhiteIcon}/></header>
        {msg}
        <main style={style.accountInfo}>
          <div>
            <input className={this.state.emailWarn ? "warn" : ""} id="email"
                   placeholder="e-mail" value={this.state.email} style={style.input}
                   onChange={e => this.props.processing || this.setState({email: e.target.value})}/>
          </div>
          <div>
            <input className={this.state.passwordWarn ? "warn" : ""} id="password" type="password"
                   placeholder="password" value={this.state.password} style={style.input}
                   onChange={e => this.props.processing || this.setState({password: e.target.value})}/>
          </div>
        </main>
        <main style={style.storjLogin}>
          <div style={style.storjLoginText}>
            Already have an account?
          </div>
          <button id="login-btn" style={style.button}
                  onClick={() => this.props.processing || this.props.onClickLogin()}>
            Click here to login
          </button>
        </main>
        <footer>
          <a className="back-btn" onClick={() => this.props.processing || this.props.onClickBack()}>
            <img className="arrow" src={leftArrowImage}/> Back
          </a>
          <a className="next-btn" onClick={this._onClickNext}>
            Next <img className="arrow" src={rightArrowImage}/>
          </a>
        </footer>
      </div>
    );
  }

}

StorjRegistration.propTypes = {
  // If true, showing wait mouse cursor and preventing all actions.
  processing: PropTypes.bool.isRequired,
  onClickLogin: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  emailWarn: PropTypes.bool,
  passwordWarn: PropTypes.bool,
  warnMsg: PropTypes.string,
};