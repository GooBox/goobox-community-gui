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
    top: "146px",
    fontSize: "30px",
    textAlign: "left",
    width: "600px",
    paddingLeft: "158px",
  },
  additionalInfo: {
    position: "absolute",
    top: "273px",
    paddingRight: "159px",
    fontSize: "9px",
    color: "white",
    textAlign: "center",
    width: "600px",
    paddingLeft: "158px",
  },
};


export default class SiaFinish extends React.Component {

  render() {
    return (
      <div className="background-gradation">
        <header><img className="icon" src="../resources/left_white_icon.svg"/></header>
        <main style={style.main}>
          <div className="f141">SIA installation.</div>
          <div className="f211">
            We're preparing your account...<br/>
            It can take up to <span className="underlined bold">2 hours</span>.
          </div>
        </main>
        <main style={style.additionalInfo}>
          You can close this window.
        </main>
        <footer>
          <a className="back-btn" onClick={() => this.props.onClickBack && this.props.onClickBack()}>
            <img className="arrow" src="../resources/left_arrow.svg"/> Back
          </a>
          <a className="next-btn" onClick={() => this.props.onClickClose && this.props.onClickClose()}>
            Close
          </a>
        </footer>
      </div>
    );
  }

}

SiaFinish.propTypes = {
  onClickBack: PropTypes.func,
  onClickClose: PropTypes.func,
};