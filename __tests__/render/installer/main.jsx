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

import {mount} from "enzyme";
import React from "react";
import {Provider} from "react-redux";
import {MemoryRouter} from "react-router";
import configureStore from "redux-mock-store";
import Preparation from "../../../src/render/installer/components/preparation";
import SelectFolder from "../../../src/render/installer/components/select-folder";
import SelectService from "../../../src/render/installer/components/select-service";
import SiaSettingUp from "../../../src/render/installer/components/sia-setting-up";
import SiaWallet from "../../../src/render/installer/components/sia-wallet";
import StorjLogin from "../../../src/render/installer/components/storj-login";
import * as screens from "../../../src/render/installer/constants/screens";
import SiaFinish from "../../../src/render/installer/containers/sia-finish";
import StorjFinish from "../../../src/render/installer/containers/storj-finish";
import {routes} from "../../../src/render/installer/main";
import {InitialState} from "../../../src/render/installer/reducers";

describe("routes", () => {

  const createDOM = (path = '/') => {
    const store = configureStore()({main: InitialState});
    return mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          {routes()}
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders Preparation at first", () => {
    expect(createDOM().find(Preparation).exists()).toBeTruthy();
  });

  it("renders SelectService when path is screens.ChooseCloudService", () => {
    expect(createDOM(screens.ChooseCloudService).find(SelectService).exists()).toBeTruthy();
  });

  it("renders SelectFolder when path is screens.StorjSelected", () => {
    expect(createDOM(screens.StorjSelected).find(SelectFolder).exists()).toBeTruthy();
  });

  it("renders SelectFolder when path is screens.SiaSelected", () => {
    expect(createDOM(screens.SiaSelected).find(SelectFolder).exists()).toBeTruthy();
  });

  // it("renders SelectFolder when path is screens.BothSelected", () => {
  //   expect(createDOM(screens.BothSelected).find("SelectFolder").exists()).toBeTruthy();
  // });

  it("renders StorjLogin when path is screens.StorjLogin", () => {
    expect(createDOM(screens.StorjLogin).find(StorjLogin).exists()).toBeTruthy();
  });

  // it("renders StorjRegistration when path is screens.StorjRegistration", () => {
  //   expect(createDOM(screens.StorjRegistration).find("StorjRegistration").exists()).toBeTruthy();
  // });
  //
  // it("renders StorjEncryptionKey when path is screens.StorjEncryptionKey", () => {
  //   expect(createDOM(screens.StorjEncryptionKey).find("StorjEncryptionKey").exists()).toBeTruthy();
  // });
  //
  // it("renders StorjEmailConfirmation when path is screens.StorjEmailConfirmation", () => {
  //   expect(createDOM(screens.StorjEmailConfirmation).find("StorjEmailConfirmation").exists()).toBeTruthy();
  // });

  it("renders SiaWallet when path is screens.SiaWallet", () => {
    expect(createDOM(screens.SiaWallet).find(SiaWallet).exists()).toBeTruthy();
  });

  it("renders SiaFinish when path is screens.SiaFinish", () => {
    expect(createDOM(screens.SiaFinish).find(SiaFinish).exists()).toBeTruthy();
  });

  it("renders Finish when path is screens.FinishAll", () => {
    expect(createDOM(screens.FinishAll).find(StorjFinish).exists()).toBeTruthy();
  });

  it("renders Preparation when path is screens.SiaPreparation", () => {
    expect(createDOM(screens.SiaPreparation).find(SiaSettingUp).exists()).toBeTruthy();
  });

});
