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

import PropTypes from "prop-types";
import React from "react";
import {Paused, Synchronizing} from "./constants";

export default function Status(props) {

  const rate = props.totalVolume && Math.round(props.usedVolume / props.totalVolume * 100);
  const barStyle = {
    width: `${rate}%`
  };

  let pauseRestartBtn;
  let stateInfo;
  if (props.state === Synchronizing) {
    pauseRestartBtn = (
      <a className="pause-sync-btn"
         onClick={() => props.onChangeState && props.onChangeState(Paused)}>
        <img src="../resources/pause_sync.svg" width="23px" height="23px"/>
      </a>
    );
    stateInfo = (
      <div>
        <img className="state-icon" src="../resources/synchronized.svg" width="81px" height="81px"/>,
        <p className="state-text bold">Goobox is up to date.</p>
      </div>
    );
  } else {
    pauseRestartBtn = (
      <a className="sync-again-btn"
         onClick={() => props.onChangeState && props.onChangeState(Synchronizing)}>
        <img src="../resources/sync_again.svg" width="23px" height="23px"/>
      </a>
    );
    stateInfo = (
      <div>
        <img className="state-icon" src="../resources/paused.svg" width="81px" height="81px"/>,
        <p className="state-text bold">File transfers paused.</p>
      </div>
    );
  }

  return (
    <div style={props.style}>
      <nav className="background-gradation">
        <img src="../resources/left_white_icon.svg" width="41px" height="40px"/>
        {pauseRestartBtn}
        <a className="settings-btn" onClick={() => props.onClickSettings && props.onClickSettings()}>
          <img src="../resources/settings.svg" width="23px" height="23px"/>
        </a>
        <a className="info-btn" onClick={() => props.onClickInfo && props.onClickInfo()}>
          <img src="../resources/info.svg" width="23px" height="23px"/>
        </a>
        <img className="title" src="../resources/title.svg" width="43px" height="11px"/>
      </nav>
      <main>
        {stateInfo}
        <div className="usage-box">
          <span className="usage">Usage: {props.usedVolume && props.usedVolume.toFixed(2)}GB</span>
          <span className="usage-rate">{rate}% of {props.totalVolume}GB</span>
          <div className="meter">
            <span className="bar" style={barStyle}/>
          </div>
        </div>
        <div className="links">
          <a className="sync-folder" onClick={() => props.onClickSyncFolder && props.onClickSyncFolder()}>
            <img src="../resources/folder.svg" width="25px" height="19px"/>
            <br/>
            <span className="bold">Sync folder</span>
          </a>
          <a className="import-drive"
             onClick={() => props.onClickImportDrive && props.onClickImportDrive()}>
            <img src="../resources/import_drive.svg" height="22px"/>
            <br/>
            <span className="bold">Import drive</span>
          </a>
        </div>
      </main>
    </div>
  );
}


Status.propTypes = {
  usedVolume: PropTypes.number,
  totalVolume: PropTypes.number,
  state: PropTypes.string,
  onChangeState: PropTypes.func,
  onClickSettings: PropTypes.func,
  onClickInfo: PropTypes.func,
  onClickSyncFolder: PropTypes.func,
  onClickImportDrive: PropTypes.func,
};
