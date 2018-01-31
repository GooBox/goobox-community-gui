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

import {mapStateToProps} from "../../../../src/render/installer/containers/preparation";

describe("mapStateToProps", () => {

  it("maps progress state", () => {
    const progress = 11;
    const errorMsg = "expected error";
    expect(mapStateToProps({
      main: {
        progress: progress,
        errorMsg: errorMsg,
      }
    })).toEqual({
      progress: progress,
      errorMsg: errorMsg,
    });
  });

});

