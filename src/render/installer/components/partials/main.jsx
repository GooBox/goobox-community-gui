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

import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import {Link} from "react-router-dom";
import Sidebar from "./sidebar";

export const Main = ({children, processing, next, prev, nextCaption, prevCaption, onClickNext, onClickPrev}) => (
  <div className={classNames("clearfix", {wait: processing})}>
    <Sidebar className="float-left"/>
    <main className="float-right d-flex flex-column">
      {children}
      <nav className="mt-auto d-flex justify-content-between">
        <Link
          id="prev-btn"
          className={classNames("btn btn-light py-3", {"d-none": !prev})}
          to={prev}
          onClick={onClickPrev}
        >{prevCaption}
        </Link>
        <Link
          id="next-btn"
          className={classNames("btn btn-primary py-3", {"d-none": !next})}
          to={next}
          onClick={onClickNext}
        >{nextCaption}
        </Link>
      </nav>
    </main>
  </div>
);

Main.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  processing: PropTypes.bool,
  next: PropTypes.string,
  prev: PropTypes.string,
  nextCaption: PropTypes.string,
  prevCaption: PropTypes.string,
  onClickNext: PropTypes.func,
  onClickPrev: PropTypes.func,
};

Main.defaultProps = {
  children: null,
  processing: false,
  next: "",
  prev: "",
  nextCaption: "Next",
  prevCaption: "Back",
  onClickNext: null,
  onClickPrev: null,
};


export default Main;
