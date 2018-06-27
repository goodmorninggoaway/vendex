const Fs = require('fs-extra');
const Path = require('path');
const Glob = require('glob');
const { promisify } = require('util');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OUTPUT_PATH = Path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    index: './index.js',
    login: './login.js',
  },
  output: {
    path: OUTPUT_PATH,
    filename: '[name].js',
    publicPath: '/ui',
  },
  module: {
    rules: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  context: Path.resolve(__dirname),
  plugins: [
    new WriteFileWebpackPlugin(),
    new CleanWebpackPlugin(OUTPUT_PATH),
    new HtmlWebpackPlugin({
      title: 'Vendex',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      title: 'Vendex',
      chunks: ['login'],
      filename: 'login.html',
    }),
  ],
  devtool: 'source-map',
};
