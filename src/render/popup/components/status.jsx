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

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import Footer from "./footer";
import Header from "./header";

export const Status = ({style, usedVolume, totalVolume, state, onClickSettings, onClickInfo, onClickSyncFolder, onClickImportDrive, onChangeState}) => (

  <main style={style} className="d-flex flex-column">

    <Header onClickSettings={onClickSettings} onClickInfo={onClickInfo}/>

    <section className="d-flex flex-column p-3">
      <button
        className="btn btn-light sync-folder d-flex align-items-center mb-3"
        type="button"
        onClick={onClickSyncFolder}
      >
        <FontAwesomeIcon className="mr-2" icon="folder-open"/>
        <span className="bold">Open my folder</span>
      </button>
      <button
        id="import-drive"
        className="btn btn-light d-flex align-items-center invisible"
        type="button"
        onClick={onClickImportDrive}
      >
        <FontAwesomeIcon className="mr-2" icon="cloud-upload-alt"/>
        <span className="bold">Import drive</span>
      </button>
    </section>

    <Footer
      usedVolume={usedVolume}
      totalVolume={totalVolume}
      state={state}
      onChangeState={onChangeState}
    />

  </main>

);

Status.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  style: PropTypes.object,
  usedVolume: PropTypes.number.isRequired,
  totalVolume: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired,
  onChangeState: PropTypes.func.isRequired,
  onClickSettings: PropTypes.func.isRequired,
  onClickInfo: PropTypes.func.isRequired,
  onClickSyncFolder: PropTypes.func.isRequired,
  onClickImportDrive: PropTypes.func.isRequired,
};

Status.defaultProps = {
  style: null,
};

export default Status;
