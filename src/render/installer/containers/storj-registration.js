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
import StorjRegistration from "../components/storj-registration";
import * as constants from "../constants";

export const mapStateToProps = (state) => ({
  emailWarn: state.storjAccount.emailWarn,
  passwordWarn: state.storjAccount.passwordWarn,
  warnMsg: state.storjAccount.warnMsg,
});

export const mapDispatchToProps = (dispatch) => ({

  onClickBack: () => dispatch(actions.back()),

  onClickNext: (args) => dispatch(actions.storjCreateAccount(args)),

  onClickLogin: () => dispatch(push(constants.StorjLogin)),

});

export default connect(mapStateToProps, mapDispatchToProps)(StorjRegistration);

