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

import {remote} from "electron";
import {mount, shallow} from "enzyme";
import React from "react";
import {StaticRouter} from "react-router";
import {Sia, Storj} from "../../../../src/constants";
import {Main} from "../../../../src/render/installer/components/partials/main";
import SelectFolder, {ReadOnlyInputBox, ServiceNames} from "../../../../src/render/installer/components/select-folder";
import {SiaSelected} from "../../../../src/render/installer/constants/screens";

const dialog = remote.dialog;

describe("ServiceNames component", () => {

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<ServiceNames storj/>);
  });

  it("shows Storj is storj is true", () => {
    const text = wrapper.text();
    expect(text).toContain(Storj);
    expect(text).not.toContain(Sia);
  });

  it("shows Sia is sia is true", () => {
    wrapper.setProps({storj: false, sia: true});
    const text = wrapper.text();
    expect(text).not.toContain(Storj);
    expect(text).toContain(Sia);
  });

  it("shows both Storj and Sia is storj and sia are true", () => {
    wrapper.setProps({storj: true, sia: true});
    const text = wrapper.text();
    expect(text).toContain(Storj);
    expect(text).toContain(Sia);
  });

});

describe("SelectFolder component", () => {

  const defaultDir = "/home/someone/Goobox";
  const prev = "prev-screen";
  const next = "next-screen";
  const onClickBack = jest.fn();
  const onClickNext = jest.fn();
  const selectFolder = jest.fn();

  let _onClickBrowse;
  beforeAll(() => {
    _onClickBrowse = jest.spyOn(SelectFolder.prototype, "_onClickBrowse");
  });

  afterAll(() => {
    _onClickBrowse.mockRestore();
  });

  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = mount(
      <StaticRouter location={SiaSelected} context={{}}>
        <SelectFolder
          storj
          folder={defaultDir}
          next={next}
          prev={prev}
          onClickBack={onClickBack}
          onClickNext={onClickNext}
          onSelectFolder={selectFolder}
        />
      </StaticRouter>
    );
  });

  it("renders Main component", () => {
    const c = wrapper.find(Main);
    expect(c.prop("next")).toEqual(next);
    expect(c.prop("prev")).toEqual(prev);
    expect(c.prop("onClickNext")).toEqual(onClickNext);
    expect(c.prop("onClickPrev")).toEqual(onClickBack);
  });

  it("renders ServiceName component", () => {
    const c = wrapper.find(ServiceNames);
    expect(c.prop("storj")).toBeTruthy();
    expect(c.prop("sia")).toBeFalsy();
  });

  it("shows current selected folder", () => {
    const c = wrapper.find(ReadOnlyInputBox).filter("#folder");
    expect(c.exists()).toBeTruthy();
    expect(c.prop("value")).toEqual(defaultDir);
  });

  it("has a button to open a dialog", () => {
    _onClickBrowse.mockReturnValueOnce(Promise.resolve());
    wrapper.find("#change-folder-btn").prop("onClick")();
    expect(_onClickBrowse).toHaveBeenCalled();
  });

  describe("_onClickBrowse", () => {

    it("shows a dialog with showOpenDialog and notifies chosen folder via onSelectFolder", async () => {
      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback([defaultDir]);
      });
      await wrapper.find(SelectFolder).instance()._onClickBrowse();
      expect(selectFolder).toHaveBeenCalledWith(defaultDir);
      expect(dialog.showOpenDialog).toHaveBeenCalledWith("getCurrentWindow", {
        defaultPath: defaultDir,
        properties: ["openDirectory", "createDirectory"]
      }, expect.any(Function));
      expect(remote.getCurrentWindow).toHaveBeenCalledTimes(1);
    });

    it("shows a dialog and does nothing if the dialog is canceled", async () => {
      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback(undefined);
      });
      await wrapper.find(SelectFolder).instance()._onClickBrowse();
      expect(selectFolder).not.toHaveBeenCalled();
      expect(dialog.showOpenDialog).toHaveBeenCalledWith("getCurrentWindow", {
        defaultPath: defaultDir,
        properties: ["openDirectory", "createDirectory"]
      }, expect.any(Function));
      expect(remote.getCurrentWindow).toHaveBeenCalledTimes(1);
    });

    it("removes trailing back slashes in chosen paths", async () => {
      const dir = "F:";
      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback([`${dir}\\`]);
      });
      await wrapper.find(SelectFolder).instance()._onClickBrowse();
      expect(selectFolder).toHaveBeenCalledWith(dir);
      expect(dialog.showOpenDialog).toHaveBeenCalledWith("getCurrentWindow", {
        defaultPath: defaultDir,
        properties: ["openDirectory", "createDirectory"]
      }, expect.any(Function));
      expect(remote.getCurrentWindow).toHaveBeenCalledTimes(1);
    });

  });

});
