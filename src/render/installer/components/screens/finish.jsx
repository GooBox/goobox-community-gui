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
import styled from "styled-components";
import Logo from "../../assets/logo.svg";
import {WhiteButton} from "../buttons";

export const FinishButton = styled(WhiteButton)`
  color: #26aae1;
`;

export const Finish = ({header, message, onClick}) => (
  <main className="full-screen d-flex flex-column justify-content-between align-items-center">
    <img className="mb-3" src={Logo} width={110} height={115.2} alt="Goobox" />
    <h1>{header}</h1>
    <p>{message}</p>
    <FinishButton type="button" onClick={onClick}>
      Open my Goobox
    </FinishButton>
  </main>
);

Finish.propTypes = {
  header: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Finish;
