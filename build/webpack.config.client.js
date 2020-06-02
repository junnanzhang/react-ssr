const webpack = require('webpack')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const webpackMerge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const isDev = process.env.NODE_ENV === 'development'

const config = webpackMerge(baseConfig ,{
    mode: 'development',
    entry: {
        app: path.join(__dirname, '../client/app.js')
    },
    output: {
        filename: '[name].[hash].js',
        // path: path.join(__dirname, '../dist'),  使用了webpack merge
        // publicPath: '/public/'  //后面的斜杠为了使用Hot module replacement通知 路径正确public/0.9d0bf2736f1094804ef7.hot-update.js
    },

    plugins: [
        new htmlWebpackPlugin({
            template: path.join(__dirname, '../client/template.html')
        })
    ]
});

if(isDev) {
    config.entry = {
        app: [
            'react-hot-loader/patch',
            path.join(__dirname, '../client/app.js')
        ]
    }
    config.devServer = {
        host: '0.0.0.0',
        port: '8888',
        contentBase: path.join(__dirname, '../dist'),
        hot: true,
        overlay: {
            errors: true
        },
        publicPath: '/public',
        historyApiFallback: {
            index:'/public/index.html'
        }
    }
    config.plugins.push(new webpack.HotModuleReplacementPlugin())
}
module.exports = config;
