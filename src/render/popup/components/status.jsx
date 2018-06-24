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
import Header from "./header";

export default function Status(props) {

  const rate = props.totalVolume && Math.round(props.usedVolume / props.totalVolume * 100);
  let pauseRestartBtn;
  if (props.state === Synchronizing) {
    pauseRestartBtn = (
      <a className="pause-sync-btn"
         onClick={() => props.onChangeState && props.onChangeState(Paused)}>
        <i className="state-icon far fa-pause-circle"/>
        &nbsp;
        <span className="state-text">Goobox is up to date.</span>
      </a>
    );
  } else {
    pauseRestartBtn = (
      <a className="sync-again-btn"
         onClick={() => props.onChangeState && props.onChangeState(Synchronizing)}>
        <i className="state-icon far fa-play-circle"/>
        &nbsp;
        <span className="state-text">File transfers paused.</span>
      </a>
    );
  }

  return (
    <main style={props.style} className="d-flex flex-column">

      <Header onClickSettings={props.onClickSettings} onClickInfo={props.onClickInfo}/>

      <section className="d-flex flex-column p-3">
        <a className="btn btn-light sync-folder d-flex align-items-center mb-3"
           onClick={() => props.onClickSyncFolder && props.onClickSyncFolder()}>
          <i className="fas fa-folder-open mr-2"/>
          <span className="bold">Open my folder</span>
        </a>
        {/*<a id="import-drive" className="btn btn-light d-flex align-items-center"*/}
        {/*onClick={() => props.onClickImportDrive && props.onClickImportDrive()}>*/}
        {/*<i className="fas fa-cloud-upload-alt mr-2"/>*/}
        {/*<span className="bold">Import drive</span>*/}
        {/*</a>*/}
      </section>

      <footer className="d-flex px-3 py-2 mt-auto">
        {pauseRestartBtn}
        <span className="usage-rate ml-auto">Using {rate}% of {props.totalVolume}GB</span>
      </footer>

    </main>
  );
}


Status.propTypes = {
  usedVolume: PropTypes.number,
  totalVolume: PropTypes.number,
  state: PropTypes.string,
  onChangeState: PropTypes.func,
  onClickSettings: PropTypes.func.isRequired,
  onClickInfo: PropTypes.func.isRequired,
  onClickSyncFolder: PropTypes.func,
  onClickImportDrive: PropTypes.func,
};
