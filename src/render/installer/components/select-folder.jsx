/*
 * Copyright (C) 2017-2019 Junpei Kawamoto
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
/* eslint no-console: 0 */

import {remote} from "electron";
import logger from "electron-log";
import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";
import {Sia, Storj} from "../../../constants";
import Main from "./partials/main";

const dialog = remote.dialog;

export const ReadOnlyInputBox = styled.input.attrs({
  className: "form-control mr-2 col-8",
  type: "text",
  readOnly: true
})`
  width: 342px;
  height: 48px;
`;

export const ServiceNames = ({storj, sia}) => {
  if (storj) {
    if (sia) {
      return (
        <h1>Installing {Storj} & {Sia}</h1>
      );
    } else {
      return (
        <h1>Installing {Storj}</h1>
      );
    }
  }
  return (
    <h1>Installing {Sia}</h1>
  );
};

ServiceNames.propTypes = {
  storj: PropTypes.bool,
  sia: PropTypes.bool,
}

ServiceNames.defaultProps = {
  storj: false,
  sia: false,
}

export class SelectFolder extends React.Component {

  constructor(props) {
    super(props);
    this._onClickBrowse = this._onClickBrowse.bind(this);
  }

  async _onClickBrowse() {
    const {folder} = this.props;

    let err;
    return new Promise((resolve) => {

      dialog.showOpenDialog(remote.getCurrentWindow(), {
        defaultPath: folder,
        properties: ["openDirectory", "createDirectory"]
      }, resolve);

    }).then((selected) => {

      const {onSelectFolder} = this.props;
      if (selected && selected.length > 0) {
        let dir = selected[0];
        if (dir.endsWith("\\")) {
          dir = dir.substr(0, dir.length - 1);
        }
        onSelectFolder(dir);
      }

    }).catch((reason) => {
      err = reason;
    }).then(() => {
      if (err) {
        return Promise.reject(err);
      }
    });

  }

  render() {
    const {folder, storj, sia, prev, next, onClickBack, onClickNext} = this.props;
    return (
      <Main
        prev={prev}
        next={next}
        onClickPrev={onClickBack}
        onClickNext={onClickNext}
        nextCaption="Choose this folder"
      >
        <ServiceNames storj={storj} sia={sia}/>
        <p>
          Choose the folder you want to sync with Goobox
        </p>
        <div className="form-row">
          <ReadOnlyInputBox id="folder" value={folder}/>
          <button
            id="change-folder-btn"
            type="button"
            className="btn btn-outline-primary"
            onClick={() => this._onClickBrowse().catch(logger.debug)}
          >
            Change folder
          </button>
          <small className="form-text text-muted">
            Everything in this folder will be encrypted and safely stored.
          </small>
        </div>
      </Main>
    );
  }

}

SelectFolder.propTypes = {
  storj: PropTypes.bool,
  sia: PropTypes.bool,
  folder: PropTypes.string.isRequired,
  prev: PropTypes.string.isRequired,
  next: PropTypes.string.isRequired,
  onClickBack: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  onSelectFolder: PropTypes.func.isRequired
};

SelectFolder.defaultProps = {
  storj: false,
  sia: false,
}

export default SelectFolder;
