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

import * as actions from "../../../../src/render/popup/actions";
import {
  mapDispatchToProps,
  mapStateToProps,
} from "../../../../src/render/popup/containers/status";

describe("Status container", () => {
  describe("mapStateToProps", () => {
    it("passes usedVolume state", () => {
      const volume = 1234;
      expect(mapStateToProps({usedVolume: volume})).toHaveProperty(
        "usedVolume",
        volume
      );
    });

    it("passes totalVolume state", () => {
      const volume = 1234;
      expect(mapStateToProps({totalVolume: volume})).toHaveProperty(
        "totalVolume",
        volume
      );
    });

    it("passes state state", () => {
      const state = "sample state";
      expect(mapStateToProps({state})).toHaveProperty("state", state);
    });

    it("sets wait to style.cursor when disabled is true", () => {
      expect(mapStateToProps({disabled: true})).toHaveProperty(
        "style.cursor",
        "wait"
      );
    });

    it("sets auto to style.cursor when disabled is false", () => {
      expect(mapStateToProps({disabled: false})).toHaveProperty(
        "style.cursor",
        "auto"
      );
    });
  });

  describe("mapDispatchToProps", () => {
    const dispatch = jest.fn();
    beforeEach(() => {
      dispatch.mockReset();
    });

    it("maps onChangeState to change state action", () => {
      const args = "some args";
      mapDispatchToProps(dispatch).onChangeState(args);
      expect(dispatch).toHaveBeenCalledWith(actions.changeState(args));
    });

    it("maps onClickSyncFolder to open sync folder action", () => {
      mapDispatchToProps(dispatch).onClickSyncFolder();
      expect(dispatch).toHaveBeenCalledWith(actions.openSyncFolder());
    });

    it("maps onClickInfo to open about window action", () => {
      mapDispatchToProps(dispatch).onClickInfo();
      expect(dispatch).toHaveBeenCalledWith(actions.openAboutWindow());
    });

    it("maps dispatch of open settings actions to onClickSettings", () => {
      mapDispatchToProps(dispatch).onClickSettings();
      expect(dispatch).toHaveBeenCalledWith(actions.openSettings());
    });

    it("maps dispatch of import drive action to onClickImportDrive", () => {
      mapDispatchToProps(dispatch).onClickImportDrive();
      expect(dispatch).toHaveBeenCalledWith(actions.importDrive());
    });
  });
});
