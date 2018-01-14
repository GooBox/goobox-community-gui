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
import {Sia, Storj} from "../../../constants";
import * as actions from "../actions";
import SelectFolder from "../components/select-folder";

export const mapStateToProps = (state) => {

  let service;
  if (state.storj) {
    if (state.sia) {
      service = `${Storj} & ${Sia}`;
    } else {
      service = Storj;
    }
  } else {
    service = Sia;
  }

  return {
    service: service,
    folder: state.folder,
  }
};

export const mapDispatchToProps = (dispatch) => ({

  onClickBack: () => dispatch(actions.back()),

  onClickNext: () => dispatch(actions.next()),

  onSelectFolder: () => dispatch(actions.openSelectFolder()),

});

export default connect(mapStateToProps, mapDispatchToProps)(SelectFolder);

