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
import {Paused, Synchronizing} from "../../../constants";
import folderImage from "../assets/folder.svg";
import importDriveImage from "../assets/import_drive.svg";
import infoImage from "../assets/info.svg";
import leftWhiteIcon from "../assets/left_white_icon.svg";
import pauseSyncImage from "../assets/pause_sync.svg";
import pausedImage from "../assets/paused.svg";
import settingsImage from "../assets/settings.svg";
import syncAgainImage from "../assets/sync_again.svg";
import synchronizedImage from "../assets/synchronized.svg";
import titleImage from "../assets/title.svg";

export default function Status(props) {

  const rate = props.totalVolume && Math.round(props.usedVolume / props.totalVolume * 100);
  const barStyle = {
    width: `${rate < 100 ? rate : 100}%`
  };

  let pauseRestartBtn;
  let stateInfo;
  if (props.state === Synchronizing) {
    pauseRestartBtn = (
      <a className="pause-sync-btn"
         onClick={() => props.onChangeState && props.onChangeState(Paused)}>
        <img src={pauseSyncImage} width={23} height={23}/>
      </a>
    );
    stateInfo = (
      <div>
        <img className="state-icon" src={synchronizedImage} width={81} height={81}/>
        <p className="state-text bold">Goobox is up to date.</p>
      </div>
    );
  } else {
    pauseRestartBtn = (
      <a className="sync-again-btn"
         onClick={() => props.onChangeState && props.onChangeState(Synchronizing)}>
        <img src={syncAgainImage} width={23} height={23}/>
      </a>
    );
    stateInfo = (
      <div>
        <img className="state-icon" src={pausedImage} width={81} height={81}/>
        <p className="state-text bold">File transfers paused.</p>
      </div>
    );
  }

  return (
    <div style={props.style}>
      <nav className="background-gradation">
        <img src={leftWhiteIcon} width={41} height={40}/>
        {pauseRestartBtn}
        <a className="settings-btn" onClick={() => props.onClickSettings && props.onClickSettings()}>
          <img src={settingsImage} width={23} height={23}/>
        </a>
        <a className="info-btn" onClick={() => props.onClickInfo && props.onClickInfo()}>
          <img src={infoImage} width={23} height={23}/>
        </a>
        <img className="title" src={titleImage} width={43} height={11}/>
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
            <img src={folderImage} width={25} height={19}/>
            <br/>
            <span className="bold">Sync folder</span>
          </a>
          <a className="import-drive"
             onClick={() => props.onClickImportDrive && props.onClickImportDrive()}>
            <img src={importDriveImage} height={22}/>
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
