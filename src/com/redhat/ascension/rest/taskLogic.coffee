fs                = require 'fs'
logger            = require('tracer').colorConsole()
settings          = require '../settings/settings'
prettyjson        = require 'prettyjson'
_                 = require 'lodash'
moment            = require 'moment'
Q                 = require 'q'
MongoOps          = require '../db/MongoOperations'
mongoose          = require 'mongoose'
mongooseQ         = require('mongoose-q')(mongoose)
TaskActionsEnum   = require './enums/taskActionsEnum'
TaskStateEnum     = require '../rules/enums/TaskStateEnum'
TaskOpEnum        = require '../rules/enums/TaskOpEnum'
request           = require 'request'
ObjectId          = mongoose.Types.ObjectId

UserLogic         = require './userLogic'

TaskLogic = {}

TaskLogic.fetchTasks = (opts) ->

  if opts?.ssoUsername?
    deferred = Q.defer()
    uql =
      where: "SSO is \"#{opts.ssoUsername}\""

    UserLogic.fetchUserUql(uql).then((user) ->
      findClause =
        '$or': [
          { 'sbrs': {'$in': user.sbrs} }
          { 'owner.id': user.id }
        ]

      logger.debug "Searching mongo with: #{JSON.stringify(findClause)}"

      MongoOps['models']['task']
      .find()
      .where(findClause)
      .limit(100)
      .execQ()
    )
    .then((tasks) ->
      logger.debug "Discovered: #{tasks.length} tasks"
      deferred.resolve tasks
    ).catch((err) ->
      deferred.reject err
    ).done()
    return deferred.promise
  else
    return MongoOps['models']['task'].find().where().limit(100).execQ()

TaskLogic.fetchTask = (opts) ->
  MongoOps['models']['task']
  .findById(opts['_id']).execQ()

TaskLogic.updateTask = (opts) ->
  deferred = Q.defer()
  if opts.action is TaskActionsEnum.ASSIGN.name and opts.userInput?
    UserLogic.fetchUser(opts).then((user) ->
      $set =
        $set:
          state: TaskStateEnum.ASSIGNED.name
          taskOp: TaskOpEnum.COMPLETE_TASK.name
          owner: user

      MongoOps['models']['task'].findOneAndUpdate({_id: new ObjectId(opts['_id'])}, $set).execQ()
    )
    .then(() ->
      deferred.resolve()
    ).catch((err) ->
      deferred.reject err
    ).done()
  else if opts.action is TaskActionsEnum.UNASSIGN.name
    $set =
      $set:
        state: TaskStateEnum.UNASSIGNED.name
        taskOp: TaskOpEnum.OWN_TASK.name
        owner: null

    MongoOps['models']['task'].findOneAndUpdate({_id: new ObjectId(opts['_id'])}, $set).execQ()
    .then(->
      deferred.resolve()
    ).catch((err) ->
      deferred.reject err
    ).done()
  else
    deferred.reject "#{opts.action} is not a known action"

  deferred.promise

module.exports = TaskLogic
