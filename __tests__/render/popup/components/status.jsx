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

import {shallow} from "enzyme";
import React from "react";
import {Paused, Synchronizing} from "../../../../src/constants";
import {Footer} from "../../../../src/render/popup/components/footer";
import {Header} from "../../../../src/render/popup/components/header";
import Status from "../../../../src/render/popup/components/status";

describe("Status component", () => {
  const used = 12.334;
  const total = 30;
  const onChangeState = jest.fn();
  const onClickSettings = jest.fn();
  const onClickInfo = jest.fn();
  const onClickSyncFolder = jest.fn();
  const onClickImportDrive = jest.fn();

  let wrapper;
  beforeEach(() => {
    onChangeState.mockClear();
    onClickInfo.mockClear();
    onClickSettings.mockClear();
    onClickSyncFolder.mockClear();
    wrapper = shallow(
      <Status
        usedVolume={used}
        totalVolume={total}
        state={Synchronizing}
        onChangeState={onChangeState}
        onClickSettings={onClickSettings}
        onClickInfo={onClickInfo}
        onClickSyncFolder={onClickSyncFolder}
        onClickImportDrive={onClickImportDrive}
      />
    );
  });

  it("has a header", () => {
    const header = wrapper.find(Header);
    expect(header.exists()).toBeTruthy();
    header.prop("onClickSettings")();
    expect(onClickSettings).toHaveBeenCalledTimes(1);
    header.prop("onClickInfo")();
    expect(onClickInfo).toHaveBeenCalledTimes(1);
  });

  it("has a sync folder button", () => {
    const folder = wrapper.find(".sync-folder");
    expect(folder.exists()).toBeTruthy();

    folder.simulate("click");
    expect(onClickSyncFolder).toHaveBeenCalledTimes(1);
  });

  // it("has an import drive button", () => {
  //   const fn = jest.fn();
  //   const wrapper = shallow(<Status onClickImportDrive={fn}/>);
  //   const drive = wrapper.find(".import-drive");
  //   expect(drive.exists()).toBeTruthy();
  //
  //   drive.simulate("click");
  //   expect(fn).toHaveBeenCalledTimes(1);
  // });

  it("has a footer", () => {
    const footer = wrapper.find(Footer);
    expect(footer.exists()).toBeTruthy();
    expect(footer.prop("usedVolume")).toEqual(used);
    expect(footer.prop("totalVolume")).toEqual(total);
    expect(footer.prop("state")).toEqual(Synchronizing);

    footer.prop("onChangeState")(Paused);
    expect(onChangeState).toHaveBeenCalledWith(Paused);
  });
});
