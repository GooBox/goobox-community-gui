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

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import {Paused, Synchronizing} from "../../../constants";

const PauseBtn = ({onChangeState}) => (
  <a className="pause-sync-btn" onClick={() => onChangeState(Paused)}>
    <FontAwesomeIcon className="state-icon" icon={["far", "pause-circle"]}/>
    &nbsp;
    <span className="state-text">Goobox is up to date.</span>
  </a>
);

PauseBtn.propTypes = {
  onChangeState: PropTypes.func.isRequired,
};

const RestartBtn = ({onChangeState}) => (
  <a className="sync-again-btn" onClick={() => onChangeState(Synchronizing)}>
    <FontAwesomeIcon className="state-icon" icon={["far", "play-circle"]}/>
    &nbsp;
    <span className="state-text">File transfers paused.</span>
  </a>
);

RestartBtn.propTypes = {
  onChangeState: PropTypes.func.isRequired,
};

export const Footer = ({state, totalVolume, usedVolume, onChangeState}) => (
  <footer className="d-flex px-3 py-2 mt-auto">
    {state === Synchronizing ? <PauseBtn onChangeState={onChangeState}/> : <RestartBtn onChangeState={onChangeState}/>}
    <span className="usage-rate ml-auto">
      Using {Math.round(usedVolume / totalVolume * 100)}% of {totalVolume}GB
    </span>
  </footer>
);

Footer.propTypes = {
  usedVolume: PropTypes.number.isRequired,
  totalVolume: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired,
  onChangeState: PropTypes.func.isRequired,
};

export default Footer
