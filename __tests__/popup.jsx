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

jest.useFakeTimers();

import React from "react";
import {shallow} from "enzyme";
import path from "path";
import {ipcRenderer} from "electron";
import openAboutWindow from "about-window";

import Popup from "../src/popup.jsx";
import {ChangeStateEvent, OpenSyncFolderEvent, UsedVolumeEvent, Paused, Synchronizing} from "../src/constants";

describe("Popup component", () => {

  beforeEach(() => {
    jest.clearAllTimers();
    setTimeout.mockReset();
  });

  it("has a Status component", () => {
    const wrapper = shallow(<Popup/>);
    expect(wrapper.find("Status").exists()).toBeTruthy();
  });

  it("has a state state to remember the app is synchronizing or paused", () => {
    const state = "paused";
    const wrapper = shallow(<Popup/>);
    wrapper.setState({state: state});
    expect(wrapper.find("Status").prop("state")).toEqual(state);
  });

  it("has state usedVolume and shows this value in Status component", () => {
    const usedVolume = 12345;
    const wrapper = shallow(<Popup/>);
    wrapper.setState({usedVolume: usedVolume});
    expect(wrapper.find("Status").prop("usedVolume")).toEqual(usedVolume);
  });

  it("has state totalVolume and shows this value in Status component", () => {
    const totalVolume = 12345;
    const wrapper = shallow(<Popup/>);
    wrapper.setState({totalVolume: totalVolume});
    expect(wrapper.find("Status").prop("totalVolume")).toEqual(totalVolume);
  });

  it("shows information window if onClickInfo is called", () => {
    const wrapper = shallow(<Popup/>);
    wrapper.find("Status").prop("onClickInfo")();

    expect(openAboutWindow).toHaveBeenCalledWith({
      icon_path: path.join(__dirname, "../resources/goobox.svg"),
      package_json_dir: path.join(__dirname, ".."),
      win_options: {
        resizable: false,
        fullscreenable: false,
        minimizable: false,
        maximizable: false
      }
    });

  });

  describe("with IPC", () => {

    beforeEach(() => {
      ipcRenderer.once.mockReset();
      ipcRenderer.send.mockReset();
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method, arg) => {
          if (listen === method) {
            cb(null, arg);
          }
        });
      });
    });

    it("requests pausing the app via ipc when the state is changed to paused", () => {
      const wrapper = shallow(<Popup/>);
      wrapper.find("Status").prop("onChangeState")(Paused);

      expect(ipcRenderer.once).toHaveBeenCalledWith(ChangeStateEvent, expect.anything());
      expect(ipcRenderer.send).toHaveBeenCalledWith(ChangeStateEvent, Paused);
    });

    it("requests restarting the app via ipc when the state is changed to synchronizing", () => {
      const wrapper = shallow(<Popup/>);
      wrapper.find("Status").prop("onChangeState")(Synchronizing);

      expect(ipcRenderer.once).toHaveBeenCalledWith(ChangeStateEvent, expect.anything());
      expect(ipcRenderer.send).toHaveBeenCalledWith(ChangeStateEvent, Synchronizing);
    });

    it("requests opening sync folder via ipc when onClickSyncFolder is called", () => {
      const wrapper = shallow(<Popup/>);
      wrapper.find("Status").prop("onClickSyncFolder")();

      expect(ipcRenderer.once).toHaveBeenCalledWith(OpenSyncFolderEvent, expect.anything());
      expect(ipcRenderer.send).toHaveBeenCalledWith(OpenSyncFolderEvent);
    });

    it("requests total volume ", () => {
      const timerID = 9999;
      setTimeout.mockReturnValue(timerID);

      const volume = 334;
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method, arg) => {
          if (listen === method) {
            cb(null, volume);
          }
        });
      });

      const wrapper = shallow(<Popup/>);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 30000);

      // jest.runOnlyPendingTimers();
      setTimeout.mock.calls[0][0]();

      expect(ipcRenderer.once).toHaveBeenCalledWith(UsedVolumeEvent, expect.any(Function));
      expect(ipcRenderer.send).toHaveBeenCalledWith(UsedVolumeEvent);

      expect(setTimeout).toHaveBeenCalledTimes(2);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 30000);

      expect(wrapper.state("usedVolume")).toEqual(volume);

      wrapper.unmount();
      expect(clearTimeout).toHaveBeenCalledWith(timerID);
    });

  });

});

