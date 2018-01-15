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

export default function Finish(props) {

  return (
    <div className="background-gradation">
      <header><img className="icon" src={leftWhiteIcon}/></header>
      <main style={style.main}>
        <div className="f141">You're ready to go!</div>
        <div className="f211">Thank you for trying <span className="underlined bold">Goobox!</span></div>
      </main>
      <footer>
        <a className="back-btn" onClick={props.onClickBack}>
          <img className="arrow" src={leftArrowImage}/> Back
        </a>
        <a className="next-btn" onClick={props.onClickClose}>
          Close
        </a>
      </footer>
    </div>
  );

}

Finish.propTypes = {
  onClickBack: PropTypes.func.isRequired,
  onClickClose: PropTypes.func.isRequired,
};