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

  if opts?.ssoUsername? and opts?.ssoUsername isnt ''
    deferred = Q.defer()
    uql =
      where: "SSO is \"#{opts.ssoUsername}\""

    UserLogic.fetchUserUql(uql).then((user) ->
      #ownerFindClause =
      #  'state': {'$ne': 'closed'}
      #  '$or': [
      #    { 'sbrs': {'$in': user.sbrs} }
      #    { 'owner.id': user.id }
      #  ]

      ownerFindClause =
        'owner.id': user.id
        'state': {'$ne': 'closed'}
        'declinedUsers.id': {'$ne': user.id}

      nonOwnerFindClause =
        '$and': [
          {'state': {'$ne': 'closed'}}
          {'sbrs': {'$in': user.sbrs} } unless user.sbrs is undefined
          {'owner.id': {'$ne': user.id }}
          {'declinedUsers.id': {'$ne': user.id}}
        ]

      logger.debug "Searching mongo with ownerFindClause: #{JSON.stringify(ownerFindClause)}"
      logger.debug "Searching mongo with nonOwnerFindClause: #{JSON.stringify(nonOwnerFindClause)}"

      # To force the top 7 owner tasks then other by score I need to sort by owner.id then by score.  Or I could
      # fetch all owner cases first and add those to the fetched tasks, not sure what is best atm

      # 005A0000002a7XZIAY rmanes
      # db.tasks.find({'$or': [{'sbrs': {'$in': ['Kernel']}}, {'owner.id': '005A0000002a7XZIAY '}]}).sort({'owner.id': -1, score: -1}).limit(10)
      # db.tasks.find({'owner.id': '005A0000002a7XZIAY '}).sort({'owner.id': -1, score: -1}).limit(10)

      ownerTasksPromise = MongoOps['models']['task']
      .find()
      .where(ownerFindClause)
      .limit(_.parseInt(opts.limit) || 100)
      .sort('-score') # score desc
      .execQ()

      nonOwnerTasksPromise = MongoOps['models']['task']
      .find()
      .where(nonOwnerFindClause)
      .limit(_.parseInt(opts.limit) || 100)
      .sort('-score') # score desc
      .execQ()

      [ownerTasksPromise, nonOwnerTasksPromise]
    )
    #.then((tasks) ->
    .spread((ownerTasks, nonOwnerTasks) ->
      logger.debug "Discovered: #{ownerTasks.length} owner tasks, and #{nonOwnerTasks.length} non-owner tasks"
      finalTasks = []

      # If more than 7 owner tasks return only the top 7 owned
      if ownerTasks.length > 7
        deferred.resolve ownerTasks[0..6]
      # Otherwise push the owner tasks then the other tasks so the owner in front, then take the top 7
      else
        logger.debug "Discovered: #{ownerTasks.length} owner tasks and #{nonOwnerTasks.length} non-owner tasks."
        _.each ownerTasks, (t) -> finalTasks.push t
        _.each nonOwnerTasks, (t) -> finalTasks.push t
        deferred.resolve finalTasks[0..6]
    )
    .catch((err) ->
      deferred.reject err
    ).done()
    return deferred.promise
  else
    findClause =
      'state': {'$ne': 'closed'}
    return MongoOps['models']['task'].find().where(findClause).limit(_.parseInt(opts.limit) || 100).execQ()

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
  else if opts.action is TaskActionsEnum.DECLINE.name
    UserLogic.fetchUser(opts)
    .then((user) ->
      $update =
        $push:
          declinedUsers:
            id: user['id']
            sso: user['sso']
            fullName: user['fullName']
            declinedOn: new Date()
      logger.debug "Declining the event with #{prettyjson.render $update}"
      MongoOps['models']['task'].findOneAndUpdate({_id: new ObjectId(opts['_id'])}, $update).execQ()
    )
    .then(->
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
  else if opts.action is TaskActionsEnum.CLOSE.name
    $set =
      $set:
        state: TaskStateEnum.CLOSED.name
        taskOp: TaskOpEnum.NOOP.name
        closed: new Date()

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
