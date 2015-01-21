# See https://github.com/screeley/ember-demo-environment
path              = require("path")
webpack           = require("webpack")
ExtractTextPlugin = require("extract-text-webpack-plugin")

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
    entry: "./public/js/react_components/index.jsx"
    # inline mode, but serves over http which won't work, we'd need https.
    # https://github.com/webpack/webpack-dev-server/issues/11
    # entry: ["webpack-dev-server/client?http://localhost:8090", "./public/js/react_components/index.jsx"]

    output:
      path: path.join(__dirname, "public/dist")
      publicPath: "http://localhost:8090/assets/"
      filename: "main.js"

    # So for whatever reason, including jquery in bower_components simply is not working with webpack.  I can't even
    # require jquery even though I can use $, maybe some optimization filter?  What I do know is using it externally
    # Actually works perfect.
    externals: {
      # require("jquery") is external and available
      #/  on the global var jQuery
      "jquery": "jQuery"
    }

    module:
      #preLoaders: [{
      #  test: /\.coffee$/
      #  exclude: 'node_modules'
      #  loader: 'coffee-loader'
      #}]
      loaders: [
        #//require("style!css!less!../../stylesheets/main.less");
        {
          test: /\.less$/
          # https://github.com/webpack/extract-text-webpack-plugin
#          loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader", {publicPath: 'http://localhost:8090/assets/'})
          loaders: ['style-loader', 'css-loader', 'less-loader']
        }
        # required to write "require('./style.css')"
        {
          test: /\.css$/
          loader: "style-loader!css-loader"
        }
        # required for bootstrap icons
        {
          test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/
          loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff"
        }
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/
          loader: "file-loader?prefix=font/"
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
          test: /\.png$/
          loader: "file-loader"
        }
        {
          test: /\.coffee$/
          loader: "coffee-loader"
        },
        {
          test: /\.(coffee\.md|litcoffee)$/
          loader: "coffee-loader?literate"
        }
        {
          test: /\.jsx$/
#          loaders: ["6to5", "jsx-loader?harmony"]
          loader: "jsx-loader?harmony"
        }
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
      # https://github.com/webpack/webpack-dev-server/issues/60  'web_modules' required for inline mode
      modulesDirectories: ['web_modules', './node_modules', './public/js/bower_components']
#      modulesDirectories: [path.join(__dirname, "node_modules"), path.join(__dirname, 'public/js/bower_components')]

#      alias:
      #  # Bind version of jquery
      #  jquery: "jquery/dist/jquery"
      # Don't want to do this with React .12
#        'react': "react/react"

    plugins: [
      new ExtractTextPlugin("main.css", {
        allChunks: true
      }),
      new webpack.ProvidePlugin(

        # Automtically detect jQuery and $ as free var in modules
        # and inject the jquery library
        # This is required by many jquery plugins
        jQuery: "jquery"
        #jquery: "jquery"
        $: "jquery")
      #new webpack.DefinePlugin
      #  ENVIRONMENT: JSON.stringify('development')
    ]

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
      testCoffee:
        files: "test/**/*.coffee"
        tasks: ["newer:coffee:compileTest"]
#      webCoffee:
#        files: ["public/js/**/*.coffee", "public/stylesheets/**/*.less"]
#        #tasks: ["newer:coffee:compileWeb", 'webpack:build-dev']
#        # On change don't need to recompile coffee/less, webpack does that for us, just need to kick webpack
#        tasks: ['webpack:build-dev']
#        options:
#          spawn: false

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
        debug: false
        plugins: webpackConfig.plugins.concat(
            new webpack.DefinePlugin
              ENVIRONMENT: JSON.stringify('production')
            new webpack.optimize.DedupePlugin()
            new webpack.optimize.UglifyJsPlugin()
        )

    "webpack-dev-server":
      options:
        webpack: webpackConfig
        publicPath: webpackConfig.output.publicPath
        #publicPath: "/assets"
        #publicPath: "/assets/"
        port: 8090
        headers: { "X-Custom-Header": "yes" }
        stats: { colors: true }
      start:
        keepAlive: true
        webpack:
          devtool: "eval"
          debug: true
          plugins: webpackConfig.plugins.concat(
            new webpack.DefinePlugin
              ENVIRONMENT: JSON.stringify('development')
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
      compileTest:
        expand: true
        cwd: 'test'
        dest: 'test'
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

    bump:
      options:
        files: ['package.json']

    shell:
      npmpublish:
        command: [
          'cd cjs'
          'npm publish'
        ].join('&&')

  grunt.registerTask "release", "Releases a new minor version, pushes, and published", (target) ->
    target = "minor" unless target
    grunt.task.run "bump-only:#{target}", "build", 'bump-commit', 'shell:npmpublish'

  #grunt.registerTask "default", ["less",  "coffee"]
  #grunt.registerTask "prod", ["less", "coffee"]
  #grunt.registerTask "dev", ['less', 'coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileApp', 'coffee:compileWeb', "watch"]
  #grunt.registerTask "dev", ['coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileApp', 'coffee:compileWeb', "watch"]
  grunt.registerTask "dev", ['coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileTest', 'coffee:compileApp', 'watch']
  grunt.registerTask "devui", ['webpack-dev-server:start']
  # For now let's go with webpack:build-dev because build-prod takes forever
  grunt.registerTask "prod", ['coffee:compileGrunt', 'coffee:compileSrc', 'coffee:compileTest', 'coffee:compileApp', "webpack:build-prod"]
  grunt.registerTask "default", ["prod"]
  grunt.registerTask "test", ["mochaTest"]
