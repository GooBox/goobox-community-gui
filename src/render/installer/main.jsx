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

import {ConnectedRouter, connectRouter, routerMiddleware} from "connected-react-router";
import createHistory from "history/createBrowserHistory";
import React from "react";
import {Provider} from "react-redux";
import {Route, Switch} from "react-router";
import {applyMiddleware, combineReducers, createStore} from "redux";
import createSagaMiddleware from "redux-saga";
import {createLogger} from "../logger";
import * as screens from "./constants/screens";
import Preparation from "./containers/preparation";
import SelectFolder from "./containers/select-folder";
import SelectService from "./containers/select-service";
import SiaFinish from "./containers/sia-finish";
import SiaSettingUp from "./containers/sia-setting-up";
import SiaWallet from "./containers/sia-wallet";
import StorjEmailConfirmation from "./containers/storj-email-confirmation";
import StorjEncryptionKey from "./containers/storj-encryption-key";
import StorjFinish from "./containers/storj-finish";
import StorjLogin from "./containers/storj-login";
import StorjRegistration from "./containers/storj-registration";
import reducer from "./reducers";
import rootSaga from "./sagas";

const configureStore = () => {

  const sagaMiddleware = createSagaMiddleware();
  const history = createHistory();
  const historyMiddleware = routerMiddleware(history);

  const store = createStore(
    combineReducers({
      main: reducer,
      router: connectRouter(history),
    }),
    applyMiddleware(sagaMiddleware, historyMiddleware, createLogger()),
  );
  sagaMiddleware.run(rootSaga);
  return {store, history};

};

export const routes = () => (
  <Switch>
    <Route path={screens.ChooseCloudService} component={SelectService}/>
    <Route path={screens.StorjSelected} component={SelectFolder}/>
    <Route path={screens.SiaSelected} component={SelectFolder}/>
    <Route path={screens.BothSelected} component={SelectFolder}/>
    <Route path={screens.StorjLogin} component={StorjLogin}/>
    <Route path={screens.StorjRegistration} component={StorjRegistration}/>
    <Route path={screens.StorjEncryptionKey} component={StorjEncryptionKey}/>
    <Route path={screens.StorjEmailConfirmation} component={StorjEmailConfirmation}/>
    <Route path={screens.SiaWallet} component={SiaWallet}/>
    <Route path={screens.SiaFinish} component={SiaFinish}/>
    <Route path={screens.FinishAll} component={StorjFinish}/>
    <Route path={screens.SiaPreparation} component={SiaSettingUp}/>
    <Route path="" component={Preparation}/>
  </Switch>
);

export const initInstaller = () => {

  const {store, history} = configureStore();
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        {routes()}
      </ConnectedRouter>
    </Provider>
  );

};

export default initInstaller;
