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
import os from "os";
import PropTypes from "prop-types";
import React from "react";
import {Link} from "react-router-dom";
import styled from "styled-components";
import siaLogo from "../../assets/sia_logo.svg";
import storjAndSiaLogo from "../../assets/storj_and_sia_logo.svg";
import storjLogo from "../../assets/storj_logo.svg";
import * as screens from "../../constants/screens";
import Main from "../partials/main";

export const ServiceButton = styled(Link).attrs({
  className:
    "d-flex btn btn-outline-light mr-2 justify-content-center align-items-center",
  role: "button",
})`
  width: 131.5px !important;
  height: 131.5px !important;
  object-fit: contain !important;
  border-radius: 5px !important;
  border: solid 1px #dddddd !important;
`;

export const SelectService = ({
  processing,
  onSelectStorj,
  onSelectSia,
  onSelectBoth,
}) => (
  <Main processing={processing}>
    <h1>Let’s get started</h1>
    <p>Please choose your cloud service</p>
    <div className="d-flex">
      <div className={classNames({"d-none": os.type() === "Linux"})}>
        <ServiceButton
          id="option-storj"
          to={screens.StorjSelected}
          onClick={() => processing || onSelectStorj()}
        >
          <img src={storjLogo} width={64.7} height={93.2} alt="Storj" />
        </ServiceButton>
      </div>
      <ServiceButton
        id="option-sia"
        to={screens.SiaSelected}
        onClick={() => processing || onSelectSia()}
      >
        <img src={siaLogo} width={94} height={59} alt="Sia" />
      </ServiceButton>
      {/* Goobox only supports either Storj or Sia currently */}
      <div style={{display: "none"}}>
        <ServiceButton
          id="option-both"
          to={screens.StorjSelected}
          onClick={() => processing || onSelectBoth()}
        >
          <img
            src={storjAndSiaLogo}
            width={140}
            height={68}
            alt="Storj and Sia"
          />
        </ServiceButton>
      </div>
      {/* End */}
    </div>
  </Main>
);

SelectService.propTypes = {
  // If true, showing wait mouse cursor and preventing all actions.
  processing: PropTypes.bool,
  onSelectStorj: PropTypes.func.isRequired,
  onSelectSia: PropTypes.func.isRequired,
  onSelectBoth: PropTypes.func.isRequired,
};

SelectService.defaultProps = {
  processing: false,
};

export default SelectService;
