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

"use strict";
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const configs = [
  {
    mode: "development",
    target: "electron-main",
    node: {
      __dirname: false,
      __filename: false,
    },
    entry: {
      "main/index": "./src/main/index.js",
    },
    resolve: {
      extensions: [".js"],
    },
    externals: [
      {
        "about-window": "commonjs about-window",
        "node-jre": "commonjs node-jre",
        "node-notifier": "commonjs node-notifier",
      },
    ],
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          exclude: /node_modules/,
          test: /\.svg$/,
          use: [
            {
              loader: "svg-url-loader",
              options: {
                noquotes: true,
              },
            },
          ],
        },
      ],
    },
    output: {
      path: path.join(__dirname, "lib"),
      filename: "[name].js",
    },
    devtool: "source-map",
  },
  {
    mode: "development",
    target: "electron-renderer",
    node: {
      __dirname: false,
      __filename: false,
    },
    entry: {
      "render/popup": "./src/render/popup/index.js",
      "render/installer": "./src/render/installer/index.js",
      "render/logviewer": "./src/render/logviewer/index.jsx",
    },
    resolve: {
      extensions: [".js", ".jsx", ".css"],
    },
    externals: [
      {
        "about-window": "commonjs about-window",
      },
    ],
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.jsx?$/,
          loader: "babel-loader",
        },
        {
          exclude: /node_modules/,
          test: /\.svg$/,
          use: [
            {
              loader: "svg-url-loader",
              options: {
                noquotes: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          exclude: "/node_modules/",
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    output: {
      path: path.join(__dirname, "lib"),
      filename: "[name].js",
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Goobox Installer",
        filename: "installer.html",
        chunks: ["render/installer"],
      }),
      new HtmlWebpackPlugin({
        title: "Goobox",
        filename: "popup.html",
        chunks: ["render/popup"],
      }),
      new HtmlWebpackPlugin({
        title: "Goobox Log File Viewer",
        filename: "logviewer.html",
        chunks: ["render/logviewer"],
      }),
    ],
    devtool: "source-map",
  },
];

module.exports = (env, argv) => {
  if (argv.mode === "production") {
    configs.forEach(c => (c.devtool = false));
  }
  return configs;
};
