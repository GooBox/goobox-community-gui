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
    top: "176px",
    fontSize: "30px",
    textAlign: "left",
    width: "600px",
    paddingLeft: "158px",
  },
};

export default class Finish extends React.Component {

  render() {
    return (
      <div className="background-gradation">
        <header><img className="icon" src="../resources/left_white_icon.svg"/></header>
        <main style={style.main}>
          <div className="f141">You're ready to go!</div>
          <div className="f211">Thank you for trying <span className="underlined bold">Goobox!</span></div>
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

Finish.propTypes = {
  onClickBack: PropTypes.func,
  onClickClose: PropTypes.func,
};