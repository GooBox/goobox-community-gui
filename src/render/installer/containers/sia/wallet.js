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

import {connect} from "react-redux";
import * as actions from "../../actions";
import Wallet from "../../components/screens/sia/wallet";
import * as screens from "../../constants/screens";

export const mapStateToProps = state => ({
  address: state.main.siaAccount.address,
  seed: state.main.siaAccount.seed,
  mainState: state.main,
  next: screens.SiaFinish,
  prev: state.main.storj ? screens.StorjLogin : screens.SiaSelected,
});

export const mapDispatchToProps = dispatch => ({
  onClickNext: mainState => {
    dispatch(actions.saveConfig(mainState));
  },
});

export const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  onClickNext: dispatchProps.onClickNext.bind(null, stateProps.mainState),
  mainState: undefined,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Wallet);
