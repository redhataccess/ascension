Seq       = require 'sequelize'
_         = require 'lodash'

DbOperations = {
  'sequelize': undefined
  'tables': {
    'task': undefined
  }
}

DbOperations.generateMongoUrl = (db) ->
  o = {}
  o.host = resolveEnvVar(exports.config.mongoHost) || '127.0.0.1'
  o.port = resolveEnvVar(exports.config.mongoPort) || 27017
  # Since db is a param, attempt to resolve again it first instead of the config
  o.db = db || resolveEnvVar(exports.config.mongoDb) || 'test'
  o.user = resolveEnvVar(exports.config.mongoUser) || undefined
  o.pass = resolveEnvVar(exports.config.mongoPass) || undefined

  mongourl = undefined
  if (o.user? and o.user isnt '') and (o.pass? and o.pass isnt '')
    mongourl = "mongodb://#{o.user}:#{o.pass}@#{o.host}:#{o.port}/#{o.db}?auto_reconnect=true" #"?auto_reconnect=true"
  else
    mongourl = "mongodb://#{o.host}:#{o.port}/#{o.db}?auto_reconnect=true" #"?auto_reconnect=true"

  #logger.info "Finished generating mongo url: #{mongourl}"
  return mongourl

DbOperations.init = () ->
  DbOperations['sequelize'] = new Seq 'postgres', undefined, undefined,
    host: 'localhost'
    dialect: 'postgres'
    omitNull: true
    port: 5432
    pool:
      maxConnections: 5
      maxIdleTime: 30
    timestamps: true
    underscored: true
    freezeTableName: true

DbOperations.defineTables = () ->
  Task = DbOperations['sequelize'].define 'task',
    bid:
      type: Seq.STRING(40)

    # Type of task, i.e. case
    type:
      type: Seq.ENUM
      values: ['case', 'kcs', 'user_defined']

    # Name of task
    name:
      type: Seq.STRING(255)

    # Task collab score -- abstraction of case collab score
    score:
      type: Seq.INTEGER

    # If score is manually updated, don’t want it overriden by the automatic process
    locked:
      type: Seq.BOOLEAN

    # Optional timeout in ms that a task will assume abandoned and go back into the queue
    timeout:
      type: Seq.BIGINT

    sbrs:
      type: Seq.ARRAY(Seq.TEXT)

    tags:
      type: Seq.ARRAY(Seq.TEXT)

    # sfdc id
    owner:
      type: Seq.STRING(40)

    # Date the task was completed
    completed:
      type: Seq.DATE

    # The current state of the task
    state:
      type: Seq.ENUM
      values: ['new', 'closed', 'abandoned', 'completed', 'assigned']

    # TODO -- may not actually want this considering there are cases where we'd want to flag those cases if they
    # haven't been updated in a period of time.
    # If this task is based on a task, then need to record when the case was last updated so as to exclude
    # those cases from the SOQL in which haven't been updated
    #caseLastUpdated:
    #  type: Seq.DATE
    ,
      timestamps: true
      underscored: true
      freezeTableName: true



  DbOperations['tables']['task'] = Task

DbOperations.syncTables = (opts) ->
  DbOperations['tables']['task'].sync(opts || {force: false})


module.exports = DbOperations

if require.main is module
  DbOperations.init()
  DbOperations.defineTables()
  DbOperations.syncTables({force: true})
