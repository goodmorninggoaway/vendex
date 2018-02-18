const Fs = require('fs-extra');
const Path = require('path');
const Glob = require('glob');
const { promisify } = require('util');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { CommonsChunkPlugin } = require('webpack').optimize;
const OUTPUT_PATH = Path.resolve(__dirname, 'dist');

function generateModule(resourcePath) {
  const output = `
const React = require('react');
const ReactDOM = require('react-dom');
const Page = require('${resourcePath}').default;
const AppRoot = require('../modules/layouts/AppRoot').default;

ReactDOM.render(
  React.createElement(AppRoot, null, React.createElement(Page, null, null)),
  document.getElementById('react-page'),
);
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
      entry,
      output: {
        path: OUTPUT_PATH,
        filename: '[name].js',
        // libraryTarget: 'umd',
        // library: ['vendex', '[name]'],
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
      plugins: [
        new WriteFileWebpackPlugin(),
        new CleanWebpackPlugin(OUTPUT_PATH),
        new CommonsChunkPlugin({
          name: 'vendor',
          // filename: "vendor.js"
          // (Give the chunk a different name)

          minChunks(module) {
            // this assumes your vendor imports exist in the node_modules directory
            return module.context && module.context.includes('node_modules');
          },
        }),
      ],
      // externals: {
      //   react: 'react',
      //   'react-dom': 'react-dom',
      //   'prop-types': 'prop-types',
      // },
      devtool: 'source-map',
    };
  })
  .catch(console.error);
