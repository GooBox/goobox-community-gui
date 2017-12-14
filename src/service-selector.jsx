/*
 * Copyright (C) 2017 Junpei Kawamoto
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

import React from "react";
import PropTypes from "prop-types";

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
    optionStorj: {
        position: "absolute",
        top: "247px",
        left: "80px",
        border: "none",
        background: "none"
    },
    optionSia: {
        position: "absolute",
        top: "258px",
        left: "216px",
        border: "none",
        background: "none"
    },
    optionBoth: {
        position: "absolute",
        top: "257px",
        left: "381px",
        border: "none",
        background: "none"
    }
};

export default class ServiceSelector extends React.Component {

    constructor(props) {
        super(props);
        this._onSelectStorj = this._onSelectStorj.bind(this);
        this._onSelectSia = this._onSelectSia.bind(this);
        this._onSelectBoth = this._onSelectBoth.bind(this);
    }

    _onSelectStorj() {
        if (this.props.onSelectStorj) {
            this.props.onSelectStorj();
        }
    }

    _onSelectSia() {
        if (this.props.onSelectSia) {
            this.props.onSelectSia();
        }
    }

    _onSelectBoth() {
        if (this.props.onSelectBoth) {
            this.props.onSelectBoth();
        }
    }

    render() {
        return (
            <div>
                <header><img className="icon" src="../resources/left_color_icon.svg"/></header>
                <main style={style.main}>
                    <span>Please choose your</span>
                    <span className="underlined bold">cloud service</span>
                </main>
                <section style={style.downArrow}>
                    <img className="up-and-down" src="../resources/down_arrow.svg" width="15px" height="24px"/>
                </section>
                <section>
                    <button className="option-storj" style={style.optionStorj} onClick={this._onSelectStorj}>
                        <img src="../resources/storj_logo.svg" width="56px" height="83px"/>
                    </button>
                    <button className="option-sia" style={style.optionSia} onClick={this._onSelectSia}>
                        <img src="../resources/sia_logo.svg" width="78px" height="47px"/>
                    </button>
                    <button className="option-both" style={style.optionBoth} onClick={this._onSelectBoth}>
                        <img src="../resources/storj_and_sia_logo.svg" width="140px" height="68px"/>
                    </button>
                </section>
            </div>
        );
    }

}

ServiceSelector.propTypes = {
    onSelectStorj: PropTypes.func,
    onSelectSia: PropTypes.func,
    onSelectBoth: PropTypes.func
};