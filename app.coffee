express         = require 'express'
app             = express()
http            = require 'http'
url             = require 'url'
path            = require 'path'
favicon         = require 'serve-favicon'
logger          = require('tracer').colorConsole()
morgan          = require 'morgan'
cookieParser    = require 'cookie-parser'
bodyParser      = require 'body-parser'
compression     = require 'compression'
request         = require 'request'
settings        = require './src/com/redhat/ascension/settings/settings'
Uri             = require 'jsuri'
_               = require 'lodash'
S               = require 'string'

#mongoose        = require 'mongoose'
#MongoOps        = require './src/com/redhat/ascension/db/MongoOperations'
TaskLogic       = require './src/com/redhat/ascension/rest/taskLogic'
CaseLogic       = require './src/com/redhat/ascension/rest/caseLogic'
#CaseRules       = require './src/com/redhat/ascension/rules/case/caseRules'

##########################################################
# Handle configuration
##########################################################
# Load the config file either locally or in openshift if the OPENSHIFT_DATA_DIR variable exists
env = 'development'
serverStartTime = (new Date()).getTime()
port = settings.getEnvVar('OPENSHIFT_INTERNAL_PORT') || settings.getEnvVar('OPENSHIFT_NODEDIY_PORT') || settings.getEnvVar('OPENSHIFT_NODEJS_PORT') || 3000
ipAddress = settings.getEnvVar('OPENSHIFT_NODEJS_IP') || settings.getEnvVar('OPENSHIFT_NODEDIY_IP')  || '127.0.0.1'
if process.env['OPENSHIFT_DATA_DIR']?
  env = 'production'
  logger.info "Env is Openshift/#{env}, ip: #{ipAddress} port: #{port}"
else
  logger.info "Env is #{env}, ip: #{ipAddress} port: #{port}"

app = express()
oneDay = 86400000
#server = http.Server(app)

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'jade');

app.set('ipAddress', ipAddress)
app.set('port', port)
app.use(morgan('dev'));
app.use(bodyParser.json(strict: false));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


# catch 404 and forward to error handler
#app.use (req, res, next) ->
#  err = new Error("Not Found")
#  err.status = 404
#  next err
# error handlers

# development error handler
# will print stacktrace
if app.get("env") is "dev"
  app.use (err, req, res, next) ->
    logger.error(err.stack || err)
    res.status err.status or 500
    res.render "error",
      message: err.message
      error: err

# production error handler
# no stacktraces leaked to user
app.use (err, req, res, next) ->
  logger.error(err.stack || err)
  res.status err.status or 500
  res.render "error",
    message: err.message
    error: {}

app.get "/", (req, res) ->
  res.render('index.jade', {env: env, uid: serverStartTime})

app.get "/maketasks", (req, res) ->
  opts = {}
  CaseRules.reset().then((data) ->
    res.send(data)
  , (err) ->
    res.send(err)
  )
app.get "/tasks", (req, res) ->
  opts =
    # Opt param, fetches tasks based on this user [sbrs, ect.]
    ssoUsername: req.query['ssoUsername']
    limit: _.parseInt(req.query['limit']) || 100

  TaskLogic.fetchTasks(opts).then((data) ->
    res.send(data)
  , (err) ->
    res.send(err)
  )
app.get "/cases", (req, res) ->
  roles = req.query['roles']
  if roles isnt '' and roles isnt null
    roles = _.map(req.query['roles'].split(','), (r) -> r.toUpperCase()) || []

  opts =
    # Opt param, fetches tasks based on this user [sbrs, ect.]
    ssoUsername: req.query['ssoUsername']
    limit: _.parseInt(req.query['limit']) || 100
    roles: roles

  CaseLogic.fetchCases(opts).then((data) ->
    res.send(data)
  ).catch((err) ->
    res.status(500);
    res.send({error: err.message})
  ).done()

app.get "/task/:_id", (req, res) ->
  opts =
    _id: req.params['_id']
  TaskLogic.fetchTask(opts).then((data) ->
    res.send(data)
  , (err) ->
    res.send(err)
  )

app.post "/task/:_id", (req, res) ->
  opts =
    _id: req.params['_id']
    action: req.query['action']
    userInput: req.query['userInput']
  logger.debug "Attempting to post to task: #{opts._id} with user: #{opts.userInput}"
  TaskLogic.updateTask(opts).then((data) ->
    res.send(data)
  ).catch((err) ->
    res.send(err)
  ).done()

##########################################################
# Proxy UDS requests
##########################################################
#  http://unified-ds.gsslab.rdu2.redhat.com:9100/user?where=SSO is "rhn-support-smendenh" and (isActive is true and isInGSS is true)
app.get "/case/:caseNumber/comments", (req, res) ->
  req.pipe(request("#{settings.UDS_URL}/case/#{req.params.caseNumber}/comments")).pipe(res)
app.post "/case/:caseNumber/comments/:commentType", (req, res) ->
  opts = 
    uri: "#{settings.UDS_URL}/case/#{req.params.caseNumber}/comments/#{req.params.commentType}"
    method: "POST"
    headers: req.headers
  # delete opts.headers["content-length"]
  theUrl = url.parse(opts.uri)
  logger.debug("Posting to: #{opts.uri}");
  logger.debug("with form data: #{JSON.stringify(req.body)}");
  logger.debug("with headers: #{JSON.stringify(opts.headers)}");
  # logger.debug("headers: #{JSON.stringify(req.headers)}");
  # req.pipe(request.post({url: opts.uri, headers: req.headers, form: req.body})).pipe(res)
  req.pipe(request.post({url: opts.uri, headers: opts.headers, json: req.body})).pipe(res)
app.get "/case/:caseNumber", (req, res) ->
  req.pipe(request("#{settings.UDS_URL}/case/#{req.params.caseNumber}")).pipe(res)
app.get "/user/metadata/:type", (req, res) ->
  logger.debug("type: #{req.params.type}, query: #{unescape(req.query.where)}")
  uri = settings.UDS_URL + "/user/metadata/#{req.params.type}" + "?where=" + escape(req.query.where) + "&resourceProjection=Minimal"
  logger.debug("Proxying to: #{uri}")
  req.pipe(request(uri)).pipe(res)
app.get "/user/:input", (req, res) ->
  req.pipe(request("#{settings.UDS_URL}/user/#{req.params.input}")).pipe(res)
app.get "/user", (req, res) ->
  uri = new Uri(settings.UDS_URL);
  uri.setPath("/user");
  _.each req.query, (value, key) -> uri.addQueryParam(key, unescape(value));
  logger.debug("Proxying to: " +  uri.toString());
  req.pipe(request(uri.toString())).pipe(res);

###########################################################
## Handle the redirections for the Chrome two theme
###########################################################
#if env is 'production'
  #location ~ ^/(chrome_themes|webassets|services|click|suggest)/.*$ {
  #   proxy_pass_header Server;
  #   proxy_set_header Host "access.redhat.com";
  #   proxy_pass https://access;
  #}

#  app.get /^\/(chrome_themes|webassets|services|click|suggest)\/.*$/i, (req, res) ->
#    logger.info "proxy, received request: #{req.url}"
#    logger.info "proxy, req.params : #{prettyjson.render req.params}"
#    #  redirect = /R=?(\d+)?/.test(flags) ? (typeof /R=?(\d+)?/.exec(flags)[1] !== 'undefined' ? /R=?(\d+)?/.exec(flags)[1] : 301) : false,
#    location = "https://access.redhat.com/#{req.url}"
#    logger.info "Redirecting to: #{location}"
#    res.writeHead 302, {
#      Location : location
#    }
#    res.end()

#app.get /^\/(services.*?)/i, (req, res) ->
#  logger.info "received request: #{req.url}"
#  logger.info "req.params : #{prettyjson.render req.params}"
#  #  redirect = /R=?(\d+)?/.test(flags) ? (typeof /R=?(\d+)?/.exec(flags)[1] !== 'undefined' ? /R=?(\d+)?/.exec(flags)[1] : 301) : false,
#  location = "https://access.redhat.com/#{req.url}"
#  #  res.writeHead 200, {
#  #    Host: 'access.redhat.com'
#  #  }
#  request(location).pipe(res)

##########################################################
# Handle general HTTP opens/closes/listens
##########################################################
#process.on 'exit', () ->
#  logger.info("process exiting.")
#  #app.close()
#  server.close()
#
process.on 'SIGTERM', () ->
  logger.info("SIGTERM, exiting.")
  #app.close()
  server.close()

#process.on 'uncaughtException', () ->
#  logger.info("uncaughtException, exiting.")
#  app.close()
#  server.close()

# Must specify an IP for openshift as there are other processes listening on 8080
server = undefined

#MongoOps.init({mongoDebug: true})
#db = mongoose['connection']
#db.on 'error', logger.error.bind(logger, 'connection error:')
#db.once 'open', () ->
#  MongoOps.defineCollections()
#  server = app.listen app.get('port'), app.get('ipAddress'), () ->
#    console.log "Started Express on port: #{server.address().port}"
server = app.listen app.get('port'), app.get('ipAddress'), () ->
  console.log "Started Express on port: #{server.address().port}"
##########################################################
