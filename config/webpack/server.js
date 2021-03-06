var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var getEnv = require('./utils/getEnv');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

var config = {
  externals: nodeModules,
  target: 'node',
  mode: getEnv(),

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [path.resolve(__dirname), 'node_modules', 'app', 'app/redux'],
  },

  entry: './src/server.tsx',

  output: {
    path: path.resolve('./build/public'),
    filename: '../server.js',
    publicPath: '/public/',
    libraryTarget: 'commonjs2'
  },

  module: {
    rules: [{
        test: /\.(jpe?g|png|gif)$/i,
        use: 'url-loader?limit=1000&name=images/[hash].[ext]'
      },
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              require('@babel/plugin-syntax-dynamic-import').default,
              require('react-loadable/babel').default,
            ],
          }
        }
      },
      {
        test: /\.(ts|tsx)?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "file-loader"
      },
      {
        test: /\.css$/,
        use: [
          'isomorphic-style-loader',
          'css-loader?modules&importLoaders=2&localIdentName=[local]___[hash:base64:5]'
        ]
      }
    ]
  },

  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  }
};

const copySync = (src, dest, overwrite) => {
  if (overwrite && fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }
  const data = fs.readFileSync(src);
  fs.writeFileSync(dest, data);
}

const createIfDoesntExist = dest => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
}

createIfDoesntExist('./build');
createIfDoesntExist('./build/public');
copySync('./src/favicon.ico', './build/public/favicon.ico', true);

module.exports = config;
