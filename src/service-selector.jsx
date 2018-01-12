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

import PropTypes from "prop-types";
import React from "react";

const style = {
  main: {
    color: "rgb(0, 175, 177)",
    position: "absolute",
    top: "103px",
    fontSize: "25px",
    textAlign: "center",
    width: "600px",
  },
  downArrow: {
    position: "absolute",
    top: "158px",
    textAlign: "center",
    width: "600px",
  },
  options: {
    position: "absolute",
    top: "247px",
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  //
  // The following configurations will be enabled when Goobox supports Storj & Sia.
  //
  // optionStorj: {
  //   width: "25%",
  //   border: "none",
  //   background: "none"
  // },
  // optionSia: {
  //   width: "25%",
  //   border: "none",
  //   background: "none"
  // },
  // optionBoth: {
  //   width: "40%",
  //   border: "none",
  //   background: "none"
  // }
  //
  // Currently, Goobox only supports Storj or Sia.
  //
  optionStorj: {
    width: "30%",
    border: "none",
    background: "none"
  },
  optionSia: {
    width: "30%",
    border: "none",
    background: "none"
  },
  optionBoth: {
    display: "none",
  }
};

export default function ServiceSelector(props) {

  return (
    <div>
      <header><img className="icon" src="../resources/left_color_icon.svg"/></header>
      <main style={style.main}>
        <span>Please choose your</span> <span className="underlined bold">cloud service</span>
      </main>
      <section style={style.downArrow}>
        <img className="up-and-down" src="../resources/down_arrow.svg" width="15px" height="24px"/>
      </section>
      <section style={style.options}>
        <button className="option-storj" style={style.optionStorj}
                onClick={() => props.onSelectStorj && props.onSelectStorj()}>
          <img src="../resources/storj_logo.svg" width="56px" height="83px"/>
        </button>
        <button className="option-sia" style={style.optionSia}
                onClick={() => props.onSelectSia && props.onSelectSia()}>
          <img src="../resources/sia_logo.svg" width="78px" height="47px"/>
        </button>
        <button className="option-both" style={style.optionBoth}
                onClick={() => props.onSelectBoth && props.onSelectBoth()}>
          <img src="../resources/storj_and_sia_logo.svg" width="140px" height="68px"/>
        </button>
      </section>
    </div>
  );

}

ServiceSelector.propTypes = {
  onSelectStorj: PropTypes.func.isRequired,
  onSelectSia: PropTypes.func.isRequired,
  onSelectBoth: PropTypes.func.isRequired
};