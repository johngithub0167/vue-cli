
const { DefinePlugin } = require('webpack')
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { VueLoaderPlugin } = require('vue-loader')


const path = require('path')

 
const getStyleLoaders = (laoders) => {
  return ['vue-style-loader', 'css-loader', {
    // 处理css 兼容性问题
    // 配合packgage.json中的browserslist来指定兼容性
    loader: 'postcss-loader',
    options: {
      postcssOptions: { 
        plugins: [
          'postcss-preset-env',
        ]
      } 
    }
  },laoders].filter(Boolean)
}


module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename:'static/media/[hash:10][ext][query]',
  },
  module: {
    rules: [
      //处理css
      {
        test: /\.css$/,
        use: getStyleLoaders()
      },   
      {
        test: /\.less$/,
        use: getStyleLoaders('less-loader')
      },
      {
        test: /\.s[ac]ss$/,
        use:  getStyleLoaders('sass-loader')
      },
      {
        test: /\.styl$/,
        use: getStyleLoaders('stylus-loader')
      },
      // 处理图片
      {
        test: /\.(jpe?g|png|gif|webp|svg)/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize:10 * 1024
          },

        }
      },
      // 处理其他资源
      {
        test: /\.(woff2?|ttf)/,
        type:"asset/resource"
      },
      // 处理js
      {
        test: /\.js$/,
        include: path.resolve(__dirname, '../src'),
        loader: "babel-loader",
        options: {
          cacheDirectory: true, //开启缓存
          cacheCompression: false, //是否缓存压缩  开发环境不需要
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  // 处理html

  plugins: [
    new EslintWebpackPlugin({
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules',
      cache: true,
      cacheLocation: path.resolve(__dirname,'../node_modules/.cache/.eslintcache') 
    }),
    new HtmlWebpackPlugin({
      template:path.resolve(__dirname,'../public/index.html')
    }),
    new VueLoaderPlugin(),
    // cross-env 定义的环境变量是给打包工具使用的
    // definePlugin定义环境变量给源代码使用，从而解决vue3页面警告
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__:false
    })
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: {
      name:(entrypoint)=>`runtime~${entrypoint.name}.js`
    }
  },
  resolve: {
    extensions:['.vue',".js",'.json']
  },
  devServer: {
    host: 'localhost',
    port: 3001,
    hot: true,
    open: true,
    historyApiFallback: true,//解决前端路由刷新404的问题
  }
}