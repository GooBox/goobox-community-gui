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

import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Logo from "../../assets/logo.svg";
import ProgressBar from "../progress-bar";

export const Preparation = ({progress, errorMsg}) => (
  <main className={classNames("full-screen d-flex flex-column align-items-center", {"wait": !errorMsg})}>
    <img className="mb-3" src={Logo} width={110} height={115.2} alt="Goobox"/>
    <h1 className="mb-auto">
      The safest place to store your files
    </h1>
    <span id="message" className={classNames("mb-2", {"text-warning": !!errorMsg})}>
      {errorMsg || "Getting some tools…"}
    </span>
    <ProgressBar progress={progress}/>
  </main>
);

Preparation.propTypes = {
  progress: PropTypes.number.isRequired,
  errorMsg: PropTypes.string,
};

Preparation.defaultProps = {
  errorMsg: "",
};

export default Preparation;
