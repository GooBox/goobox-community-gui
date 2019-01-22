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
import Login from "../../components/screens/storj/login";

export const mapStateToProps = state => ({
  processing: state.main.processing,
  encryptionKey: state.main.storjAccount.key,
  emailWarn: state.main.storjAccount.emailWarn,
  passwordWarn: state.main.storjAccount.passwordWarn,
  keyWarn: state.main.storjAccount.keyWarn,
  warnMsg: state.main.storjAccount.warnMsg,
  mainState: state.main,
});

export const mapDispatchToProps = dispatch => ({
  onClickNext: (mainState, accountInfo) =>
    dispatch(
      actions.storjLogin({
        ...mainState,
        storjAccount: accountInfo,
      })
    ),

  onClickGenerateSeed: mainState =>
    dispatch(
      actions.storjGenerateMnemonic({
        folder: mainState.folder,
      })
    ),
});

export const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  onClickNext: dispatchProps.onClickNext.bind(null, stateProps.mainState),
  onClickGenerateSeed: dispatchProps.onClickGenerateSeed.bind(
    null,
    stateProps.mainState
  ),
  mainState: undefined,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Login);
