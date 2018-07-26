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

import {push} from "connected-react-router";
import * as actions from "../../../../src/render/installer/actions";
import * as screens from "../../../../src/render/installer/constants/screens";
import {mapDispatchToProps, mapStateToProps} from "../../../../src/render/installer/containers/select-service";

describe("mapStateToProps", () => {

  it("maps processing state", () => {
    const main = {
      processing: true,
    };
    expect(mapStateToProps({main})).toEqual({
      processing: true,
    });
  });

});

describe("mapDispatchToProps", () => {

  const dispatch = jest.fn();
  beforeEach(() => {
    dispatch.mockReset();
  });

  it("maps onSelectStorj to selectStorj and push StorjSelected", () => {
    mapDispatchToProps(dispatch).onSelectStorj();
    expect(dispatch).toHaveBeenCalledWith(actions.selectStorj());
    expect(dispatch).toHaveBeenCalledWith(push(screens.StorjSelected));
  });

  it("maps onSelectSia to selectSia and push SiaSelected", () => {
    mapDispatchToProps(dispatch).onSelectSia();
    expect(dispatch).toHaveBeenCalledWith(actions.selectSia());
    expect(dispatch).toHaveBeenCalledWith(push(screens.SiaSelected));
  });

  it("maps onSelectBoth to selectBoth and push StorjSelected", () => {
    mapDispatchToProps(dispatch).onSelectBoth();
    expect(dispatch).toHaveBeenCalledWith(actions.selectBoth());
    expect(dispatch).toHaveBeenCalledWith(push(screens.StorjSelected));
  });

});

