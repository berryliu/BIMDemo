const webpack = require('webpack');
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const pageConfig = require('./page.config.js');

let webpackConfig = {
  mode: 'none',
  // 配置入口  
  entry: {},
  // 配置出口  
  output: {
    path: path.join(__dirname, "./dist/"),
    filename: 'static/js/[name].[hash:7].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-withimg-loader',
        include: [path.join(__dirname, "./src")],
        options: {
          limit: 10000,
          name: 'static/img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, "./src")]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/fonts/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ],
      },
      {
        test: /\.gz$/,
        enforce: 'pre',
        use: 'gzip-loader'
      }
    ]
  },
  plugins: [
    //设置每一次build之前先删除dist  
    new CleanWebpackPlugin(
      ['dist/*',],　     //匹配删除的文件  
      {
        root: __dirname,   //根目录
        verbose: true,    //开启在控制台输出信息
        dry: false     //启用删除文件
      }
    ),
    new CopyPlugin([
      { from: path.join(__dirname, './lib'), to: path.join(__dirname, "./dist") }
    ]),
  ],
  // 起本地服务
  devServer: {
    contentBase: "./dist",
    historyApiFallback: true,
    inline: true,
    hot: true,
    host: '127.0.0.1',
    clientLogLevel: 'error',
    compress: true,
    before (app, server) {
      app.get('*', function(req, res, next) {
        if (req.path.indexOf(".gz") > -1) {
          res.setHeader("Content-Encoding", "gzip");
        }
        next()
      })
      server._watch(__dirname + '/src/pages')
    }
  }
};

if (pageConfig && Array.isArray(pageConfig)) {
  pageConfig.map(page => {
    webpackConfig.entry[ page.name ] = `./src/pages/${page.jsEntry}`;
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
      filename: path.join(__dirname, `/dist/${page.name}.html`),
      template: path.join(__dirname, `/src/pages/${page.html}`),
      inject: true,
      chunks: [page.name],
      inlineSource: '.(js|css)$',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      chunksSortMode: 'dependency'
    }))
  })
}

module.exports = webpackConfig;