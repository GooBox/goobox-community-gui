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

import PropTypes from "prop-types";
import React from "react";
import leftWhiteIcon from "../../../assets/left_white_icon.svg";
import {BlueButton, WhiteButton} from "../../buttons";

const style = {
  msg: {
    color: "white",
    display: "table",
    fontSize: "30px",
    textAlign: "left",
    margin: "52px auto 0 auto",
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
    fontSize: "30px",
    textAlign: "center",
    marginTop: "20px",
  },
  storjLogin: {
    color: "white",
    fontSize: "11px",
    textAlign: "center",
    marginTop: "10px",
  },
  storjLoginText: {
    paddingBottom: "9px",
  },
};

export class Registration extends React.Component {

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
    const {processing, onClickNext} = this.props;
    const {email, password} = this.state;
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
    if (!warn) {
      onClickNext({email, password});
    }
  }

  render() {
    let msg;
    const {processing, warnMsg, onClickLogin, onClickBack} = this.props;
    const {email, password, emailWarn, passwordWarn} = this.state;
    if (emailWarn || passwordWarn) {
      if (warnMsg) {
        msg = (
          <main className="warnMsg" style={style.msg}>
            <div className="f141">Ooops.</div>
            <div className="f211">{warnMsg}...</div>
          </main>
        );
      } else {
        msg = (
          <main className="warnMsg" style={style.msg}>
            <div className="f141">Ooops.</div>
            <div className="f211">Invalid email or password. <span className="underlined bold">Please try again.</span>
            </div>
          </main>
        );
      }
    } else {
      msg = (
        <main className="info" style={style.msg}>
          <div className="f141">Storj new account.</div>
          <div className="f211">Please create your <span className="underlined bold">Storj account</span></div>
        </main>
      );
    }

    return (
      <div className="background-gradation">
        <header><img className="icon" src={leftWhiteIcon} alt="Goobox"/></header>
        {msg}
        <main style={style.accountInfo}>
          <div>
            <input
              className={emailWarn ? "warn" : ""}
              id="email"
              placeholder="e-mail"
              value={email}
              style={style.input}
              onChange={e => processing || this.setState({email: e.target.value})}
            />
          </div>
          <div>
            <input
              className={passwordWarn ? "warn" : ""}
              id="password"
              type="password"
              placeholder="password"
              value={password}
              style={style.input}
              onChange={e => processing || this.setState({password: e.target.value})}
            />
          </div>
        </main>
        <main style={style.storjLogin}>
          <div style={style.storjLoginText}>
            Already have an account?
          </div>
          <button
            id="login-btn"
            type="button"
            style={style.button}
            onClick={() => processing || onClickLogin()}
          >
            Click here to login
          </button>
        </main>
        <footer>
          <WhiteButton id="back-btn" onClick={() => processing || onClickBack()}>Back </WhiteButton>
          <BlueButton id="next-btn" onClick={this._onClickNext}>Next</BlueButton>
        </footer>
      </div>
    );
  }

}

Registration.propTypes = {
  // If true, showing wait mouse cursor and preventing all actions.
  processing: PropTypes.bool.isRequired,
  onClickLogin: PropTypes.func.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  emailWarn: PropTypes.bool,
  passwordWarn: PropTypes.bool,
  warnMsg: PropTypes.string,
};

Registration.defaultProps = {
  emailWarn: false,
  passwordWarn: false,
  warnMsg: "",
};

export default Registration;
