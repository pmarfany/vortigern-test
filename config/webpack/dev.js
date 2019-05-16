var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var ManifestPlugin = require('webpack-manifest-plugin');
var ReactLoadableSSRAddon = require("react-loadable-ssr-addon");
var getEnv = require('./utils/getEnv');

var config = {
  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',
  mode: getEnv(),

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [path.resolve(__dirname), 'node_modules', 'app', 'app/redux'],
  },

  entry: {
    app: [
      'webpack-hot-middleware/client?reload=true',
      './src/client.tsx',
    ]
  },

  output: {
    path: path.resolve('./build/public'),
    publicPath: '/public/',
    filename: 'js/[name].js',
    pathinfo: true
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-typescript",
              "@babel/preset-react",
              ["@babel/preset-env",
                {
                  "targets": {
                    "browsers": ["last 2 versions"],
                  },
                },
              ],
            ],
            plugins: [
              require("@babel/plugin-transform-modules-commonjs").default,
              require("@babel/plugin-proposal-object-rest-spread").default,
              require("@babel/plugin-syntax-dynamic-import").default,
              require("@babel/plugin-transform-runtime").default,
              require("react-loadable/babel").default,
              require("react-hot-loader/babel"),
            ],
          },
        },
      },
      {
        test: /\.(ts|tsx)?$/,
        exclude: /node_modules/,
        use: ['ts-loader']
      },
      {
        test: /\.css$/,
        include: path.resolve('./src/app'),
        use: [
          'style-loader',
          'css-loader?modules&importLoaders=2&localIdentName=[local]___[hash:base64:5]',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('stylelint')({ files: '../../src/app/*.css' }),
                require('postcss-cssnext')(),
                require('postcss-assets')({ relative: true })
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: path.resolve('./src/app'),
        use: ['style-loader', 'css-loader']
      },

      {
        test: /\.eot(\?.*)?$/,
        use: 'file-loader?name=fonts/[hash].[ext]'
      },
      {
        test: /\.(woff|woff2)(\?.*)?$/,
        use: 'file-loader?name=fonts/[hash].[ext]'
      },
      {
        test: /\.ttf(\?.*)?$/,
        use: 'url-loader?limit=10000&mimetype=application/octet-stream&name=fonts/[hash].[ext]'
      },
      {
        test: /\.svg(\?.*)?$/,
        use: 'url-loader?limit=10000&mimetype=image/svg+xml&name=fonts/[hash].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: 'url-loader?limit=1000&name=images/[hash].[ext]'
      }
    ]
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        tslint: { failOnHint: true },
      }
    }),
    new ManifestPlugin({
      fileName: '../manifest.json'
    }),
    new ReactLoadableSSRAddon({
      filename: "../assets-manifest.json",
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
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
