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
import PropTypes from "prop-types";


export default class Running extends React.Component {

  constructor(props) {
    super(props);
    this._onClickPauseSync = this._onClickPauseSync.bind(this);
    this._onClickSettings = this._onClickSettings.bind(this);
    this._onClickInfo = this._onClickInfo.bind(this);
    this._onClickSyncFolder = this._onClickSyncFolder.bind(this);
    this._onClickImportDrive = this._onClickImportDrive.bind(this);
  }

  _onClickPauseSync() {
    if (this.props.onClickPauseSync) {
      this.props.onClickPauseSync();
    }
  }

  _onClickSettings() {
    if (this.props.onClickSettings) {
      this.props.onClickSettings();
    }
  }

  _onClickInfo() {
    if (this.props.onClickInfo) {
      this.props.onClickInfo();
    }
  }

  _onClickSyncFolder() {
    if (this.props.onClickSyncFolder) {
      this.props.onClickSyncFolder();
    }
  }

  _onClickImportDrive() {
    if (this.props.onClickImportDrive) {
      this.props.onClickImportDrive();
    }
  }

  render() {

    const rate = this.props.totalVolume && Math.round(this.props.usedVolume / this.props.totalVolume * 100);
    const barStyle = {
      width: `${rate}%`
    };

    return (
      <div>
        <nav className="background-gradation">
          <img src="../resources/left_white_icon.svg" width="41px" height="40px"/>
          <a className="pause-sync-btn" onClick={this._onClickPauseSync}>
            <img src="../resources/pause_sync.svg" width="23px" height="23px"/>
          </a>
          <a className="settings-btn" onClick={this._onClickSettings}>
            <img src="../resources/settings.svg" width="23px" height="23px"/>
          </a>
          <a className="info-btn" onClick={this._onClickInfo}>
            <img src="../resources/info.svg" width="23px" height="23px"/>
          </a>
          <img className="title" src="../resources/title.svg" width="43px" height="11px"/>
        </nav>
        <main>
          <img className="state-icon" src="../resources/synchronized.svg" width="81px" height="81px"/>
          <p className="state-text bold">Goobox is up to date.</p>
          <div className="usage-box">
            <span className="usage">Usage: {this.props.usedVolume}GB</span>
            <span className="usage-rate">{rate}% of {this.props.totalVolume}GB</span>
            <div className="meter">
              <span className="bar" style={barStyle}/>
            </div>
          </div>
          <div className="links">
            <a className="sync-folder" onClick={this._onClickSyncFolder}>
              <img src="../resources/folder.svg" width="25px" height="19px"/>
              <br/>
              <span className="bold">Sync folder</span>
            </a>
            <a className="import-drive" onClick={this._onClickImportDrive}>
              <img src="../resources/import_drive.svg" height="22px"/>
              <br/>
              <span className="bold">Import drive</span>
            </a>
          </div>
        </main>
      </div>
    );
  }

}


Running.propTypes = {
  usedVolume: PropTypes.number,
  totalVolume: PropTypes.number,
  onClickPauseSync: PropTypes.func,
  onClickSettings: PropTypes.func,
  onClickInfo: PropTypes.func,
  onClickSyncFolder: PropTypes.func,
  onClickImportDrive: PropTypes.func,
};