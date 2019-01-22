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

import {shallow} from "enzyme";
import React from "react";
import Logo from "../../../../../src/render/installer/assets/logo.svg";
import Sidebar from "../../../../../src/render/installer/components/partials/sidebar";

describe("Sidebar component", () => {
  const wrapper = shallow(<Sidebar />);
  it("has the logo", () => {
    expect(wrapper.find("img").prop("src")).toEqual(Logo);
  });
});
