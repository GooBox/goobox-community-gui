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

export const log = () => {
};
export const info = () => {
};
export const debug = () => {
};
export const verbose = () => {
};
export const error = () => {
};
export const silly = () => {
};
// export const log = (msg) => console.log(msg);
// export const info = (msg) => console.log(`info: ${msg}`);
// export const debug = (msg) => console.log(`debug: ${msg}`);
// export const verbose = (msg) => console.log(`verbose: ${msg}`);
// export const error = (msg) => console.log(`error: ${msg}`);
export default {
  log: log,
  info: info,
  debug: debug,
  verbose: verbose,
  error: error,
  silly: silly,
};