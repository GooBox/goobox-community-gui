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

/*eslint no-console: 0*/
import * as log from "electron-log";
import util from "util";
import winston from "winston";

export const initPapertrail = () => {

  // noinspection BadExpressionStatementJS
  require("winston-papertrail").Papertrail;
  const winstonPapertrail = new winston.transports.Papertrail({
    host: "logs.papertrailapp.com",
    port: Number.parseInt(process.env.PAPERTRAIL),
    program: "Goobox",
    level: "debug",
  });

  winstonPapertrail.on("error", function (err) {
    // Handle, report, or silently ignore connection errors and failures
    console.log(err);
  });

  const logger = winston.createLogger({
    transports: [winstonPapertrail]
  });

  log.transports.console = function (msg) {
    const text = util.format.apply(util, msg.data);
    console.log(`${msg.date.toISOString()} [${msg.level}] ${text}`);
    if (logger[msg.level]) {
      logger[msg.level](text);
    }
  };

};
