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

"use strict";
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = [{
  mode: "development",
  target: "electron-main",
  node: {
    __dirname: false,
    __filename: false
  },
  entry: {
    "main/startup": "./src/main/startup.js",
  },
  resolve: {
    extensions: [".js"]
  },
  externals: [{
    "about-window": "commonjs about-window",
    "node-jre": "commonjs node-jre",
    "node-notifier": "commonjs node-notifier"
  }],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: "babel-loader",
    }, {
      exclude: /node_modules/,
      test: /\.svg$/,
      use: [{
        loader: "svg-url-loader",
        options: {
          noquotes: true
        }
      }]
    }],
  },
  output: {
    path: path.join(__dirname, "lib"),
    filename:
      "[name].js"
  },
  devtool: "source-map"
}, {
  mode: "development",
  target: "electron-renderer",
  node: {
    __dirname: false,
    __filename: false
  },
  entry: {
    "render/main": "./src/render/popup/index.js",
    "render/installer": "./src/render/installer/index.js",
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  externals: [{
    "about-window": "commonjs about-window"
  }],
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.jsx?$/,
      loader: "babel-loader"
    }, {
      exclude: /node_modules/,
      test: /\.svg$/,
      use: [{
        loader: "svg-url-loader",
        options: {
          noquotes: true
        }
      }]
    }]
  },
  output: {
    path: path.join(__dirname, "lib"),
    filename:
      "[name].js"
  },
  devtool: "source-map"
}, {
  mode: "development",
  entry: {
    "installer": "./src/installer.css",
    "popup": "./src/popup.css",
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        // fallback: "style-loader",
        use: "css-loader"
      })
    }],
  },
  output: {
    path: path.join(__dirname, "lib"),
    filename:
      "[name].css.js"
  },
  plugins: [
    new ExtractTextPlugin("./[name].css")
  ]
}];
