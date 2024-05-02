const Fs = require('fs-extra');
const Path = require('path');
const Glob = require('glob');
const { promisify } = require('util');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OUTPUT_PATH = Path.resolve(__dirname, 'dist');
require('dotenv').config();
const { EnvironmentPlugin } = require('webpack');

function generateModule(resourcePath) {
  const output = `
const React = require('react');
const ReactDOM = require('react-dom');
const Page = require('${resourcePath.replace(/\\/g, "/")}').default;
const AppRoot = require('../modules/layouts/AppRoot').default;

ReactDOM.render(React.createElement(AppRoot, window.vendexBootstrap, Page), document.getElementById('react-page'));
`;

  return output;
}

const TMP_DIR = Path.resolve(__dirname, './tmp');
const SRC_DIR = Path.resolve(__dirname, './pages');

async function generatePageWrapper() {
  await Fs.remove(TMP_DIR);
  await Fs.ensureDir(TMP_DIR);

  const files = await promisify(Glob)('**/*.js', {
    cwd: SRC_DIR,
  });

  for (const index in files) {
    const file = files[index];
    const srcPath = Path.resolve(SRC_DIR, file);
    const moduleContent = generateModule(srcPath);
    const destPath = Path.resolve(TMP_DIR, file);
    await Fs.outputFile(destPath, moduleContent);
  }

  return files;
}

function generateEntry(files) {
  return files.reduce((memo, file) => {
    const moduleName = file.replace('.js', '');
    memo[moduleName] = Path.resolve(TMP_DIR, file);
    return memo;
  }, {});
}

module.exports = generatePageWrapper()
  .then(generateEntry)
  .then(entry => {
    return {
      // TODO: Determine env dynamically
      mode: 'development',
      entry,
      devServer: {
        devMiddleware: {
          writeToDisk: true,
        },
      },
      output: {
        path: OUTPUT_PATH,
        filename: '[name].js',
      },
      module: {
        rules: [
          { 
            test: /\.js$/,
            use: { 
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: "defaults" }]
                ]
              }
            }, 
            exclude: /node_modules/
          },
          { 
            test: /\.jsx$/,
            use: { 
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: "defaults" }]
                ]
              }
            }, 
            exclude: /node_modules/ 
          },
        ],
      },
      optimization: {
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
            },
          },
        },
      },
      resolve: {
        extensions: ['.jsx', '.js', '.json'],
      },
      context: Path.resolve(__dirname),
      plugins: [
        new CleanWebpackPlugin(),
        new EnvironmentPlugin(['TH_URL', 'TH_CLIENT_ID']),
      ],
      devtool: 'source-map',
    };
  })
  .catch(console.error);
