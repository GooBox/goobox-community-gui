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

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import {Synchronizing} from "../../../../constants";

export const RestartBtn = ({onChangeState}) => (
  <button
    className="sync-again-btn btn btn-link"
    type="button"
    onClick={() => onChangeState(Synchronizing)}
  >
    <FontAwesomeIcon className="state-icon" icon={["far", "play-circle"]} />
    &nbsp;
    <span className="state-text">File transfers paused.</span>
  </button>
);

RestartBtn.propTypes = {
  onChangeState: PropTypes.func.isRequired,
};

export default RestartBtn;
