
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin  = require("mini-css-extract-plugin")
const CssMinimizerWebpackPlugin  = require("css-minimizer-webpack-plugin")
const TerserWebpackPlugin = require("terser-webpack-plugin")
const ImageMinimizerWebpackPlugin = require("image-minimizer-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin");
const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require('webpack')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')


const path = require('path')
// 获取cross-env定义的环境变量
const isProduction = process.env.NODE_ENV === 'production'
 
const getStyleLoaders = (laoders) => {
  return [isProduction?MiniCssExtractPlugin.loader:'vue-style-loader', 'css-loader', {
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
  }, laoders && {
    loader: laoders,
    options: laoders === 'sass-loader' ? {
      additionalData: `@use "@/styles/element/index.scss" as *;`,
    }:{}
  }].filter(Boolean)
}


module.exports = {
  entry: './src/main.js',
  output: {
    path:isProduction? path.resolve(__dirname,'../dist'):undefined,
    filename: isProduction?'static/js/[name].[contenthash:10].js':'static/js/[name].js',
    chunkFilename:isProduction? 'static/js/[name].[contenthash:10].chunk.js':'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[hash:10][ext][query]',
    clean:true
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
        loader: 'vue-loader',
        options: {
          // 开启vue-loader 的缓存
          cacheDirectory:path.resolve(__dirname,'../node_modules/.cache/vue-loader')
        }
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
    // new ReactRefreshWebpackPlugin(),
    isProduction && new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:10].css",
      chunkFilename:"static/css/[name].[contenthash:10].chunk.css"
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../dist'),
          globOptions: {
            // 忽略index.html文件
            ignore:["**/index.html"]
          }
        },
      ],
    }),
    new VueLoaderPlugin(),
    // cross-env 定义的环境变量是给打包工具使用的
    // definePlugin定义环境变量给源代码使用，从而解决vue3页面警告
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__:false
    }),
    // element 按需引入
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // 
    Components({
      resolvers: [ElementPlusResolver({
        // 自定义主题配置，引入sass
        importStyle: "sass",
      })],
    }),
  ].filter(Boolean),
  mode:isProduction? 'production':'development',
  devtool: isProduction? 'source-map': 'cheap-module-source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vue: {
          test: /[\\/]node_modules[\\/]vue(.*)[\\/]/,
          name: 'vue-chunk',
          priority:40,
        },
        elementPlus: {
          test: /[\\/]node_modules[\\/]element-plus[\\/]/,
          name: 'elementPlus-chunk',
          priority:30,
        },
        libs: {
          test: /[\\/]node_modules[\\/]/,
          name: 'libs-chunk',
          priority:10,
        }
      }
    },
    runtimeChunk: {
      name:(entrypoint)=>`runtime~${entrypoint.name}.js`
    },
    minimize:isProduction,
    minimizer: [
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin(),
      new ImageMinimizerWebpackPlugin({
        minimizer: {
          implementation: ImageMinimizerWebpackPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      parmas: {
                        xmlnsOrder:"alphabetical"
                      }
                    }
                  ]
                },
              ],
            ],
          },
        },
      })
    ]
  },
  resolve: {
    extensions: ['.vue', ".js", '.json'],
    // 路径别名
    alias: {
      '@':path.resolve(__dirname,'../src')
    }
  },
  devServer: {
    host: 'localhost',
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,//解决前端路由刷新404的问题
  },
  performance:false, //关闭性能分析，提升打包速度
}