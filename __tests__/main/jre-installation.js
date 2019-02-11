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

/*eslint no-console: 0*/
import jre from "node-jre";
import rimraf from "rimraf";

jest.unmock("node-jre");
jest.setTimeout(9 * 60 * 1000);

describe("JRE installation test on Windows", () => {
  if (process.platform === "win32") {
    it("installs JRE", callback => {
      rimraf(jre.jreDir(), err => {
        console.log(`Deleting JRE directory: ${err || "ok"}`);
        expect(err).toBeNull();

        jre.install(err => {
          console.log(`Installing JRE: ${err || "ok"}`);
          expect(err === null || err === "Smoketest failed.").toBeTruthy();
          callback();
        });
      });
    });
  } else {
    it("runs a dummy test on other platforms", () => {});
  }
});
