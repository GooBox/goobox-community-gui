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

import electronLog from "electron-log";
import {createLogger as _createLogger} from "redux-logger";

jest.mock("redux-logger");

describe("logger", () => {
  let env;
  beforeAll(() => {
    env = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = env;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("development", () => {
    beforeAll(() => {
      process.env.NODE_ENV = "development";
    });

    it("invokes createLogger without parameters", () => {
      const {createLogger} = require("../../src/render/logger");
      createLogger();
      expect(_createLogger).toHaveBeenCalledWith();
    });
  });

  describe("production", () => {
    beforeAll(() => {
      process.env.NODE_ENV = "production";
    });

    it("invokes createLogger without parameters", () => {
      const {createLogger} = require("../../src/render/logger");
      createLogger();
      expect(_createLogger).toHaveBeenCalledWith({
        logger: {
          log: electronLog.silly,
          colors: {
            title: false,
            prevState: false,
            action: false,
            nextState: false,
            error: false,
          },
          diff: true,
          collapsed: true,
        },
      });
    });
  });
});
