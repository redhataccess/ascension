path = require("path");
webpack = require('webpack');

module.exports = function (config) {
    config.set({

        basePath: '',

        frameworks: [
            'mocha',
            'chai',
            'sinon'
        ],

        files: [
            'test/com/redhat/ascension/task/*.js'
        ],

        preprocessors: {
            'test/com/redhat/ascension/task/*.js': ['webpack']
        },
        webpack:{
            devtool: "sourcemap",
            stats: {
                colors: true,
                reasons: true
            },
            output: {
                path: path.join(__dirname, "public/dist"),
                publicPath: "http://localhost:8090/assets/",
                filename: "main.js"
            },
            externals: {
                "jquery": "jQuery"
            },
            module: {
                loaders: [
                    {
                        test: /\.less$/,
                        loaders: ['style-loader', 'css-loader', 'less-loader']
                    }, {
                        test: /\.css$/,
                        loader: "style-loader!css-loader"
                    }, {
                        test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                        loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff"
                    }, {
                        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                        loader: "file-loader?prefix=font/"
                    }, {
                        test: /\.eot$/,
                        loader: "file-loader?prefix=font/"
                    }, {
                        test: /\.svg$/,
                        loader: "file-loader?prefix=font/"
                    }, {
                        test: /\.coffee$/,
                        loader: "coffee-loader"
                    }, {
                        test: /\.(coffee\.md|litcoffee)$/,
                        loader: "coffee-loader?literate"
                    }, {
                        test: /\.jsx$/,
                        loader: "jsx-loader?harmony"
                    },{
                        test: /\.json$/,
                        loader: "json-loader"
                    }

                ]
            },
            node: {
                net: "empty",
                tls: "empty"
            },
            resolve: {
                extensions: ['', '.js'],
                modulesDirectories: ['web_modules', './node_modules', './public/js/bower_components']
            },
            plugins: [
                new webpack.ProvidePlugin({
                    jQuery: "jquery",
                    $: "jquery"
                })
            ]
        },

        webpackServer:{
            stats: {
                colors: true
            },
            webpack: {
                devtool: "eval"
            }
        },
        webpackPort: 8090,

        plugins: [
            require("karma-webpack"),
            require("karma-mocha"),
            require("karma-chai"),
            require("karma-sinon"),
            require("karma-phantomjs-launcher"),
            require("karma-chrome-launcher")
        ],
        reporters: ['progress'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['Chrome'],

        captureTimeout: 60000,

        singleRun: false
    });
};

