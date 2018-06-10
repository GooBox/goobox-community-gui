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
import Finish from "../components/finish";

export const mapStateToProps = () => ({

  header: "We’re preparing your Goobox",

  message: "We will notify you when we’re done."

});

export const mapDispatchToProps = (dispatch) => ({

  onClick: () => dispatch(actions.closeWindow()),

});

export default connect(mapStateToProps, mapDispatchToProps)(Finish);
