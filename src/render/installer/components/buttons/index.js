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

import styled from "styled-components";
import CopyButton from "./copy-button";

export const Button = styled.button.attrs({
  type: "button",
})`
  width: 239.1px;
  height: 47.3px;
  border-radius: 3.2px;
  border: solid 0.8px #dddddd;
`;

export const WhiteButton = styled(Button).attrs({
  className: "btn btn-light",
})`
  /* this component doesn't extend styles but attributes */
`;

export const BlueButton = styled(Button).attrs({
  className: "btn btn-primary",
})`
  /* this component doesn't extend styles but attributes */
`;

export {CopyButton};
