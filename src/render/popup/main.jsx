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

import electronLog from "electron-log";
import React from "react";
import {Provider} from "react-redux";
import {applyMiddleware, createStore} from "redux";
import {createLogger} from "redux-logger";
import createSagaMiddleware from "redux-saga";
import Status from "./containers/status";
import reducer from "./reducers";
import rootSaga from "./sagas";

let logger;
if ("development" === process.env.NODE_ENV) {
  logger = createLogger();
} else {
  logger = createLogger({
    logger: {
      log: electronLog.debug,
      colors: {
        title: false,
        prevState: false,
        action: false,
        nextState: false,
        error: false,
      }
    }
  });
}

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware, logger)
  );
  sagaMiddleware.run(rootSaga);
  return store;
};

export default function initPopup() {

  const store = configureStore();
  return (
    <Provider store={store}>
      <Status/>
    </Provider>
  );

}

