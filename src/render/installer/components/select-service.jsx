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
import siaLogo from "../assets/sia_logo.svg";
import storjAndSiaLogo from "../assets/storj_and_sia_logo.svg";
import storjLogo from "../assets/storj_logo.svg";
import Sidebar from "./sidebar";

const style = {
  button: {
    width: "131.5px",
    height: "131.5px",
    objectFit: "contain",
    borderRadius: "5px",
    border: "solid 1px #dddddd",
    padding: 0,
  },
  //
  // Currently, Goobox only supports Storj or Sia.
  //
  disabledButton: {
    display: "none",
  },
};

const buttonClassName = "btn btn-outline-light mr-2";

export const SelectService = (props) => {

  return (
    <div className="clearfix">
      <Sidebar className="float-left"/>
      <main className="float-right">
        <h1>Let’s get started</h1>
        <p>Please choose your cloud service</p>
        <div className="d-flex">
          <button id="option-storj" type="button" className={buttonClassName} style={style.button}
                  onClick={() => props.processing || props.onSelectStorj()}>
            <img src={storjLogo} width={64.7} height={93.2}/>
          </button>
          <button id="option-sia" type="button" className={buttonClassName} style={style.button}
                  onClick={() => props.processing || props.onSelectSia()}>
            <img src={siaLogo} width={94} height={59}/>
          </button>
          <button id="option-both" type="button" className={buttonClassName} style={style.disabledButton}
                  onClick={() => props.processing || props.onSelectBoth()}>
            <img src={storjAndSiaLogo} width={140} height={68}/>
          </button>
        </div>
      </main>
    </div>
  );

};

SelectService.propTypes = {
  // If true, showing wait mouse cursor and preventing all actions.
  processing: PropTypes.bool.isRequired,
  onSelectStorj: PropTypes.func.isRequired,
  onSelectSia: PropTypes.func.isRequired,
  onSelectBoth: PropTypes.func.isRequired
};

export default SelectService;