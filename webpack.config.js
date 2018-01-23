const path = require('path');
const webpack = require('webpack');

const WebpackShellPlugin = require('./lib');

module.exports = {
  watch: true,
  entry: path.resolve(__dirname, 'test/entry.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  /*devServer: {
    contentBase: path.resolve(__dirname, 'test')
  },*/
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' }
    ]
  },
  plugins: [
    new WebpackShellPlugin(
      {
        onBuildStart:['echo "wait sleep 20"', 'sleep 20', 'node test.js', 'echo "end node.test"'],
        onBuildEnd:['echo "Webpack End"'],
        safe: true,
        verbose: true,
        sync: true
      }
    ),
    new webpack.HotModuleReplacementPlugin()
  ]
};
