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
    top: "181px",
    fontSize: "30px",
    textAlign: "center",
    width: "600px"
  }
};

export default class Welcome extends React.Component {

  render() {
    return (
      <div className="background-gradation">
        <header><img src="../resources/left_white_icon.svg" width="41px" height="40px"/></header>
        <main style={style.main}>
          <span>Welcome to</span> <span className="underlined bold">Goobox</span>
        </main>
        <footer>
          <a className="next-btn" onClick={() => this.props.onClickNext && this.props.onClickNext()}>
            Next <img className="arrow" src="../resources/right_arrow.svg"/>
          </a>
        </footer>
      </div>
    );
  }

}

Welcome.propTypes = {
  onClickNext: PropTypes.func
};