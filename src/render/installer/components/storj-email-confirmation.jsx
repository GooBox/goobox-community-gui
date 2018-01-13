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

const style = {
  main: {
    color: "white",
    position: "absolute",
    top: "146px",
    fontSize: "30px",
    textAlign: "left",
    width: "600px",
    paddingLeft: "81px",
  }
};

export default function StorjEmailConfirmation(props) {

  return (
    <div className="background-gradation">
      <header><img className="icon" src="../../../../resources/left_white_icon.svg"/></header>
      <main style={style.main}>
        <div className="f141">Storj new account.</div>
        <div className="f211">
          Please confirm your <span className="underlined bold">Storj account <span
          className="light">in your email</span></span>
        </div>
      </main>
      <footer>
        <a className="back-btn" onClick={() => props.onClickBack && props.onClickBack()}>
          <img className="arrow" src="../../../../resources/left_arrow.svg"/> Back
        </a>
        <a className="next-btn" onClick={() => props.onClickLogin && props.onClickLogin()}>
          Login <img className="arrow" src="../../../../resources/right_arrow.svg"/>
        </a>
      </footer>
    </div>
  );

}

StorjEmailConfirmation.propTypes = {
  onClickBack: PropTypes.func.isRequired,
  onClickLogin: PropTypes.func.isRequired,
};