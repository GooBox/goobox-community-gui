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

import PropTypes from "prop-types"
import React from "react";

const style = {

  background: {
    background: "linear-gradient(to right, #00AFB1, #7A55DE)",
    position: "absolute",
    width: "760px",
    height: "760px",
    left: "-80px",
    top: "-180px",
    animation: "spin 2s linear infinite",
  },
  main: {
    backgroundColor: "white",
    position: "absolute",
    top: "10px",
    left: "10px",
    width: "580px",
    height: "380px",
    textAlign: "center",
    padding: "100px 100px",
  },
  component: {
    marginBottom: "50px",
  },
  msg: {
    color: "rgb(0, 175, 177)",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "50px",
  },
  iconBackground: {
    position: "relative",
    animation: "spin 2s linear infinite",
  },
  icon: {
    position: "absolute",
    top: "115px",
    left: "272px",
  }
};


export default function Preparation(props) {

  const barStyle = {
    width: `${props.progress}%`
  };
  return (
    <div>
      <div style={style.background}>
      </div>
      <main style={style.main}>
        <div style={style.component}>
          <img style={style.iconBackground} src="../resources/stroke_color.svg" width="66px" height="66px"/>
          <img style={style.icon} src="../resources/symbol_color.svg" width="36px" height="36px"/>
        </div>
        <div className="meter" style={style.component}>
          <span className="bar" style={barStyle}/>
        </div>
        <p className="msg" style={style.msg}>
          {props.children}
        </p>
      </main>
    </div>
  );

}

Preparation.propTypes = {
  progress: PropTypes.number.isRequired,
};
