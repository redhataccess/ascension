(function() {
  var ExtractTextPlugin, path, webpack;

  path = require("path");

  webpack = require("webpack");

  ExtractTextPlugin = require("extract-text-webpack-plugin");

  module.exports = function(grunt) {
    var ascensionConfig, webpackConfig;
    require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
    ascensionConfig = {
      src: "src",
      "public": "public",
      bower: "public/js/bower_components",
      react_components: "public/js/react_components",
      dist: "public/dist"
    };
    webpackConfig = {
      debug: false,
      cache: true,
      devtool: false,
      stats: {
        colors: true,
        reasons: true
      },
      entry: "./public/js/react_components/index.jsx",
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
          }
        ]
      },
      resolve: {
        extensions: ['', '.js'],
        modulesDirectories: ['web_modules', './node_modules', './public/js/bower_components']
      },
      plugins: [
        new ExtractTextPlugin("main.css", {
          allChunks: true
        }), new webpack.ProvidePlugin({
          jQuery: "jquery",
          $: "jquery"
        }), new webpack.DefinePlugin({
          ENVIRONMENT: JSON.stringify('development')
        })
      ]
    };
    grunt.initConfig({
      ascension: ascensionConfig,
      watch: {
        lessFiles: {
          files: "<%= ascension.public %>/stylesheets/ascension.less",
          tasks: ["less"]
        },
        gruntCoffee: {
          files: "Gruntfile.coffee",
          tasks: ["coffee:compileGrunt"]
        },
        appCoffee: {
          files: "app.coffee",
          tasks: ["coffee:compileApp"]
        },
        srcCoffee: {
          files: "src/**/*.coffee",
          tasks: ["newer:coffee:compileSrc"]
        },
        testCoffee: {
          files: "test/**/*.coffee",
          tasks: ["newer:coffee:compileTest"]
        }
      },
      webpack: {
        options: webpackConfig,
        dist: {
          cache: false
        },
        "build-dev": {
          devtool: "sourcemap",
          debug: true
        },
        "build-prod": {
          devtool: "sourcemap",
          debug: true,
          plugins: webpackConfig.plugins.concat(new webpack.DefinePlugin({
            ENVIRONMENT: JSON.stringify('development')
          }), new webpack.optimize.DedupePlugin(), new webpack.optimize.UglifyJsPlugin())
        }
      },
      "webpack-dev-server": {
        options: {
          webpack: webpackConfig,
          publicPath: webpackConfig.output.publicPath,
          port: 8090,
          headers: {
            "X-Custom-Header": "yes"
          },
          stats: {
            colors: true
          }
        },
        start: {
          keepAlive: true,
          webpack: {
            devtool: "eval",
            debug: true
          }
        }
      },
      less: {
        dist: {
          options: {
            paths: [],
            cleancss: true
          },
          files: {
            "<%= ascension.dist %>/ascension.min.css": "<%= ascension.public %>/stylesheets/ascension.less"
          }
        }
      },
      mochaTest: {
        test: {
          options: {
            reporter: 'spec',
            bail: true,
            require: ['coffee-script', 'chai']
          },
          src: ['test/**/*.coffee']
        }
      },
      coffee: {
        compileJoined: {
          options: {
            join: true,
            sourceMap: true
          },
          files: {
            "<%= ascension.dist %>/ascension.debug.js": ["<%= ascension.public %>/js/lib/ascension/**/*.coffee"]
          }
        },
        compileWithMaps: {
          options: {
            sourceMap: true
          },
          files: {
            'app.js': 'app.coffee',
            'mochaRunner.js': 'mochaRunner.coffee'
          }
        },
        compileApp: {
          options: {
            sourceMap: false
          },
          files: {
            'app.js': 'app.coffee'
          }
        },
        compileGrunt: {
          options: {
            sourceMap: false
          },
          files: {
            'Gruntfile.js': 'Gruntfile.coffee'
          }
        },
        compileSrc: {
          expand: true,
          cwd: 'src',
          dest: 'src',
          src: ['**/*.coffee'],
          ext: '.js',
          options: {
            runtime: 'inline',
            preserve_dirs: true,
            sourceMap: true
          }
        },
        compileTest: {
          expand: true,
          cwd: 'test',
          dest: 'test',
          src: ['**/*.coffee'],
          ext: '.js',
          options: {
            runtime: 'inline',
            preserve_dirs: true,
            sourceMap: true
          }
        },
        compileWeb: {
          expand: true,
          sourceMap: true,
          cwd: 'public/js',
          dest: 'public/js',
          src: ['**/*.coffee', '!bower_components'],
          ext: '.js',
          options: {
            runtime: 'inline',
            preserve_dirs: true
          }
        }
      },
      bump: {
        options: {
          files: ['package.json']
        }
      },
      shell: {
        npmpublish: {
          command: ['cd cjs', 'npm publish'].join('&&')
        }
      }
    });
    grunt.registerTask("release", "Releases a new minor version, pushes, and published", function(target) {
      if (!target) {
        target = "minor";
      }
      return grunt.task.run("bump-only:" + target, "build", 'bump-commit', 'shell:npmpublish');
    });
    grunt.registerTask("dev", ['coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileTest', 'coffee:compileApp', 'watch']);
    grunt.registerTask("devui", ['webpack-dev-server:start']);
    grunt.registerTask("prod", ['coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileTest', 'coffee:compileApp', "webpack:build-prod"]);
    grunt.registerTask("default", ["prod"]);
    return grunt.registerTask("test", ["mochaTest"]);
  };

}).call(this);
