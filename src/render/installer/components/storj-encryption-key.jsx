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
    display: "table",
    fontSize: "30px",
    textAlign: "left",
    margin: "82px auto 0 auto",
  },
  input: {
    width: "346px",
    height: "27px",
  },
  accountInfo: {
    color: "white",
    fontSize: "30px",
    textAlign: "center",
    marginTop: "35px",
  }
};

export default function StorjEncryptionKey(props) {

  return (
    <div className="background-gradation">
      <header><img className="icon" src={leftWhiteIcon}/></header>
      <main style={style.main}>
        <div className="f141">Storj new account.</div>
        <div className="f211">Please save your <span className="underlined bold">Storj encryption key</span></div>
      </main>
      <main style={style.accountInfo}>
        <div>
          <input id="encryption-key" placeholder="encryption key" readOnly="readonly" style={style.input}
                 value={props.encryptionKey}/>
        </div>
      </main>
      <footer>
        <a className="back-btn" onClick={() => props.onClickBack && props.onClickBack()}>
          <img className="arrow" src={leftArrowImage}/> Back
        </a>
        <a className="next-btn" onClick={() => props.onClickNext && props.onClickNext()}>
          Next <img className="arrow" src={rightArrowImage}/>
        </a>
      </footer>
    </div>
  );

}

StorjEncryptionKey.propTypes = {
  encryptionKey: PropTypes.string.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
};