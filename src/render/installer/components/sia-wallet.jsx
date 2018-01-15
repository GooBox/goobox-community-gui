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
  wallet: {
    marginTop: "24px",
    marginBottom: "0",
    height: "27px",
    width: "466px",
    color: "#7f7f7f",
  },
  address: {
    marginTop: "22px",
    color: "white",
    fontSize: "30px",
    width: "600px",
    paddingLeft: "75px",
    textAlign: "left",
  },
  seed: {
    marginTop: "47px",
    color: "white",
    fontSize: "30px",
    width: "600px",
    paddingLeft: "75px",
    textAlign: "left",
    cursor: "text",
  },
  seedValue: {
    display: "block",
    marginTop: "24px",
    marginBottom: "0",
    height: "39px",
    width: "466px",
    fontSize: "7px",
    color: "#7f7f7f",
    backgroundColor: "white",
    borderRadius: "5px",
    padding: "8px",
  },
};


export default function SiaWallet(props) {

  return (
    <div className="background-gradation">
      <header><img className="icon" src={leftWhiteIcon}/></header>
      <main className="left address" style={style.address}>
        <div className="f141">Sia installation.</div>
        <div className="f211">
          Please save your <span className="underlined bold">Sia wallet address</span>.
        </div>
        <input id="wallet" type="text" readOnly="readonly" value={props.address} style={style.wallet}/>
      </main>
      <main className="seed" style={style.seed}>
        <div className="f211">
          And your <span className="underlined bold">Sia seed</span>.
        </div>
        <p id="seed" className="text" style={style.seedValue}>{props.seed}</p>
      </main>
      <footer>
        <a className="back-btn" onClick={props.onClickBack}>
          <img className="arrow" src={leftArrowImage}/> Back
        </a>
        <a className="next-btn" onClick={props.onClickNext}>
          Next <img className="arrow" src={rightArrowImage}/>
        </a>
      </footer>
    </div>
  );

}

SiaWallet.propTypes = {
  address: PropTypes.string.isRequired,
  seed: PropTypes.string.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
};