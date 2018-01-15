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
import SiaWallet from "../components/sia-wallet";
import * as screens from "../constants/screens";

export const mapStateToProps = (state) => ({
  address: state.main.siaAccount.address,
  seed: state.main.siaAccount.seed,
  mainState: state.main,
});

export const mapDispatchToProps = (dispatch) => ({

  onClickBack: (mainState) => {
    if (mainState.storj) {
      dispatch(push(screens.StorjLogin));
    } else {
      dispatch(push(screens.SiaSelected));
    }
  },

  onClickNext: (mainState) => {
    dispatch(actions.saveConfig(mainState));
    dispatch(push(screens.SiaFinish));
  }

});

export const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  onClickBack: dispatchProps.onClickBack.bind(null, stateProps.mainState),
  onClickNext: dispatchProps.onClickNext.bind(null, stateProps.mainState),
  mainState: undefined,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SiaWallet);

