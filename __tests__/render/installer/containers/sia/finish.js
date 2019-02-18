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

import * as actions from "../../../../../src/render/installer/actions";
import {
  mapDispatchToProps,
  mapStateToProps,
} from "../../../../../src/render/installer/containers/sia/finish";

describe("mapStateToProps", () => {
  it("set messages", () => {
    expect(mapStateToProps()).toEqual({
      header: "We’re preparing your Goobox",
      message: "We will notify you when we’re done.",
    });
  });
});

describe("mapDispatchToProps", () => {
  const dispatch = jest.fn();
  beforeEach(() => {
    dispatch.mockReset();
  });

  it("maps onClick to openSyncFolder action", () => {
    mapDispatchToProps(dispatch).onClick();
    expect(dispatch).toHaveBeenCalledWith(actions.closeWindow());
  });
});
