_                 = require 'lodash'
mongoose          = require 'mongoose'
Schema            = mongoose.Schema
logger            = require('tracer').colorConsole()
settings          = require('../settings/settings')
TaskStateEnum     = require '../rules/enums/TaskStateEnum'
TaskTypeEnum      = require '../rules/enums/TaskTypeEnum'
TaskOpEnum        = require '../rules/enums/TaskOpEnum'
prettyjson        = require 'prettyjson'

MongoOps =
  'schemas':
    'task': undefined
  'models':
    'task': undefined

MongoOps.generateMongoUrl = (db) ->

  if settings.getEnvVar('OPENSHIFT_MONGODB_DB_URL')
    return settings.getEnvVar('OPENSHIFT_MONGODB_DB_URL')
  else
    o = {}
    o.host = settings.getEnvVar('OPENSHIFT_MONGODB_DB_HOST') || '127.0.0.1'
    o.port = settings.getEnvVar('OPENSHIFT_MONGODB_DB_PORT') || 27017
    # Since db is a param, attempt to resolve again it first instead of the config
    o.db = db || 'ascension'
    o.user = settings.getEnvVar('OPENSHIFT_MONGODB_DB_USERNAME') || undefined
    o.pass = settings.getEnvVar('OPENSHIFT_MONGODB_DB_PASSWORD') || undefined

    if (o.user? and o.user isnt '') and (o.pass? and o.pass isnt '')
      mongourl = "mongodb://#{o.user}:#{o.pass}@#{o.host}:#{o.port}/#{o.db}?auto_reconnect=true" #"?auto_reconnect=true"
    else
      mongourl = "mongodb://#{o.host}:#{o.port}/#{o.db}?auto_reconnect=true" #"?auto_reconnect=true"
    #logger.debug "Finished generating mongo url: #{mongourl}"
    return mongourl

MongoOps.init = (opts) ->
  mongoDebug = opts?['mongoDebug'] || false
  testDb = opts?['testDb'] || false

  opts =
    native_parser: true
    server:
      socketOptions:
        keepAlive: 1

  if mongoDebug is true then  mongoose.set 'debug', true
  db = if testDb is true then 'ascension-test' else 'ascension'
  mongoose.connect MongoOps.generateMongoUrl(db), opts

MongoOps.defineCollections = () ->
  MongoOps['schemas']['task'] = new Schema
    bid: String

    # Task collab score -- abstraction of case collab score
    score: Number

    # Lock the entire task from updating from the continual case sync
    # TODO -- this may be inconsequential, scoreLocked may only be necessary and used
    locked:
      type: Boolean
      default: false

    # Lock just the score from updating
    scoreLocked:
      type: Boolean
      default: false

    # Optional timeout in ms that a task will assume abandoned and go back into the queue
    timeout:
      type: Number
      default: -1

    sbrs:
      type: Array
      default: []

    tags:
      type: Array
      default: []

    # sfdc id
    owner:
      id: String
      fullName: String
      email: String
      sso: String
      gss: Boolean
      superRegion: String
      timezone: String
      firstName: String
      lastName: String
      aliasName: String
      kerberos: String
      salesforce: String
      isManager: Boolean
      active: Boolean
      created: Date
      lastLogin: Date
      lastModified: Date
      outOfOffice: Boolean

    # Date the task was closed
    closed: Date

    created:
      type: Date
      default: Date.now

    # The date the task was last updated
    lastUpdated:
      type: Date
      default: Date.now

    # Type of task, i.e. case
    type:
      type: String

    #While this may be the case most of the time, probably not a safe assumption
    #default: TaskTypeEnum.CASE.name
    # Op of the task
    taskOp:
      type: String
      default: TaskOpEnum.NOOP.name

    # Defines the entity operation for example take ownership of a case, or take fts, or update a kcs
    entityOp:
      type: String
      default: TaskOpEnum.NOOP.name

    # The current state of the task
    state:
      type: String
      default: TaskStateEnum.UNASSIGNED.name

    case:
      accountNumber: String
      caseNumber: String
      collaborationScore: Number
      created: Date
      fts: Boolean
      sbt: Number
      sbrs: Array
      tags: Array
      severity: String
      status: String
      strategic: Boolean
      internalStatus: String

    # Users who have declined this task
    declinedUsers:
      id: String
      sso: String
      fullName: String
      declinedOn: Date

    # Potential users for this task
#    potentialOwners: [
#      id: String
#      sso: String
#      fullName: String
#      score: Number
#      sbrWeight: Number
#      skillWeight: Number
#      tasksOwned: Number
#      tasksOwnedWeight: Number
#    ]
    potentialOwners: []

  MongoOps['models']['task'] = mongoose.model 'Task', MongoOps['schemas']['task']


  #MongoOps['schemas']['task'].post 'validate', (doc) ->
  #  logger.debug "post validation, pre-save on doc: #{prettyjson.render doc}"

MongoOps.reset = () ->
  MongoOps['models']['task'].removeQ({})

module.exports = MongoOps

# Next I need to import all sfdc_users from unified
if require.main is module
  MongoOps.init()
  db = mongoose['connection']
  db.on 'error', logger.error.bind(logger, 'connection error:')
  db.once 'open', () ->
    MongoOps.defineCollections()
    process.exit()
