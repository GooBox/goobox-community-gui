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

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import {CopyToClipboard} from "react-copy-to-clipboard";
import styled from "styled-components";
import {SleepTimeToShowCopyButton} from "../../constants";

const InnerCopyButton = styled.button.attrs({
  className: "btn btn-light",
  type: "button",
})`
  width: 65px;
  border: solid 0.8px #dddddd;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.09);
  font-size: 15px;
  text-align: center
  background-color: #ffffff;
`;

export class CopyButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      copied: false,
    };
    this._onCopy = this._onCopy.bind(this);
    this._renderBtn = this._renderBtn.bind(this);
  }

  _onCopy() {
    this.setState({copied: true}, () => {
      setTimeout(() => this.setState({copied: false}), SleepTimeToShowCopyButton);
    });
  }

  _renderBtn() {
    const {copied} = this.state;
    if (copied) {
      return (
        <div className="text-success">
          <FontAwesomeIcon icon={["far", "check-circle"]}/>
          <br/>
          copied
        </div>
      );
    }
    return (
      <FontAwesomeIcon className="text-black-50" icon={["far", "clone"]}/>
    );
  }

  render() {
    const {text} = this.props;
    return (
      <CopyToClipboard text={text} onCopy={this._onCopy}>
        <InnerCopyButton id="copy-address-btn">{this._renderBtn()}</InnerCopyButton>
      </CopyToClipboard>
    );
  }

}

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
};

export default CopyButton;



