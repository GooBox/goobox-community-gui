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

import {remote} from "electron";
import {shallow} from "enzyme";
import React from "react";
import {Sia, Storj} from "../../../../src/constants";
import SelectFolder from "../../../../src/render/installer/components/select-folder";

const dialog = remote.dialog;

describe("SelectFolder component", () => {

  const defaultDir = "/home/someone/Goobox";
  let wrapper, back, next, selectFolder;
  beforeEach(() => {
    back = jest.fn();
    next = jest.fn();
    selectFolder = jest.fn();
    wrapper = shallow(
      <SelectFolder
        storj
        sia={false}
        folder={defaultDir}
        onClickBack={back}
        onClickNext={next}
        onSelectFolder={selectFolder}
      />);
  });

  it("takes flags of used services and shows the name of them", () => {
    wrapper = shallow(
      <SelectFolder
        storj
        sia={false}
        folder={defaultDir}
        onClickBack={back}
        onClickNext={next}
        onSelectFolder={selectFolder}
      />);
    expect(wrapper.find("h1").text()).toContain(Storj);

    wrapper = shallow(
      <SelectFolder
        storj={false}
        sia
        folder={defaultDir}
        onClickBack={back}
        onClickNext={next}
        onSelectFolder={selectFolder}
      />);
    expect(wrapper.find("h1").text()).toContain(Sia);

    wrapper = shallow(
      <SelectFolder
        storj
        sia
        folder={defaultDir}
        onClickBack={back}
        onClickNext={next}
        onSelectFolder={selectFolder}
      />);
    expect(wrapper.find("h1").text()).toContain(`${Storj} & ${Sia}`);
  });

  it("shows current selected folder", () => {
    const c = wrapper.find("#folder");
    expect(c.exists()).toBeTruthy();
    expect(c.prop("value")).toEqual(defaultDir);
  });

  it("has a back link", () => {
    const link = wrapper.find("#back-btn");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("disables the back link while a dialog is open", () => {
    wrapper.instance().selecting = true;
    const link = wrapper.find("#back-btn");
    link.simulate("click");
    expect(back).not.toHaveBeenCalled();
  });

  it("disables other actions after the back link is clicked", () => {
    const link = wrapper.find("#back-btn");
    link.simulate("click");
    expect(wrapper.state("disabled")).toBeTruthy();
    expect(back).toHaveBeenCalled();
  });

  it("disables the back link when the disabled state is true", () => {
    wrapper.setState({disabled: true});
    const link = wrapper.find("#back-btn");
    link.simulate("click");
    expect(back).not.toHaveBeenCalled();
  });

  it("has a next link", () => {
    const link = wrapper.find("#next-btn");
    expect(link.exists()).toBeTruthy();
    link.simulate("click");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("disables the next link while a dialog is open", () => {
    wrapper.instance().selecting = true;
    const link = wrapper.find("#next-btn");
    link.simulate("click");
    expect(next).not.toHaveBeenCalled();
  });

  it("disables other actions after the next link is clicked", () => {
    const link = wrapper.find("#next-btn");
    link.simulate("click");
    expect(wrapper.state("disabled")).toBeTruthy();
    expect(next).toHaveBeenCalled();
  });

  it("disables the nect link when disabled state is true", () => {
    wrapper.setState({disabled: true});
    const link = wrapper.find("#next-btn");
    link.simulate("click");
    expect(next).not.toHaveBeenCalled();
  });

  it("has a button to open a dialog", () => {
    wrapper.instance()._onClickBrowse = jest.fn().mockReturnValue(Promise.resolve());
    wrapper.find("#change-folder-btn").prop("onClick")();
    expect(wrapper.instance()._onClickBrowse).toHaveBeenCalled();
  });

  it("disabled the open dialog button when disabled state is true", async () => {
    wrapper.setState({disabled: true});
    await expect(wrapper.instance()._onClickBrowse()).rejects.toBeDefined();
  });

  describe("_onClickBrowse", () => {

    beforeEach(() => {
      dialog.showOpenDialog.mockClear();
    });

    it("shows a dialog with showOpenDialog and notifies chosen folder via onSelectFolder", async () => {
      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback([defaultDir]);
      });
      await wrapper.instance()._onClickBrowse();
      expect(selectFolder).toHaveBeenCalledWith(defaultDir);
      expect(dialog.showOpenDialog).toHaveBeenCalledWith(null, {
        defaultPath: defaultDir,
        properties: ["openDirectory", "createDirectory"]
      }, expect.any(Function));
    });

    it("shows a dialog and does nothing if the dialog is canceled", async () => {
      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback(undefined);
      });
      await wrapper.instance()._onClickBrowse();
      expect(selectFolder).not.toHaveBeenCalled();
      expect(dialog.showOpenDialog).toHaveBeenCalledWith(null, {
        defaultPath: defaultDir,
        properties: ["openDirectory", "createDirectory"]
      }, expect.any(Function));
    });

    it("disables all buttons on the screen until the dialog is closed", async () => {
      dialog.showOpenDialog.mockImplementation((window, opts, cb) => {
        expect(wrapper.instance().selecting).toBeTruthy();
        cb(null);
      });
      expect(wrapper.instance().selecting).toBeFalsy();
      await wrapper.instance()._onClickBrowse();
      expect(wrapper.instance().selecting).toBeFalsy();
    });

    it("is disabled if another dialog is already open", async () => {
      wrapper.instance().selecting = true;
      await expect(wrapper.instance()._onClickBrowse()).rejects.toBeDefined();
    });

    it("removes trailing back slashes in chosen paths", async () => {
      const dir = "F:";
      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback([`${dir}\\`]);
      });
      await wrapper.instance()._onClickBrowse();
      expect(selectFolder).toHaveBeenCalledWith(dir);
      expect(dialog.showOpenDialog).toHaveBeenCalledWith(null, {
        defaultPath: defaultDir,
        properties: ["openDirectory", "createDirectory"]
      }, expect.any(Function));
    });

  });

});
