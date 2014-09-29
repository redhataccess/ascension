(function() {
  var path, webpack;

  path = require("path");

  webpack = require("webpack");

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
      entry: "./public/js/react_components/index.coffee",
      output: {
        path: path.join(__dirname, "public/dist"),
        publicPath: "dist/",
        filename: "main.js"
      },
      module: {
        loaders: [
          {
            test: /\.css$/,
            loader: "style-loader!css-loader"
          }, {
            test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "url-loader?limit=10000&minetype=application/font-woff"
          }, {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "file-loader"
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
          }
        ]
      },
      resolve: {
        extensions: ['', '.js'],
        modulesDirectories: ['./node_modules', './public/js/bower_components'],
        alias: {
          jquery: "jquery/dist/jquery",
          react: "react/react-with-addons"
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          jQuery: "jquery",
          $: "jquery"
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
        webCoffee: {
          files: ["public/js/**/*.coffee", "public/stylesheets/**/*.less"],
          tasks: ['webpack:build-dev'],
          options: {
            spawn: false
          }
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
      }
    });
    grunt.registerTask("dev", ['less', 'coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileApp', 'coffee:compileWeb', "watch"]);
    grunt.registerTask("prod", ["less"]);
    grunt.registerTask("default", ["prod"]);
    return grunt.registerTask("test", ["mochaTest"]);
  };

}).call(this);