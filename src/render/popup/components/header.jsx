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
import GooboxImage from "../assets/goobox.svg";

export const Header = ({onClickSettings, onClickInfo}) => (

  <nav className="d-flex align-items-center px-3 py-2">
    <img className="mr-auto" src={GooboxImage} width={81} height={22} alt="Goobox"/>
    <button id="info-btn" className="btn btn-link" type="button" onClick={() => onClickInfo()}>
      <i className="fas fa-info-circle"/>
    </button>
    <button id="settings-btn" className="ml-4 btn btn-link" type="button" onClick={() => onClickSettings()}>
      <i className="fas fa-cog"/>
    </button>
  </nav>

);

Header.propTypes = {
  onClickSettings: PropTypes.func.isRequired,
  onClickInfo: PropTypes.func.isRequired,
};

export default Header;
