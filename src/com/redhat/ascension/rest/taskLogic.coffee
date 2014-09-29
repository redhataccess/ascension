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
TaskActionsEnum   = require './enums/taskActionsEnum.coffee'
TaskStateEnum     = require '../rules/enums/TaskStateEnum.coffee'
request           = require 'request'
ObjectId          = mongoose.Types.ObjectId

UserLogic         = require './userLogic.coffee'

TaskLogic = {}

TaskLogic.fetchTasks = (opts) ->
  MongoOps['models']['task']
  .find()
  .where()
  .limit(100)
  .execQ()

TaskLogic.fetchTask = (opts) ->
  MongoOps['models']['task']
  .findById(opts['_id']).execQ()

TaskLogic.updateTask = (opts) ->
  deferred = Q.defer()
  if opts.action is TaskActionsEnum.ASSIGN and opts.userInput?
    UserLogic.fetchUser(opts).then((user) ->
      $set =
        $set:
          state: TaskStateEnum.ASSIGNED.name
          owner: user

      MongoOps['models']['task'].findOneAndUpdate({_id: new ObjectId(opts['_id'])}, $set).execQ()
    )
    .then(() ->
      deferred.resolve()
    ).catch((err) ->
      deferred.reject err
    ).done()
  else
    deferred.reject "#{opts.action} is not a known action"

  deferred.promise

module.exports = TaskLogic
