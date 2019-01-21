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
import leftWhiteIcon from "../../assets/left_white_icon.svg";
import {BlueButton, WhiteButton} from "../buttons";

const style = {
  main: {
    color: "white",
    display: "table",
    fontSize: "30px",
    textAlign: "left",
    margin: "82px auto 0 auto",
  }
};

export const EmailConfirmation = ({onClickBack, onClickNext}) => (
  <div className="background-gradation">
    <header>
      <img className="icon" src={leftWhiteIcon} alt="Goobox"/>
    </header>
    <main style={style.main}>
      <div className="f141">Storj new account.</div>
      <div className="f211">
        Please confirm your
        <span className="underlined bold">Storj account <span className="light">in your email</span></span>
      </div>
    </main>
    <footer>
      <WhiteButton id="back-btn" onClick={onClickBack}>Back</WhiteButton>
      <BlueButton id="next-btn" onClick={onClickNext}>Next</BlueButton>
    </footer>
  </div>
);

EmailConfirmation.propTypes = {
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
};

export default EmailConfirmation;
