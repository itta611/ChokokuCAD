
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    app: path.join(__dirname, 'src/main.js'),
    parallax: path.join(__dirname, 'src/parallax.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
  },
  resolve: {
    alias: {
      'three/OrbitControls': path.join(__dirname, '/node_modules/three/examples/js/controls/OrbitControls.js'),
      'three/GLTFLoader': path.join(__dirname, '/node_modules/three/examples/js/loaders/GLTFLoader.js'),
      'three/GLTFExporter': path.join(__dirname, '/node_modules/three/examples/js/exporters/GLTFExporter.js'),
      'ThreeBSP': path.join(__dirname, '/node_modules/threebsp/index.js')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: './favicon.ico',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: 'static',
          from: '**', to: 'static/'
        }
      ]
    }),
    new webpack.ProvidePlugin({
      THREE: 'three/build/three',
      paper: 'paper/dist/paper-full'
    }),
    new WebpackManifestPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000
  },
};
