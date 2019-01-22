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
import * as actions from "../actions";
import SelectFolder from "../components/screens/select-folder";
import * as screens from "../constants/screens";

const nextScreen = (main) => {
  if (main.storj) {
    return screens.StorjLogin;
  } else if (main.siaAccount.address) {
    return screens.SiaWallet;
  }
  return screens.SiaPreparation;
};

export const mapStateToProps = state => ({
  storj: state.main.storj,
  sia: state.main.sia,
  folder: state.main.folder,
  mainState: state.main,
  prev: screens.ChooseCloudService,
  next: nextScreen(state.main),
});

export const mapDispatchToProps = dispatch => ({

  onClickBack: () => dispatch(actions.stopSyncApps()),

  onClickNext: (mainState) => {
    if (!mainState.storj && !mainState.siaAccount.address) {
      dispatch(actions.requestSiaWalletInfo(mainState));
    }
  },

  onSelectFolder: folder => dispatch(actions.selectFolder(folder)),

});

export const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  onClickNext: () => dispatchProps.onClickNext(stateProps.mainState),
  mainState: undefined,
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(SelectFolder);

