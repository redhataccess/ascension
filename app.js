(function() {
  var CaseRules, MongoOps, TaskLogic, Uri, app, bodyParser, compression, cookieParser, db, env, express, favicon, http, ipAddress, logger, mongoose, morgan, oneDay, path, port, request, server, serverStartTime, settings, _;

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

  Uri = require('jsuri');

  _ = require('lodash');

  mongoose = require('mongoose');

  MongoOps = require('./src/com/redhat/ascension/db/MongoOperations');

  TaskLogic = require('./src/com/redhat/ascension/rest/taskLogic');

  CaseRules = require('./src/com/redhat/ascension/rules/case/caseRules');

  env = 'development';

  serverStartTime = (new Date()).getTime();

  port = settings.getEnvVar('OPENSHIFT_INTERNAL_PORT') || settings.getEnvVar('OPENSHIFT_NODEDIY_PORT') || settings.getEnvVar('OPENSHIFT_NODEJS_PORT') || 3000;

  ipAddress = settings.getEnvVar('OPENSHIFT_NODEJS_IP') || settings.getEnvVar('OPENSHIFT_NODEDIY_IP') || '127.0.0.1';

  if (process.env['OPENSHIFT_DATA_DIR'] != null) {
    logger.info("Env is Openshift/production, ip: " + ipAddress + " port: " + port);
    env = 'production';
  }

  app = express();

  oneDay = 86400000;

  app.set('views', path.join(__dirname, 'public'));

  app.set('view engine', 'jade');

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

  app.get("/", function(req, res) {
    return res.render('index.jade', {
      env: env,
      uid: serverStartTime
    });
  });

  app.get("/maketasks", function(req, res) {
    var opts;
    opts = {};
    return CaseRules.reset().then(function(data) {
      return res.send(data);
    }, function(err) {
      return res.send(err);
    });
  });

  app.get("/tasks", function(req, res) {
    var opts;
    opts = {
      ssoUsername: req.query['ssoUsername'],
      limit: _.parseInt(req.query['limit']) || 100
    };
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

  app.get("/case/:caseNumber/comments", function(req, res) {
    return req.pipe(request("" + settings.UDS_URL + "/case/" + req.params.caseNumber + "/comments")).pipe(res);
  });

  app.get("/case/:caseNumber", function(req, res) {
    return req.pipe(request("" + settings.UDS_URL + "/case/" + req.params.caseNumber)).pipe(res);
  });

  app.get("/user/:input", function(req, res) {
    return req.pipe(request("" + settings.UDS_URL + "/user/" + req.params.input)).pipe(res);
  });

  app.get("/user", function(req, res) {
    var uql, uri;
    uql = decodeURIComponent(req.query.where);
    uri = new Uri(settings.UDS_URL).setPath('/user').setQuery('where=' + uql);
    return req.pipe(request(uri.toString())).pipe(res);
  });

  process.on('SIGTERM', function() {
    logger.info("SIGTERM, exiting.");
    return server.close();
  });

  server = void 0;

  MongoOps.init({
    mongoDebug: true
  });

  db = mongoose['connection'];

  db.on('error', logger.error.bind(logger, 'connection error:'));

  db.once('open', function() {
    MongoOps.defineCollections();
    return server = app.listen(app.get('port'), app.get('ipAddress'), function() {
      return console.log("Started Express on port: " + (server.address().port));
    });
  });

}).call(this);
