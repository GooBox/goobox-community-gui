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

import * as constants from "../constants";

export const next = () => ({type: constants.NextPage});
export const back = () => ({type: constants.BackPage});
export const close = () => ({type: constants.CloseApp});

export const openSelectFolder = () => ({type: constants.OpenSelectFolder});
export const selectStorj = () => ({type: constants.SelectStorj});
export const selectSia = () => ({type: constants.SelectSia});
export const selectBoth = () => ({type: constants.SelectBoth});

export const storjLogin = (args) => ({type: constants.StorjLogin, value: args});
export const storjCreateAccount = () => ({type: constants.StorjCreataAccount});