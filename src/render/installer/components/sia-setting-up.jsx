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

import classNames from "classnames";
import PropTypes from "prop-types"
import React from "react";
import LogoColor from "../assets/logo-color.svg";

export const SiaSettingUp = (props) => {

  const barStyle = {
    width: `${props.progress }%`
  };

  return (
    <main
      className={classNames("full-screen full-screen-white d-flex flex-column align-items-center", {"wait": !props.errorMsg})}>
      <img className="mb-5" src={LogoColor} width={110} height={115.2}/>
      <span id="message" className={classNames("mt-4 mb-2", {"text-danger": !!props.errorMsg})}>
        {props.errorMsg || "We’re setting up your Sia wallet…"}
        </span>
      <div className="meter">
        <span className="bar" style={barStyle}/>
      </div>
    </main>
  );

};

SiaSettingUp.propTypes = {
  progress: PropTypes.number.isRequired,
  errorMsg: PropTypes.string,
};

export default SiaSettingUp;