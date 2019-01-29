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

// import logger from "electron-log";
import React from "react";
import {RefreshInterval} from "./constants";

const logger = console;

export class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
    };
    this.intervalID = null;
    this.fetchLogs = this.fetchLogs.bind(this);
    this.renderItems = this.renderItems.bind(this);
  }

  componentDidMount() {
    this.fetchLogs().catch(logger.error);
    this.intervalID = setInterval(this.fetchLogs, RefreshInterval);
  }

  componentDidUpdate() {
    const element = document.getElementById("move-to-top");
    const rect = element.getBoundingClientRect();
    scrollTo(0, rect.bottom);
  }

  componentWillUnmount() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }

  async fetchLogs() {
    let url = location.hash;
    if (url.startsWith("#")) {
      url = url.substring(1);
    }
    await fetch(`file://${url}`)
      .then(res => res.text())
      .then(text => this.setState({items: text.split("\n")}));
  }

  renderItems() {
    const {items} = this.state;
    return items.map(item => <li key={item}>{item}</li>);
  }

  render() {
    return (
      <div>
        <ul>{this.renderItems()}</ul>
        <a id="move-to-top" href={location.hash} onClick={scrollTo(0, 0)}>
          Move to top
        </a>
      </div>
    );
  }
}

export default Viewer;
