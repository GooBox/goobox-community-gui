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
import {Synchronizing} from "../../../constants";
import {PauseBtn, RestartBtn} from "./buttons";

export const Footer = ({state, totalVolume, usedVolume, onChangeState}) => (
  <footer className="d-flex px-3 py-2 mt-auto">
    {state === Synchronizing ? (
      <PauseBtn onChangeState={onChangeState} />
    ) : (
      <RestartBtn onChangeState={onChangeState} />
    )}
    <span className="usage-rate ml-auto">
      Using {Math.round((usedVolume / totalVolume) * 100)}% of {totalVolume}GB
    </span>
  </footer>
);

Footer.propTypes = {
  usedVolume: PropTypes.number.isRequired,
  totalVolume: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired,
  onChangeState: PropTypes.func.isRequired,
};

export default Footer;
