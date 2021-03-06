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

import {connect} from "react-redux";
import * as actions from "../actions";
import Status from "../components/status";

export const mapStateToProps = state => ({
  style: {
    cursor: state.disabled ? "wait" : "auto",
  },
  usedVolume: state.usedVolume,
  totalVolume: state.totalVolume,
  state: state.state,
});

export const mapDispatchToProps = dispatch => ({
  onChangeState: args => dispatch(actions.changeState(args)),

  onClickSyncFolder: () => dispatch(actions.openSyncFolder()),

  onClickInfo: () => dispatch(actions.openAboutWindow()),

  onClickSettings: () => dispatch(actions.openSettings()),

  onClickImportDrive: () => dispatch(actions.importDrive()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Status);
