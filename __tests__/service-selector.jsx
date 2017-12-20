/*
 * Copyright (C) 2017 Junpei Kawamoto
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
import {shallow} from "enzyme";
import ServiceSelector from "../src/service-selector.jsx";

describe("ServiceSelector component", ()=>{

    it("doesn't have background-gradation class", () => {
        const wrapper = shallow(<ServiceSelector/>);
        expect(wrapper.hasClass("background-gradation")).toBeFalsy();
    });

    it("has a link to choose Storj", () => {
        const fn = jest.fn();
        const wrapper = shallow(<ServiceSelector onSelectStorj={fn}/>);

        const link = wrapper.find(".option-storj");
        expect(link.exists()).toBeTruthy();

        link.simulate("click");
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("has a link to choose Sia", () => {
        const fn = jest.fn();
        const wrapper = shallow(<ServiceSelector onSelectSia={fn}/>);

        const link = wrapper.find(".option-sia");
        expect(link.exists()).toBeTruthy();

        link.simulate("click");
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("has a link to choose Storj", () => {
        const fn = jest.fn();
        const wrapper = shallow(<ServiceSelector onSelectBoth={fn}/>);

        const link = wrapper.find(".option-both");
        expect(link.exists()).toBeTruthy();

        link.simulate("click");
        expect(fn).toHaveBeenCalledTimes(1);
    });

});