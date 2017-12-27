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

import path from "path";
import React from "react";
import {shallow, mount} from "enzyme";
import {ipcRenderer, remote} from "electron";
import {Installer, Hash} from "../src/installer.jsx";
import {
  Storj,
  Sia,
  JREInstallEvent,
  StorjLoginEvent,
  StorjRegisterationEvent,
  SiaWalletEvent,
  ConfigFile
} from "../src/constants";

const app = remote.app;
const storage = remote.require("electron-json-storage");

const sampleHome = path.join("/home", "some-user");
process.env.DEFAULT_SYNC_FOLDER = path.join(sampleHome, app.getName());

describe("Installer component", () => {

  beforeEach(() => {
    app.getPath.mockReset();
    app.getPath.mockReturnValue(".");
    remote.getCurrentWindow.mockReset();
    ipcRenderer.once.mockReset();
    ipcRenderer.send.mockReset();
    ipcRenderer.once.mockImplementation((listen, cb) => {
      ipcRenderer.send.mockImplementation((method, arg) => {
        if (listen === method) {
          cb(null, arg);
        }
      });
    });
    storage.set.mockReset();
  });

  describe("hash is empty", () => {

    beforeEach(() => {
      location.hash = "";
    });

    it("shows Welcome component at first", () => {
      const wrapper = mount(<Installer/>);
      expect(wrapper.find("Welcome").exists()).toBeTruthy();
    });

    it("moves to the choose service screen when next button in the welcome screen is clicked", () => {
      const wrapper = mount(<Installer/>);
      wrapper.find("Welcome").prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.ChooseCloudService}`);

    });

    it("doesn't moves to the choose service screen when next button is clicked but requesting is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.instance().requesting = true;
      wrapper.find("Welcome").prop("onClickNext")();
      expect(location.hash).toEqual("");
    });

    describe("with ipc", () => {

      it("requests starting JRE installer when onClickNext is called", () => {
        const wrapper = mount(<Installer/>);
        const welcome = wrapper.find("Welcome");
        welcome.prop("onClickNext")();

        expect(ipcRenderer.once).toHaveBeenCalledWith(JREInstallEvent, expect.anything());
        expect(ipcRenderer.send).toHaveBeenCalledWith(JREInstallEvent);
      });

      it("doesn't requests when this.requesting is true", () => {
        const wrapper = mount(<Installer/>);
        const welcome = wrapper.find("Welcome");
        wrapper.instance().requesting = true;
        welcome.prop("onClickNext")();

        expect(ipcRenderer.once).not.toHaveBeenCalled();
        expect(ipcRenderer.send).not.toHaveBeenCalled();
      });

      it("sets this.requesting is true while it's connecting to main process", () => {
        const wrapper = mount(<Installer/>);
        const welcome = wrapper.find("Welcome");
        expect(wrapper.instance().requesting).toBeFalsy();

        ipcRenderer.once.mockImplementation((listen, cb) => {
          expect(wrapper.instance().requesting).toBeTruthy();
          expect(wrapper.state("wait")).toBeTruthy();
          ipcRenderer.send.mockImplementation((method, arg) => {
            if (listen === method) {
              cb(null, arg);
            }
          });
        });

        welcome.prop("onClickNext")();
        expect(wrapper.instance().requesting).toBeFalsy();
        expect(wrapper.state("wait")).toBeFalsy();
      });

    });

  });

  describe(`hash is ${Hash.ChooseCloudService}`, () => {

    beforeEach(() => {
      location.hash = Hash.ChooseCloudService;
    });

    it("shows ServiceSelector component when the hash is ChooseCloudService", () => {
      const wrapper = mount(<Installer/>);
      expect(wrapper.find("ServiceSelector").exists()).toBeTruthy();
    });

    it("sets storj state true and moves to select folder screen when onSelectStorj is called", () => {
      const wrapper = mount(<Installer/>);
      expect(wrapper.state("storj")).toBeFalsy();

      wrapper.find("ServiceSelector").prop("onSelectStorj")();
      expect(location.hash).toEqual(`#${Hash.StorjSelected}`);
      expect(wrapper.state("storj")).toBeTruthy();
    });

    it("sets sia state true and moves to select folder screen when onSelectSia is called", () => {
      const wrapper = mount(<Installer/>);
      expect(wrapper.state("sia")).toBeFalsy();

      wrapper.find("ServiceSelector").prop("onSelectSia")();
      expect(location.hash).toEqual(`#${Hash.SiaSelected}`);
      expect(wrapper.state("sia")).toBeTruthy();
    });

    it("sets storj and sia state true and moves to select folder screen when onSelectBoth is called", () => {
      const wrapper = mount(<Installer/>);
      expect(wrapper.state("storj")).toBeFalsy();
      expect(wrapper.state("sia")).toBeFalsy();

      wrapper.find("ServiceSelector").prop("onSelectBoth")();
      expect(location.hash).toEqual(`#${Hash.BothSelected}`);
      expect(wrapper.state("storj")).toBeTruthy();
      expect(wrapper.state("sia")).toBeTruthy();
    });

  });

  describe(`hash is ${Hash.StorjSelected}`, () => {

    beforeEach(() => {
      location.hash = Hash.StorjSelected;
    });

    it("shows SelectFolder component for storj when the hash is StorjSelected", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      expect(selector.exists()).toBeTruthy();
      expect(selector.prop("service")).toEqual(Storj);
      expect(selector.prop("folder")).toEqual(process.env.DEFAULT_SYNC_FOLDER);
    });

    it("updates folder state when SelectFolder calls onSelectFolder", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");

      const selectedFolder = "/sample/folder";
      selector.prop("onSelectFolder")(selectedFolder);
      expect(wrapper.state("folder")).toEqual(selectedFolder);
    });

    it("sets the hash is ChooseCloudService when back button is clicked in SelectFolder component", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      selector.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.ChooseCloudService}`);
    });

    it("sets the hash is StorjLogin when the next button is clicked in SelectFolder component", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      selector.prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

  });

  describe(`hash is ${Hash.SiaSelected}`, () => {

    beforeEach(() => {
      location.hash = Hash.SiaSelected;
    });

    it("shows SelectFolder component for sia when the hash is SiaSelected", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      expect(selector.exists()).toBeTruthy();
      expect(selector.prop("service")).toEqual(Sia);
      expect(selector.prop("folder")).toEqual(process.env.DEFAULT_SYNC_FOLDER);
    });

    it("updates folder state when SelectFolder calls onSelectFolder", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");

      const selectedFolder = "/sample/folder";
      selector.prop("onSelectFolder")(selectedFolder);
      expect(wrapper.state("folder")).toEqual(selectedFolder);
    });

    it("sets the hash is ChooseCloudService when back button is clicked in SelectFolder component", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      selector.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.ChooseCloudService}`);
    });

    it("doesn't set the hash is ChooseCloudService when back button is clicked but requesting is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.instance().requesting = true;
      const selector = wrapper.find("SelectFolder");
      selector.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.SiaSelected}`);
    });

    it("sets the hash is StorjLogin when the next button is clicked in SelectFolder component", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      selector.prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.SiaWallet}`);
    });

    describe("with ipc", () => {

      it("requests wallet address and seed to Sia when onClickNext is called", () => {
        const address = "1234567890";
        const seed = "xxx xxx xxx xxx";
        ipcRenderer.once.mockImplementation((listen, cb) => {
          ipcRenderer.send.mockImplementation((method) => {
            if (listen === method) {
              cb(null, {
                address: address,
                seed: seed,
              });
            }
          });
        });

        const wrapper = mount(<Installer/>);
        const c = wrapper.find("SelectFolder");
        c.prop("onClickNext")();

        expect(ipcRenderer.once).toHaveBeenCalledWith(SiaWalletEvent, expect.anything());
        expect(ipcRenderer.send).toHaveBeenCalledWith(SiaWalletEvent);

        expect(wrapper.state("siaAccount").address).toEqual(address);
        expect(wrapper.state("siaAccount").seed).toEqual(seed);
      });

      it("doesn't requests when this.requesting is true", () => {
        const wrapper = mount(<Installer/>);
        const c = wrapper.find("SelectFolder");
        wrapper.instance().requesting = true;
        c.prop("onClickNext")();

        expect(ipcRenderer.once).not.toHaveBeenCalled();
        expect(ipcRenderer.send).not.toHaveBeenCalled();
      });

      it("sets this.requesting is true while it's connecting to main process", () => {
        const wrapper = mount(<Installer/>);
        const c = wrapper.find("SelectFolder");
        expect(wrapper.instance().requesting).toBeFalsy();

        ipcRenderer.once.mockImplementation((listen, cb) => {
          expect(wrapper.instance().requesting).toBeTruthy();
          expect(wrapper.state("wait")).toBeTruthy();
          ipcRenderer.send.mockImplementation((method) => {
            if (listen === method) {
              cb(null, {});
            }
          });
        });

        c.prop("onClickNext")();
        expect(wrapper.instance().requesting).toBeFalsy();
        expect(wrapper.state("wait")).toBeFalsy();
      });

    });

  });

  describe(`hash is ${Hash.BothSelected}`, () => {

    beforeEach(() => {
      location.hash = Hash.BothSelected;
    });

    it("shows SelectFolder component for storj and sia when the hash is BothSelected", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      expect(selector.exists()).toBeTruthy();
      expect(selector.prop("service")).toEqual(`${Storj} and ${Sia}`);
      expect(selector.prop("folder")).toEqual(process.env.DEFAULT_SYNC_FOLDER);
    });

    it("updates folder state when SelectFolder calls onSelectFolder", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");

      const selectedFolder = "/sample/folder";
      selector.prop("onSelectFolder")(selectedFolder);
      expect(wrapper.state("folder")).toEqual(selectedFolder);
    });

    it("sets the hash is ChooseCloudService when back button is clicked in SelectFolder component", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      selector.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.ChooseCloudService}`);
    });

    it("sets the hash is StorjLogin when the next button is clicked in SelectFolder component", () => {
      const wrapper = mount(<Installer/>);
      const selector = wrapper.find("SelectFolder");
      selector.prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

  });

  describe(`hash is ${Hash.StorjLogin}`, () => {

    beforeEach(() => {
      location.hash = Hash.StorjLogin;
    });

    it("shows StorjLogin component", () => {
      const wrapper = mount(<Installer/>);
      const login = wrapper.find("StorjLogin");
      expect(login.exists()).toBeTruthy();
    });

    it("updates the hash to StorjRegistration when onClickCreateAccount is called", () => {
      const wrapper = mount(<Installer/>);
      const login = wrapper.find("StorjLogin");
      login.prop("onClickCreateAccount")();
      expect(location.hash).toEqual(`#${Hash.StorjRegistration}`);
    });

    it("doesn't update the hash when onClickCreateAccount is called but requesting is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.instance().requesting = true;
      const login = wrapper.find("StorjLogin");
      login.prop("onClickCreateAccount")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("updates the hash to StorjSelected when onClickBack is called and sia state is false", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({sia: false});

      const login = wrapper.find("StorjLogin");
      login.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjSelected}`);
    });

    it("updates the hash to BothSelected when onClickBack is called and sia state is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({sia: true});

      const login = wrapper.find("StorjLogin");
      login.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.BothSelected}`);
    });

    it("doesn't update the hash when onClickBack is called but requesting is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.instance().requesting = true;
      wrapper.setState({sia: true});

      const login = wrapper.find("StorjLogin");
      login.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("updates related states when onClickFinish is called with an account information", () => {
      const email = "user@example.com";
      const password = "password";
      const key = "1234567890";

      const wrapper = mount(<Installer/>);
      const login = wrapper.find("StorjLogin");
      login.prop("onClickFinish")({
        email: email,
        password: password,
        key: key
      });
      expect(wrapper.state("storjAccount").email).toEqual(email);
      expect(wrapper.state("storjAccount").password).toEqual(password);
      expect(wrapper.state("storjAccount").key).toEqual(key);
    });

    it("updates the hash to FinishAll when onClickFinish is called and sia state is false", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({sia: false});

      const login = wrapper.find("StorjLogin");
      login.prop("onClickFinish")({
        email: "",
        password: "",
        key: "",
      });
      expect(location.hash).toEqual(`#${Hash.FinishAll}`);
    });

    it("stores selected folder and marks installer finished before moving to FinishAll screen", () => {
      const folder = "/tmp";
      const wrapper = mount(<Installer/>);
      wrapper.setState({sia: false, storj: true, folder: folder});
      const comp = wrapper.find("StorjLogin");
      comp.prop("onClickFinish")({
        email: "",
        password: "",
        key: "",
      });

      expect(storage.set).toHaveBeenCalledWith(ConfigFile, {
        syncFolder: folder,
        installed: true,
        storj: true,
        sia: false,
      }, expect.any(Function));
      expect(location.hash).toEqual(`#${Hash.FinishAll}`);
    });

    it("updates the hash to SiaWallet when onClickFinish is called and sia state is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({sia: true});

      const login = wrapper.find("StorjLogin");
      login.prop("onClickFinish")({
        email: "",
        password: "",
        key: "",
      });
      expect(location.hash).toEqual(`#${Hash.SiaWallet}`);

    });

    it("doesn't store selected folder and mark installer finished before moving to SiaWallet screen", () => {
      const folder = "/tmp";
      const wrapper = mount(<Installer/>);
      wrapper.setState({sia: true, folder: folder});
      const comp = wrapper.find("StorjLogin");
      comp.prop("onClickFinish")({
        email: "",
        password: "",
        key: "",
      });

      expect(storage.set).not.toHaveBeenCalled();
      expect(location.hash).toEqual(`#${Hash.SiaWallet}`);
    });

    describe("with ipc", () => {

      it("requests logging in to Storj when onClickFinish is called", () => {
        const email = "user@example.com";
        const password = "password";
        const key = "1234567890";

        const wrapper = mount(<Installer/>);
        const login = wrapper.find("StorjLogin");
        login.prop("onClickFinish")({
          email: email,
          password: password,
          key: key
        });

        expect(ipcRenderer.once).toHaveBeenCalledWith(StorjLoginEvent, expect.anything());
        expect(ipcRenderer.send).toHaveBeenCalledWith(StorjLoginEvent, {
          email: email,
          password: password,
          key: key
        });
      });

      it("doesn't requests when this.requesting is true", () => {
        const wrapper = mount(<Installer/>);
        const c = wrapper.find("StorjLogin");
        wrapper.instance().requesting = true;
        c.prop("onClickFinish")();

        expect(ipcRenderer.once).not.toHaveBeenCalled();
        expect(ipcRenderer.send).not.toHaveBeenCalled();
      });

      it("sets this.requesting is true while it's connecting to main process", () => {
        const wrapper = mount(<Installer/>);
        const c = wrapper.find("StorjLogin");
        expect(wrapper.instance().requesting).toBeFalsy();

        ipcRenderer.once.mockImplementation((listen, cb) => {
          expect(wrapper.instance().requesting).toBeTruthy();
          expect(wrapper.state("wait")).toBeTruthy();
          ipcRenderer.send.mockImplementation((method, arg) => {
            if (listen === method) {
              cb(null, arg);
            }
          });
        });

        c.prop("onClickFinish")();
        expect(wrapper.instance().requesting).toBeFalsy();
        expect(wrapper.state("wait")).toBeFalsy();
      });

      it("requests wallet address and seed to Sia after the login is succeeded and sia is true", () => {
        const address = "1234567890";
        const seed = "xxx xxx xxx xxx";
        ipcRenderer.once.mockImplementation((listen, cb) => {
          ipcRenderer.send.mockImplementation((method) => {
            if (listen === method) {
              cb(null, {
                address: address,
                seed: seed,
              });
            }
          });
        });

        const wrapper = mount(<Installer/>);
        wrapper.setState({sia: true});
        const c = wrapper.find("StorjLogin");
        c.prop("onClickFinish")();

        expect(ipcRenderer.once).toHaveBeenCalledWith(SiaWalletEvent, expect.any(Function));
        expect(ipcRenderer.send).toHaveBeenCalledWith(SiaWalletEvent);

        expect(wrapper.state("siaAccount").address).toEqual(address);
        expect(wrapper.state("siaAccount").seed).toEqual(seed);
      });

    });

  });

  describe(`hash is ${Hash.StorjRegistration}`, () => {

    beforeEach(() => {
      location.hash = Hash.StorjRegistration;
    });

    it("shows StorjRegistration component", () => {
      const wrapper = mount(<Installer/>);
      const registration = wrapper.find("StorjRegistration");
      expect(registration.exists()).toBeTruthy();
    });

    it("updates the hash to StorjLogin when onClickLogin is called", () => {
      const wrapper = mount(<Installer/>);
      const registration = wrapper.find("StorjRegistration");

      registration.prop("onClickLogin")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("doesn't update the hash when onClickLogin is called but requesting is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.instance().requesting = true;
      const registration = wrapper.find("StorjRegistration");

      registration.prop("onClickLogin")();
      expect(location.hash).toEqual(`#${Hash.StorjRegistration}`);
    });

    it("updates the hash to StorjSelected when onClickBack is called and sia state is false", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({sia: false});

      const registration = wrapper.find("StorjRegistration");
      registration.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjSelected}`);
    });

    it("updates the hash to BothSelected when onClickBack is called and sia state is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({sia: true});

      const registration = wrapper.find("StorjRegistration");
      registration.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.BothSelected}`);
    });

    it("doesn't update the hash when onClickBack is called but requesting is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.instance().requesting = true;
      wrapper.setState({sia: true});

      const registration = wrapper.find("StorjRegistration");
      registration.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjRegistration}`);
    });

    it("updates the hash to StorjEncryptionKey and update storjAccount state when on ClickNext is called", () => {
      const email = "user@example.com";
      const password = "password";
      const wrapper = mount(<Installer/>);

      const registration = wrapper.find("StorjRegistration");
      registration.prop("onClickNext")({
        email: email,
        password: password,
      });
      expect(wrapper.state("storjAccount").email).toEqual(email);
      expect(wrapper.state("storjAccount").password).toEqual(password);
      expect(location.hash).toEqual(`#${Hash.StorjEncryptionKey}`);
    });

    describe("with ipc", () => {

      const email = "user@example.com";
      const password = "password";
      const key = "1234567890";

      it("requests to create a Storj account when onClickNext is called", () => {
        ipcRenderer.once.mockImplementation((listen, cb) => {
          ipcRenderer.send.mockImplementation((method) => {
            if (listen === method) {
              cb(null, key);
            }
          });
        });

        const wrapper = mount(<Installer/>);
        const login = wrapper.find("StorjRegistration");
        login.prop("onClickNext")({
          email: email,
          password: password,
        });

        expect(ipcRenderer.once).toHaveBeenCalledWith(StorjRegisterationEvent, expect.anything());
        expect(ipcRenderer.send).toHaveBeenCalledWith(StorjRegisterationEvent, {
          email: email,
          password: password,
        });
        expect(wrapper.state("storjAccount").key).toEqual(key);
      });

      it("doesn't requests when this.requesting is true", () => {
        const wrapper = mount(<Installer/>);
        const c = wrapper.find("StorjRegistration");
        wrapper.instance().requesting = true;
        c.prop("onClickNext")();

        expect(ipcRenderer.once).not.toHaveBeenCalled();
        expect(ipcRenderer.send).not.toHaveBeenCalled();
      });

      it("sets this.requesting is true while it's connecting to main process", () => {
        const wrapper = mount(<Installer/>);
        const c = wrapper.find("StorjRegistration");
        expect(wrapper.instance().requesting).toBeFalsy();

        ipcRenderer.once.mockImplementation((listen, cb) => {
          expect(wrapper.instance().requesting).toBeTruthy();
          expect(wrapper.state("wait")).toBeTruthy();
          ipcRenderer.send.mockImplementation((method, arg) => {
            if (listen === method) {
              cb(null, key);
            }
          });
        });

        c.prop("onClickNext")({
          email: email,
          password: password
        });
        expect(wrapper.instance().requesting).toBeFalsy();
        expect(wrapper.state("wait")).toBeFalsy();
      });

    });

  });

  describe(`hash is ${Hash.StorjEncryptionKey}`, () => {

    beforeEach(() => {
      location.hash = Hash.StorjEncryptionKey;
    });

    it("shows StorjEncryptionKey component showing an encryption key in storjAccount.key state", () => {
      const encryptionKey = "000000-0000000-0000000000000";
      const wrapper = mount(<Installer/>);
      wrapper.setState({storjAccount: {key: encryptionKey}});

      const key = wrapper.find("StorjEncryptionKey");
      expect(key.exists()).toBeTruthy();
      expect(key.prop("encryptionKey")).toEqual(encryptionKey);
    });

    it("updates the hash to StorjRegistration when onClickBack is called", () => {
      const wrapper = mount(<Installer/>);
      const key = wrapper.find("StorjEncryptionKey");
      key.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjRegistration}`);
    });

    it("updates the hash to StorjEamilConfirmation when onClickNext is called", () => {
      const wrapper = mount(<Installer/>);
      const key = wrapper.find("StorjEncryptionKey");
      key.prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.StorjEmailConfirmation}`);
    });

  });

  describe(`hash is ${Hash.StorjEmailConfirmation}`, () => {

    beforeEach(() => {
      location.hash = Hash.StorjEmailConfirmation;
    });

    it("shows StorjEmailConfirmation component", () => {
      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("StorjEmailConfirmation");
      expect(comp.exists()).toBeTruthy();
    });

    it("updates the hash to StorjEncryptionKey when onClickBack is called", () => {
      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("StorjEmailConfirmation");
      comp.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjEncryptionKey}`);
    });

    it("updates the hash to StorjLogin when onClickLogin is called", () => {
      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("StorjEmailConfirmation");
      comp.prop("onClickLogin")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

  });

  describe(`hash is ${Hash.SiaWallet}`, () => {

    beforeEach(() => {
      location.hash = Hash.SiaWallet;
    });

    it("shows SiaWallet component with information in siaAccount state", () => {
      const address = "1234567890";
      const seed = "xxx xxx xxx xxx xxxx";
      const wrapper = mount(<Installer/>);
      wrapper.setState({
        siaAccount: {
          address: address,
          seed: seed,
        }
      });
      const comp = wrapper.find("SiaWallet");
      expect(comp.exists()).toBeTruthy();
      expect(comp.prop("address")).toEqual(address);
      expect(comp.prop("seed")).toEqual(seed);
    });

    it("updates the hash to SiaSelected when onClickBack is called and storj state is false", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({storj: false});
      const comp = wrapper.find("SiaWallet");
      comp.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.SiaSelected}`);
    });

    it("updates the hash to StorjLogin when onClickBack is called and storj state is true", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({storj: true});
      const comp = wrapper.find("SiaWallet");
      comp.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("updates the hash to SiaFinish when onClickNext is called", () => {
      const wrapper = mount(<Installer/>);
      wrapper.setState({storj: true});
      const comp = wrapper.find("SiaWallet");
      comp.prop("onClickNext")();
      expect(location.hash).toEqual(`#${Hash.SiaFinish}`);
    });

    it("stores selected folder and marks installer finished before moving to SiaFinish screen (sia only)", () => {
      const folder = "/tmp";
      const wrapper = mount(<Installer/>);
      wrapper.setState({storj: false, sia: true, folder: folder});
      const comp = wrapper.find("SiaWallet");
      comp.prop("onClickNext")();

      expect(storage.set).toHaveBeenCalledWith(ConfigFile, {
        syncFolder: folder,
        installed: true,
        storj: false,
        sia: true,
      }, expect.any(Function));
      expect(location.hash).toEqual(`#${Hash.SiaFinish}`);
    });

    it("stores selected folder and marks installer finished before moving to SiaFinish screen (both service)", () => {
      const folder = "/tmp";
      const wrapper = mount(<Installer/>);
      wrapper.setState({storj: true, sia: true, folder: folder});
      const comp = wrapper.find("SiaWallet");
      comp.prop("onClickNext")();

      expect(storage.set).toHaveBeenCalledWith(ConfigFile, {
        syncFolder: folder,
        installed: true,
        storj: true,
        sia: true,
      }, expect.any(Function));
      expect(location.hash).toEqual(`#${Hash.SiaFinish}`);
    });

  });

  describe(`hash is ${Hash.SiaFinish}`, () => {

    beforeEach(() => {
      location.hash = Hash.SiaFinish;
    });

    it("shows SiaFinish component", () => {
      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("SiaFinish");
      expect(comp.exists()).toBeTruthy();
    });

    it("updates the hash to SiaWallet when onClickBack is called", () => {
      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("SiaFinish");
      comp.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.SiaWallet}`);
    });

    it("closes the window when onClickClose is called", () => {
      const mockWindow = {
        close: jest.fn()
      };
      remote.getCurrentWindow.mockReturnValue(mockWindow);

      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("SiaFinish");
      comp.prop("onClickClose")();
      expect(remote.getCurrentWindow).toHaveBeenCalledTimes(1);
      expect(mockWindow.close).toHaveBeenCalledTimes(1);
    });

  });

  describe(`hash is ${Hash.FinishAll}`, () => {

    beforeEach(() => {
      location.hash = Hash.FinishAll;
    });

    it("shows FinishAll component", () => {
      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("Finish");
      expect(comp.exists()).toBeTruthy();
    });

    it("updates the hash to StorjLogin when onClickBack is called", () => {
      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("Finish");
      comp.prop("onClickBack")();
      expect(location.hash).toEqual(`#${Hash.StorjLogin}`);
    });

    it("closes the window when onClickClose is called", () => {
      const mockWindow = {
        close: jest.fn()
      };
      remote.getCurrentWindow.mockReturnValue(mockWindow);

      const wrapper = mount(<Installer/>);
      const comp = wrapper.find("Finish");
      comp.prop("onClickClose")();
      expect(remote.getCurrentWindow).toHaveBeenCalledTimes(1);
      expect(mockWindow.close).toHaveBeenCalledTimes(1);
    });

  });

  describe("_requestSiaWallet", () => {

    beforeEach(() => {
      ipcRenderer.once.mockClear();
      ipcRenderer.send.mockClear();
      location.hash = "";
    });

    it("requests SIA wallet information only once", () => {

      const address = "1234567890";
      const seed = "xxx xxx xxx xxx";
      ipcRenderer.once.mockImplementation((listen, cb) => {
        ipcRenderer.send.mockImplementation((method) => {
          if (listen === method) {
            cb(null, {
              address: address,
              seed: seed,
            });
          }
        });
      });

      const wrapper = shallow(<Installer/>);
      wrapper.instance()._requestSiaWallet();
      wrapper.instance()._requestSiaWallet();
      expect(ipcRenderer.once).toHaveBeenCalledTimes(1);
      expect(ipcRenderer.send).toHaveBeenCalledTimes(1);

    });

    it("moves to SiaWallet if address and seed was received", () => {
      const address = "1234567890";
      const seed = "xxx xxx xxx xxx";
      const wrapper = shallow(<Installer/>);
      wrapper.setState({
        siaAccount: {
          address: address,
          seed: seed
        }
      });
      wrapper.instance()._requestSiaWallet();
      expect(ipcRenderer.once).not.toHaveBeenCalled();
      expect(ipcRenderer.send).not.toHaveBeenCalled();
      expect(location.hash).toEqual(`#${Hash.SiaWallet}`);
    });

  });

});