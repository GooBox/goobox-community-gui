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
import {push} from "react-router-redux";
import * as actions from "../actions";
import ServiceSelector from "../components/select-service";
import * as screens from "../constants/screens";

export const mapStateToProps = (state) => ({
  processing: state.main.processing
});

export const mapDispatchToProps = (dispatch) => ({

  onSelectStorj: () => {
    dispatch(actions.selectStorj());
    dispatch(push(screens.StorjSelected));
  },

  onSelectSia: () => {
    dispatch(actions.selectSia());
    dispatch(push(screens.SiaSelected));
  },

  onSelectBoth: () => {
    dispatch(actions.selectBoth());
    dispatch(push(screens.StorjSelected));
  }

});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceSelector);

