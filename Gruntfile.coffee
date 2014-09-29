# See https://github.com/screeley/ember-demo-environment
path = require("path")
webpack = require("webpack")

module.exports = (grunt) ->

  # load all grunt tasks
  require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

  # configurable paths
  # See https://github.com/webpack/webpack-with-common-libs/blob/master/webpack.config.js
  ascensionConfig =
    src: "src"
    public: "public"
    bower: "public/js/bower_components"
    react_components: "public/js/react_components"
    dist: "public/dist"

  #webpackDistConfig = require('./webpack.dist.config.js')
  #webpackDevConfig = require('./webpack.config.js');

  webpackConfig =
    debug: false
    cache: true
    devtool: false
    stats:
      colors: true
      reasons: true
    #entry:
      #jquery: '<%= bower %>/jquery'
      #react: '<%= bower %>/react'
      #bootstrap: ["<%= react_components %>/index.coffee"]
      #bootstrap: "./public/js/react_components/index.js"
    entry: "./public/js/react_components/index.coffee"
#    entry:
#      jquery: "./public/js/bower_components/jquery"
#      bootstrap: [
#        #"!bootstrap-webpack!./app/bootstrap/bootstrap.config.js"
#        "<%= dist>/public/index.coffee"
#      ]
#      #react: "./app/react"

    output:
      path: path.join(__dirname, "public/dist")
      publicPath: "dist/"
      filename: "main.js"
      #chunkFilename: "[chunkhash].js"

    module:
      #preLoaders: [{
      #  test: /\.coffee$/
      #  exclude: 'node_modules'
      #  loader: 'coffee-loader'
      #}]
      loaders: [
        # required to write "require('./style.css')"
        {
          test: /\.css$/
          loader: "style-loader!css-loader"
        }
        # required for bootstrap icons
        #{
        #  test: /\.woff$/
        #  loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff"
        #}
        #{
        #  test: /\.ttf$/
        #  loader: "file-loader?prefix=font/"
        #}
        {
          test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/
          loader: "url-loader?limit=10000&minetype=application/font-woff"
        }
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/
          loader: "file-loader"
        }
        {
          test: /\.eot$/
          loader: "file-loader?prefix=font/"
        }
        {
          test: /\.svg$/
          loader: "file-loader?prefix=font/"
        }
        {
          test: /\.coffee$/
          loader: "coffee-loader"
        },
        {
          test: /\.(coffee\.md|litcoffee)$/
          loader: "coffee-loader?literate"
        }
        #{
        #  # required for react jsx
        #  test: /\.js$/
        #  loader: "jsx-loader"
        #}
        #{
        #  test: /\.jsx$/
        #  loader: "jsx-loader?insertPragma=React.DOM"
        #}
      ]

    #resolveLoader:
    #  root: path.join(__dirname, "node_modules")

    resolve:
      extensions: ['', '.js']
      #root: path.join(__dirname, "node_modules")
      modulesDirectories: ['./node_modules', './public/js/bower_components']

      alias:
#        # Bind version of jquery
        jquery: "jquery/dist/jquery"
        react: "react/react-with-addons"
#        # Bind version of jquery-ui
#        #"jquery-ui": "jquery-ui-1.10.3"
#        # jquery-ui doesn't contain a index file
#        # bind module to the complete module
#        #"jquery-ui-1.10.3$": "jquery-ui-1.10.3/ui/jquery-ui.js"

    plugins: [new webpack.ProvidePlugin(

      # Automtically detect jQuery and $ as free var in modules
      # and inject the jquery library
      # This is required by many jquery plugins
      jQuery: "jquery"
      #jquery: "jquery"
      $: "jquery"
    )]

  grunt.initConfig
    ascension: ascensionConfig
    watch:
      lessFiles:
        files: "<%= ascension.public %>/stylesheets/ascension.less"
        tasks: ["less"]

      #mainCoffeeFiles:
      #  files: "<%= ascension.public %>/js/lib/ascension/**/*.coffee"
      #  tasks: ["coffee:compileJoined"]


      #srcCoffeeFiles:
      #  files: "<%= ascension.src %>/js/lib/ascension/**/*.coffee"
      #  tasks: ["coffee:compileJoined"]

      #appCoffee:
      #  files: "app.coffee"
      #  tasks: ["coffee:compileWithMaps"]

      gruntCoffee:
        files: "Gruntfile.coffee"
        tasks: ["coffee:compileGrunt"]
      appCoffee:
        files: "app.coffee"
        tasks: ["coffee:compileApp"]
      srcCoffee:
        files: "src/**/*.coffee"
        tasks: ["newer:coffee:compileSrc"]
      webCoffee:
        files: ["public/js/**/*.coffee", "public/stylesheets/**/*.less"]
        #tasks: ["newer:coffee:compileWeb", 'webpack:build-dev']
        # On change don't need to recompile coffee/less, webpack does that for us, just need to kick webpack
        tasks: ['webpack:build-dev']
        options:
          spawn: false

    webpack:
      options: webpackConfig
      dist:
        cache: false
      #build:
      #  plugins: webpackConfig.plugins.concat(
      #      new webpack.DefinePlugin
      #        "process.env":
      #          "NODE_ENV": JSON.stringify("production")
      #      new webpack.optimize.DedupePlugin(),
      #      new webpack.optimize.UglifyJsPlugin()
      #  )
      "build-dev":
        devtool: "sourcemap"
        debug: true
        #plugins: webpackConfig.plugins.concat(
        #    new webpack.DefinePlugin
        #      "process.env":
        #        "NODE_ENV": JSON.stringify("production")
        #    new webpack.optimize.DedupePlugin(),
        #    new webpack.optimize.UglifyJsPlugin()
        #)
      "build-prod":
        devtool: "sourcemap"
        debug: true
        plugins: webpackConfig.plugins.concat(
            new webpack.DefinePlugin
              "process.env":
                "NODE_ENV": JSON.stringify("production")
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin()
        )

    less:
      dist:
        options:
          paths: []
          cleancss: true

        files:
          "<%= ascension.dist %>/ascension.min.css": "<%= ascension.public %>/stylesheets/ascension.less"

    #cssmin:
    #  dist:
    #    files:
    #      "<%= ascension.dist %>/ascension.min.css": [
    #        "<%= ascension.dist %>/ascension.css"
    #      ]

    mochaTest:
      test:
        options:
          reporter: 'spec'
          bail: true
          require: ['coffee-script', 'chai']
        src: ['test/**/*.coffee']

    coffee:
      compileJoined:
        options:
          join: true
          sourceMap: true
        files:
          "<%= ascension.dist %>/ascension.debug.js": ["<%= ascension.public %>/js/lib/ascension/**/*.coffee"]
      compileWithMaps:
        options:
          sourceMap: true
        files:
          'app.js': 'app.coffee'
          'mochaRunner.js': 'mochaRunner.coffee'
      compileApp:
        options:
          sourceMap: false
        files:
          'app.js': 'app.coffee'
      compileGrunt:
        options:
          sourceMap: false
        files:
          'Gruntfile.js': 'Gruntfile.coffee'
      compileSrc:
        expand: true
        cwd: 'src'
        dest: 'src'
        src: ['**/*.coffee']
        ext: '.js'
        options:
          runtime: 'inline'
          preserve_dirs: true
          sourceMap: true
      compileWeb:
        expand: true
        sourceMap: true
        cwd: 'public/js'
        dest: 'public/js'
        src: ['**/*.coffee', '!bower_components']
        ext: '.js'
        options:
          runtime: 'inline'
          preserve_dirs: true

  #grunt.registerTask "default", ["less",  "coffee"]
  #grunt.registerTask "prod", ["less", "coffee"]
  #grunt.registerTask "dev", ['less', 'coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileApp', 'coffee:compileWeb', "watch"]
  grunt.registerTask "dev", ['coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileApp', 'coffee:compileWeb', "watch"]
  grunt.registerTask "prod", ['coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileApp', 'coffee:compileWeb', "webpack:build-prod"]
  grunt.registerTask "default", ["prod"]
  grunt.registerTask "test", ["mochaTest"]
