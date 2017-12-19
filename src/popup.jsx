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
import {ipcRenderer} from "electron";
import Status from "./status.jsx";

import path from "path";
import openAboutWindow from "about-window";

import {ChangeStateEvent, OpenSyncFolderEvent, Synchronizing} from "./constants";


export function showInfoWindow() {
  openAboutWindow({
    icon_path: path.join(__dirname, "../resources/goobox.svg"),
    package_json_dir: path.join(__dirname, ".."),
    win_options: {
      resizable: false,
      fullscreenable: false,
      minimizable: false,
      maximizable: false
    }
  });
}


export class Popup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      state: Synchronizing,
      usedVolume: 0,
      totalVolume: 50,
    };
    this._onChangeState = this._onChangeState.bind(this);
    this._onClickSyncFolder = this._onClickSyncFolder.bind(this);
  }

  _onChangeState(state) {
    ipcRenderer.on(ChangeStateEvent, (event, acceptedState) => {
      if (acceptedState === state) {
        this.setState({state: state});
      }
    });
    ipcRenderer.send(ChangeStateEvent, state);
  }

  _onClickSyncFolder() {
    ipcRenderer.on(OpenSyncFolderEvent, () => {
    });
    ipcRenderer.send(OpenSyncFolderEvent);
  };

  render() {
    return (
      <Status usedVolume={this.state.usedVolume}
              totalVolume={this.state.totalVolume}
              state={this.state.state}
              onClickInfo={() => showInfoWindow()}
              onChangeState={this._onChangeState}
              onClickSyncFolder={this._onClickSyncFolder}
      />
    )
  }
}

export default Popup;
