const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/js/game.ts',
  devtool: 'inline-source-map',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: [path.resolve(__dirname, 'dist'), path.resolve(__dirname, 'assets')],
    port: 8080,
    open: true
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      path.resolve('./node_modules'),
      path.resolve(__dirname, 'src/js')
    ],
    alias: {
      phaser: path.resolve(__dirname, 'node_modules/phaser/dist/phaser.js'),
      Utilities: path.resolve(__dirname, 'node_modules/loglevel/dist/loglevel.js')
    }
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' },
      {
        test: /\.less$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'less-loader', options: {
            strictMath: true,
            noIeCompat: true
          }
        }]
      },
      { test: /phaser\.js$/, loader: 'expose-loader?Phaser' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      DEV: JSON.stringify(true),
    }),
    new CopyWebpackPlugin([
      { from: 'src/styles', to: 'styles' },
      { from: 'src/index.html' },
      { from: 'assets/**/*' }
    ])
  ]
};
