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
import {remote} from "electron";
import {shallow} from "enzyme";
import SelectFolder from "../src/select-folder.jsx";

const dialog = remote.dialog;

describe("SelectFolder component", () => {

  it("has background-gradation class", () => {
    const wrapper = shallow(<SelectFolder/>);
    expect(wrapper.hasClass("background-gradation")).toBeTruthy();
  });

  it("takes a name of service and shows it", () => {
    const service = "Storj or SIA";
    const wrapper = shallow(<SelectFolder service={service}/>);

    const place = wrapper.find(".service-name");
    expect(place.exists()).toBeTruthy();
    expect(place.text()).toEqual(service);
  });

  it("has a back link", () => {
    const fn = jest.fn();
    const wrapper = shallow(<SelectFolder onClickBack={fn}/>);

    const link = wrapper.find(".back-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("disables the back link while a dialog is open", () => {
    const fn = jest.fn();
    const wrapper = shallow(<SelectFolder onClickBack={fn}/>);
    wrapper.instance().selecting = true;

    const link = wrapper.find(".back-btn");
    link.simulate("click");
    expect(fn).not.toHaveBeenCalled();
  });

  it("has a next link", () => {
    const fn = jest.fn();
    const wrapper = shallow(<SelectFolder onClickNext={fn}/>);

    const link = wrapper.find(".next-btn");
    expect(link.exists()).toBeTruthy();

    link.simulate("click");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("disables the next link while a dialog is open", () => {
    const fn = jest.fn();
    const wrapper = shallow(<SelectFolder onClickNext={fn}/>);
    wrapper.instance().selecting = true;

    const link = wrapper.find(".next-btn");
    link.simulate("click");
    expect(fn).not.toHaveBeenCalled();
  });

  it("has a button to open a dialog", () => {
    const wrapper = shallow(<SelectFolder/>);
    expect(wrapper.find("button").prop("onClick")).toBe(wrapper.instance()._onClickBrowse);
  });

  describe("_onClickBrowse", () => {

    beforeEach(() => {
      dialog.showOpenDialog.mockClear();
    });

    it("shows a dialog with showOpenDialog and notifies chosen folder via onSelectFolder", () => {

      const sampleDir = "/home/someone/Goobox";
      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback([sampleDir]);
      });

      const fn = jest.fn();
      const wrapper = shallow(<SelectFolder onSelectFolder={fn}/>);

      return wrapper.instance()._onClickBrowse().then(() => {
        expect(fn).toHaveBeenCalledWith(sampleDir);
        expect(dialog.showOpenDialog).toHaveBeenCalledWith(null, {
          properties: ["openDirectory"]
        }, expect.any(Function));
      });

    });

    it("shows a dialog with a given default value", () => {

      const defaultDir = "/home/someone/Goobox";
      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback([defaultDir]);
      });

      const fn = jest.fn();
      const wrapper = shallow(<SelectFolder folder={defaultDir} onSelectFolder={fn}/>);

      return wrapper.instance()._onClickBrowse().then(() => {
        expect(fn).toHaveBeenCalledWith(defaultDir);
        expect(dialog.showOpenDialog).toHaveBeenCalledWith(null, {
          defaultPath: defaultDir,
          properties: ["openDirectory"]
        }, expect.any(Function));
      });

    });

    it("shows a dialog and does nothing if the dialog is canceled", () => {

      dialog.showOpenDialog.mockImplementation((window, opts, callback) => {
        callback(undefined);
      });

      const fn = jest.fn();
      const wrapper = shallow(<SelectFolder onSelectFolder={fn}/>);

      return wrapper.instance()._onClickBrowse().then(() => {
        expect(fn).not.toHaveBeenCalled();
        expect(dialog.showOpenDialog).toHaveBeenCalledWith(null, {
          properties: ["openDirectory"]
        }, expect.any(Function));
      });

    });

    it("disables all buttons on the screen until the dialog is closed", () => {

      const wrapper = shallow(<SelectFolder/>);
      dialog.showOpenDialog.mockImplementation((window, opts, cb) => {
        expect(wrapper.instance().selecting).toBeTruthy();
        cb(null);
      });

      expect(wrapper.instance().selecting).toBeFalsy();
      return wrapper.instance()._onClickBrowse().then(() => {
        expect(wrapper.instance().selecting).toBeFalsy();
      })

    });

    it("is disabled if another dialog is already open", () => {

      const wrapper = shallow(<SelectFolder/>);
      wrapper.instance().selecting = true;

      return wrapper.instance()._onClickBrowse().catch((e) => {
        expect(e).toBeDefined();
      });

    });

  });

});