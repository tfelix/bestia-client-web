const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './js/game.ts',
  devtool: 'source-map',
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./js')
    ],
    alias: {
      phaser: path.resolve(__dirname, 'node_modules/phaser/dist/phaser.js'),
      Utilities: path.resolve(__dirname, 'node_modules/loglevel/dist/loglevel.js')
    }
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' },
      { test: /phaser\.js$/, loader: 'expose-loader?Phaser' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      DEV: JSON.stringify(false),
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new UglifyJSPlugin({
      sourceMap: true
    }),
    new CopyWebpackPlugin([
      'index.html',
      { from: 'styles', to: 'build/styles' },
      { from: 'assets', to: 'build/assets' }
    ])
  ]
};
