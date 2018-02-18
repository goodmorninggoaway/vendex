const Path = require('path');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const OUTPUT_PATH = Path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    AppRoot: './modules/layouts/AppRoot.jsx',
    UserList: './modules/user/UserList.jsx',
    AcceptInvitation: './modules/auth/AcceptInvitation.jsx',
    InvitationSuccess: './modules/auth/InvitationSuccess.jsx',
    Login: './modules/auth/Login.jsx',
  },
  output: {
    path: OUTPUT_PATH,
    filename: '[name].js',
    libraryTarget: 'umd',
    library: ['vendex', '[name]'],
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  context: Path.resolve(__dirname),
  plugins: [new WriteFileWebpackPlugin(), new CleanWebpackPlugin(OUTPUT_PATH)],
  externals: {
    React: 'react',
    ReactDOM: 'react-dom',
    // PropTypes: 'prop-types',
  },
  devtool: 'source-map',
};
