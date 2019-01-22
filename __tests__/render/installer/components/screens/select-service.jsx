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

import {mount} from "enzyme";
import React from "react";
import {StaticRouter} from "react-router";
import {Main} from "../../../../../src/render/installer/components/partials/main";
import SelectService, {ServiceButton} from "../../../../../src/render/installer/components/screens/select-service";
import * as screens from "../../../../../src/render/installer/constants/screens";

describe("SelectService component", () => {

  const onSelectStorj = jest.fn();
  const onSelectSia = jest.fn();
  const onSelectBoth = jest.fn();
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = mount(
      <StaticRouter location={screens.ChooseCloudService} context={{}}>
        <SelectService onSelectStorj={onSelectStorj} onSelectSia={onSelectSia} onSelectBoth={onSelectBoth}/>
      </StaticRouter>
    );
  });

  it("renders Main component", () => {
    const c = wrapper.find(Main);
    expect(c.prop("processing")).toBeFalsy();
  });

  it("has a link to choose Storj", () => {
    const link = wrapper.find(ServiceButton).filter("#option-storj");
    expect(link.prop("to")).toEqual(screens.StorjSelected);
    link.prop("onClick")();
    expect(onSelectStorj).toHaveBeenCalled();
  });

  it.skip("prevents the storj button when processing is true", () => {
    wrapper.setProps({processing: true});
    const link = wrapper.find(ServiceButton).filter("#option-storj");
    link.prop("onClick")();
    expect(onSelectStorj).not.toHaveBeenCalled();
  });

  it("has a link to choose sia", () => {
    const link = wrapper.find(ServiceButton).filter("#option-sia");
    expect(link.prop("to")).toEqual(screens.SiaSelected);
    link.prop("onClick")();
    expect(onSelectSia).toHaveBeenCalled();
  });

  it.skip("prevents the sia button when processing is true", () => {
    wrapper.setProps({processing: true});
    const link = wrapper.find(ServiceButton).filter("#option-sia");
    link.prop("onClick")();
    expect(onSelectSia).not.toHaveBeenCalled();
  });

  it("has a link to choose both storj and sia", () => {
    const link = wrapper.find(ServiceButton).filter("#option-both");
    expect(link.prop("to")).toEqual(screens.StorjSelected);
    link.prop("onClick")();
    expect(onSelectBoth).toHaveBeenCalled();
  });

  it.skip("prevents the storj and sia button when processing is true", () => {
    wrapper.setProps({processing: true});
    const link = wrapper.find(ServiceButton).filter("#option-both");
    link.prop("onClick")();
    expect(onSelectBoth).not.toHaveBeenCalled();
  });

});
