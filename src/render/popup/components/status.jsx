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
import Footer from "./footer";
import Header from "./header";

export const Status = (props) => (

  <main style={props.style} className="d-flex flex-column">

    <Header onClickSettings={props.onClickSettings} onClickInfo={props.onClickInfo}/>

    <section className="d-flex flex-column p-3">
      <a className="btn btn-light sync-folder d-flex align-items-center mb-3"
         onClick={() => props.onClickSyncFolder()}>
        <i className="fas fa-folder-open mr-2"/>
        <span className="bold">Open my folder</span>
      </a>
      <a id="import-drive" className="btn btn-light d-flex align-items-center invisible"
         onClick={() => props.onClickImportDrive()}>
        <i className="fas fa-cloud-upload-alt mr-2"/>
        <span className="bold">Import drive</span>
      </a>
    </section>

    <Footer usedVolume={props.usedVolume} totalVolume={props.totalVolume} state={props.state}
            onChangeState={props.onChangeState}/>

  </main>

);

Status.propTypes = {
  style: PropTypes.object.isRequired,
  usedVolume: PropTypes.number.isRequired,
  totalVolume: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired,
  onChangeState: PropTypes.func.isRequired,
  onClickSettings: PropTypes.func.isRequired,
  onClickInfo: PropTypes.func.isRequired,
  onClickSyncFolder: PropTypes.func.isRequired,
  onClickImportDrive: PropTypes.func.isRequired,
};

export default Status;
