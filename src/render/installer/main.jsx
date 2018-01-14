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

import createHistory from "history/createBrowserHistory";
import React from "react";
import {Provider} from "react-redux";
import {Route, Switch} from "react-router";
import {ConnectedRouter, routerMiddleware, routerReducer} from "react-router-redux";
import {applyMiddleware, combineReducers, createStore} from "redux";
import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import {screens} from "./constants";
import Finish from "./containers/finish";
import Preparation from "./containers/preparation";
import SelectFolder from "./containers/select-folder";
import ChooseCloudService from "./containers/service-selector";
import SiaFinish from "./containers/sia-finish";
import SiaWallet from "./containers/sia-wallet";
import StorjEmailConfirmation from "./containers/storj-email-confirmation";
import StorjEncryptionKey from "./containers/storj-encryption-key";
import StorjLogin from "./containers/storj-login";
import StorjRegistration from "./containers/storj-registration";
import Welcome from "./containers/welcome";
import reducer from "./reducers";
import rootSaga from "./sagas";

export function configureStore() {

  const sagaMiddleware = createSagaMiddleware();
  const history = createHistory();
  const historyMiddleware = routerMiddleware(history);

  const store = createStore(
    combineReducers({
      main: reducer,
      router: routerReducer
    }),
    applyMiddleware(sagaMiddleware, historyMiddleware, logger),
  );
  sagaMiddleware.run(rootSaga);
  return {store: store, history: history};

}

export default function initInstaller() {

  const {store, history} = configureStore();
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path={screens.ChooseCloudService} component={ChooseCloudService}/>
          <Route path={screens.StorjSelected} component={SelectFolder}/>
          <Route path={screens.SiaSelected} component={SelectFolder}/>
          <Route path={screens.BothSelected} component={SelectFolder}/>
          <Route path={screens.StorjLogin} component={StorjLogin}/>
          <Route path={screens.StorjRegistration} component={StorjRegistration}/>
          <Route path={screens.StorjEncryptionKey} component={StorjEncryptionKey}/>
          <Route path={screens.StorjEmailConfirmation} component={StorjEmailConfirmation}/>
          <Route path={screens.SiaWallet} component={SiaWallet}/>
          <Route path={screens.SiaFinish} component={SiaFinish}/>
          <Route path={screens.FinishAll} component={Finish}/>
          <Route path={screens.JREPreparation} component={Preparation}/>
          <Route path={screens.SiaPreparation} component={Preparation}/>
          <Route path="" exact={true} component={Welcome}/>
        </Switch>
      </ConnectedRouter>
    </Provider>
  );

}

