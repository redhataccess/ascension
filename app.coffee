express         = require 'express'
app             = express()
http            = require 'http'
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

mongoose        = require 'mongoose'
MongoOps        = require './src/com/redhat/ascension/db/MongoOperations'
TaskLogic       = require './src/com/redhat/ascension/rest/taskLogic'
CaseRules       = require './src/com/redhat/ascension/rules/case/caseRules'


# view engine setup
#app.set "views", path.join(__dirname, "views")
#app.set "view engine", "jade"


## uncomment after placing your favicon in /public
##app.use(favicon(__dirname + '/public/favicon.ico'));
#app.use logger("dev")
#app.use bodyParser.json()
#app.use bodyParser.urlencoded(extended: false)
#app.use cookieParser()
#app.use require("less-middleware")(path.join(__dirname, "public"))
#app.use express.static(path.join(__dirname, "public"))
#app.use "/", routes
##app.use "/users", users


##########################################################
# Handle configuration
##########################################################
# Load the config file either locally or in openshift if the OPENSHIFT_DATA_DIR variable exists
env = 'development'
serverStartTime = (new Date()).getTime()
port = settings.getEnvVar('OPENSHIFT_INTERNAL_PORT') || settings.getEnvVar('OPENSHIFT_NODEDIY_PORT') || settings.getEnvVar('OPENSHIFT_NODEJS_PORT') || 3000
ipAddress = settings.getEnvVar('OPENSHIFT_NODEJS_IP') || settings.getEnvVar('OPENSHIFT_NODEDIY_IP')  || '127.0.0.1'
if process.env['OPENSHIFT_DATA_DIR']?
  logger.info "Env is Openshift/production, ip: #{ipAddress} port: #{port}"
  env = 'production'
app = express()
oneDay = 86400000
#server = http.Server(app)

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'jade');

app.set('ipAddress', ipAddress)
app.set('port', port)
app.use(morgan('dev'));
app.use(bodyParser.json());
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
    res.status err.status or 500
    res.render "error",
      message: err.message
      error: err

# production error handler
# no stacktraces leaked to user
app.use (err, req, res, next) ->
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
    ssoUsername: req.query['ssoUsername'] unless (not req.query['ssoUsername']? or req.query['ssoUsername'] is '')


  TaskLogic.fetchTasks(opts).then((data) ->
    res.send(data)
  , (err) ->
    res.send(err)
  )
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
app.get "/case/:caseNumber", (req, res) ->
  req.pipe(request("#{settings.UDS_URL}/case/#{req.params.caseNumber}")).pipe(res)
app.get "/user/:input", (req, res) ->
  req.pipe(request("#{settings.UDS_URL}/user/#{req.params.input}")).pipe(res)
app.get "/user", (req, res) ->
  uql = decodeURIComponent(req.query.where)
  uri = new Uri(settings.UDS_URL).setPath('/user').setQuery('where=' + uql)
  req.pipe(request(uri.toString())).pipe(res)

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

MongoOps.init()
db = mongoose['connection']
db.on 'error', logger.error.bind(logger, 'connection error:')
db.once 'open', () ->
  MongoOps.defineCollections()
  server = app.listen app.get('port'), app.get('ipAddress'), () ->
    console.log "Started Express on port: #{server.address().port}"
##########################################################
