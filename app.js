(function() {
  var MongoOps, TaskLogic, app, bodyParser, compression, cookieParser, db, env, express, favicon, http, ipAddress, logger, mongoose, morgan, oneDay, path, port, request, server, serverStartTime, settings;

  express = require('express');

  app = express();

  http = require('http');

  path = require('path');

  favicon = require('serve-favicon');

  logger = require('tracer').colorConsole();

  morgan = require('morgan');

  cookieParser = require('cookie-parser');

  bodyParser = require('body-parser');

  compression = require('compression');

  request = require('request');

  settings = require('./src/com/redhat/ascension/settings/settings');

  mongoose = require('mongoose');

  MongoOps = require('./src/com/redhat/ascension/db/MongoOperations');

  TaskLogic = require('./src/com/redhat/ascension/rest/taskLogic');

  env = 'development';

  if (process.env['OPENSHIFT_DATA_DIR'] != null) {
    logger.info("Env is Openshift/production, ip: " + process.env['OPENSHIFT_NODEJS_IP'] + " port: " + process.env['OPENSHIFT_NODEJS_PORT']);
    env = 'production';
  }

  serverStartTime = (new Date()).getTime();

  port = process.env['OPENSHIFT_INTERNAL_PORT'] || process.env['OPENSHIFT_NODEDIY_PORT'] || process.env['OPENSHIFT_NODEJS_PORT'] || 3000;

  ipAddress = process.env['OPENSHIFT_NODEJS_IP'] || process.env['OPENSHIFT_NODEDIY_IP'] || '127.0.0.1';

  app = express();

  oneDay = 86400000;

  app.set('ipAddress', ipAddress);

  app.set('port', port);

  app.use(morgan('dev'));

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: false
  }));

  app.use(cookieParser());

  app.use(express["static"](path.join(__dirname, 'public')));

  if (app.get("env") === "dev") {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      return res.render("error", {
        message: err.message,
        error: err
      });
    });
  }

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    return res.render("error", {
      message: err.message,
      error: {}
    });
  });

  app.get("/tasks", function(req, res) {
    var opts;
    opts = {};
    return TaskLogic.fetchTasks(opts).then(function(data) {
      return res.send(data);
    }, function(err) {
      return res.send(err);
    });
  });

  app.get("/task/:_id", function(req, res) {
    var opts;
    opts = {
      _id: req.params['_id']
    };
    return TaskLogic.fetchTask(opts).then(function(data) {
      return res.send(data);
    }, function(err) {
      return res.send(err);
    });
  });

  app.post("/task/:_id", function(req, res) {
    var opts;
    opts = {
      _id: req.params['_id'],
      action: req.query['action'],
      userInput: req.query['userInput']
    };
    logger.debug("Attempting to post to task: " + opts._id + " with user: " + opts.userInput);
    return TaskLogic.updateTask(opts).then(function(data) {
      return res.send(data);
    })["catch"](function(err) {
      return res.send(err);
    }).done();
  });

  app.get("/user/:input", function(req, res) {
    return req.pipe(request("" + settings.UDS_URL + "/user/" + req.params.input)).pipe(res);
  });

  process.on('SIGTERM', function() {
    logger.info("SIGTERM, exiting.");
    return server.close();
  });

  server = void 0;

  MongoOps.init();

  db = mongoose['connection'];

  db.on('error', logger.error.bind(logger, 'connection error:'));

  db.once('open', function() {
    MongoOps.defineCollections();
    return server = app.listen(app.get('port'), app.get('ipAddress'), function() {
      return console.log("Started Express on port: " + (server.address().port));
    });
  });

}).call(this);