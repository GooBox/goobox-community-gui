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

import React from "react";
import * as screens from "../../../constants/screens";
import Main from "../../partials/main";

export const EmailConfirmation = () => (
  <Main prev={screens.StorjEncryptionKey} next={screens.StorjLogin}>
    <div className="f141">Storj new account.</div>
    <div className="f211">
      Please confirm your
      <span className="underlined bold">
        Storj account <span className="light">in your email</span>
      </span>
    </div>
  </Main>
);

export default EmailConfirmation;
