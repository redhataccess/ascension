fs                = require 'fs'
logger            = require('tracer').colorConsole()
settings          = require '../settings/settings'
prettyjson        = require 'prettyjson'
_                 = require 'lodash'
moment            = require 'moment'
Q                 = require 'q'
#MongoOps          = require '../db/MongoOperations'
#mongoose          = require 'mongoose'
#mongooseQ         = require('mongoose-q')(mongoose)
#ObjectId          = mongoose.Types.ObjectId
TaskActionsEnum   = require './enums/taskActionsEnum'
TaskStateEnum     = require '../rules/enums/TaskStateEnum'
TaskOpEnum        = require '../rules/enums/TaskOpEnum'
request           = require 'request'

UserLogic         = require './userLogic'

TaskLogic = {}

TaskLogic.mockTasks = []

TaskLogic.makeSfId = () ->
  text = ""
  possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  i = 0
  while i < 18
    text += possible.charAt(Math.floor(Math.random() * possible.length)).toUpperCase()
    i++
  text

TaskLogic.generateExampleTask = (caseNumber, accountNumber) ->
  score = Math.floor((Math.random() * 2000) + 1000)
  createdBySfId = TaskLogic.makeSfId()
  ownerSfId = TaskLogic.makeSfId()
  accountSfId = TaskLogic.makeSfId()
  caseSfId = TaskLogic.makeSfId()
  taskId = TaskLogic.makeSfId()
  # sfid is 18 chars long
  tmp = {
    "resource" : {
      "externalModelId" : taskId
      "closed" : "2014-12-16T12:01:11.000Z",
      "created" : "2014-10-30T14:55:11.000Z",
      "createdBy" : {
        "externalModelId" : createdBySfId
      },
      "lastModified" : "2014-12-16T12:01:11.000Z",
      "resource" : {
        "externalModelId" : caseSfId
        "resource" : {
          "account" : {
            "externalModelId" : accountSfId
            "resource" : {
              "accountName" : "Acme Foo",
              "accountNumber" : accountNumber,
              "hasSRM" : true,
              "hasTAM" : true,
              "isActive" : true,
              "specialHandlingRequired" : true,
              "strategic" : true,
              "superRegion" : "NA"
            },
            "resourceReliability" : "Fresh"
          },
          "caseNumber" : caseNumber,
          "collaborationScore" : score,
          "created" : "2014-10-30T14:55:11.000Z",
          "internalPriority" : "1 (Urgent)",
          "internalStatus" : "Waiting on Owner",
          "isFTSCase" : false,
          "isTAMCase" : false,
          "lastModified" : "2014-12-16T12:01:11.000Z",
          "owner" : {
            "externalModelId" : ownerSfId
            "resourceReliability" : "Fresh"
          },
          "product" : {
            "externalModelId" : null,
            "resource" : {
              "line" : {
                "externalModelId" : 1462,
                "resource" : {
                  "name" : "Red Hat Storage Server"
                },
                "resourceReliability" : "Fresh"
              },
              "version" : {
                "externalModelId" : 17838,
                "resource" : {
                  "name" : "3.0"
                },
                "resourceReliability" : "Fresh"
              }
            },
            "resourceReliability" : "Fresh"
          },
          "sbrs" : [ "Filesystem" ],
          "sbt" : Math.floor((Math.random() * 100) + 1),
          "severity" : "1 (Urgent)",
          "status" : "Waiting on Red Hat",
          "subject" : "Example case",
          "summary" : "example summary",
          "tags" : [ "gluster" ]
        },
        "resourceReliability" : "Fresh"
      },
      "resourceOperation" : "OWN",
      "score" : score,
      "status" : "UNASSIGNED",
      "taskOperation" : "NOOP",
      "type" : "CASE"
    }
  }
  tmp

TaskLogic.fetchTasks = (opts) ->

  if opts?.ssoUsername? and opts?.ssoUsername isnt ''
    deferred = Q.defer()

    deferred.resolve TaskLogic.mockTasks
    return deferred.promise

#    uql =
#      where: "SSO is \"#{opts.ssoUsername}\""
#    UserLogic.fetchUserUql(uql).then((user) ->
#      #ownerFindClause =
#      #  'state': {'$ne': 'closed'}
#      #  '$or': [
#      #    { 'sbrs': {'$in': user.sbrs} }
#      #    { 'owner.id': user.id }
#      #  ]
#
#      ownerFindClause =
#        'owner.id': user.id
#        'state': {'$ne': 'closed'}
#        'declinedUsers.id': {'$ne': user.id}
#
#      nonOwnerFindClause =
#        '$and': [
#          {'state': {'$ne': 'closed'}}
#          {'sbrs': {'$in': user.sbrs} } unless user.sbrs is undefined
#          {'owner.id': {'$ne': user.id }}
#          {'declinedUsers.id': {'$ne': user.id}}
#        ]
#
#      logger.debug "Searching mongo with ownerFindClause: #{JSON.stringify(ownerFindClause)}"
#      logger.debug "Searching mongo with nonOwnerFindClause: #{JSON.stringify(nonOwnerFindClause)}"
#
#      # To force the top 7 owner tasks then other by score I need to sort by owner.id then by score.  Or I could
#      # fetch all owner cases first and add those to the fetched tasks, not sure what is best atm
#
#      # 005A0000002a7XZIAY rmanes
#      # db.tasks.find({'$or': [{'sbrs': {'$in': ['Kernel']}}, {'owner.id': '005A0000002a7XZIAY '}]}).sort({'owner.id': -1, score: -1}).limit(10)
#      # db.tasks.find({'owner.id': '005A0000002a7XZIAY '}).sort({'owner.id': -1, score: -1}).limit(10)
#
#      ownerTasksPromise = MongoOps['models']['task']
#      .find()
#      .where(ownerFindClause)
#      .limit(_.parseInt(opts.limit))
#      .sort('-score') # score desc
#      .execQ()
#
#      nonOwnerTasksPromise = MongoOps['models']['task']
#      .find()
#      .where(nonOwnerFindClause)
#      .limit(_.parseInt(opts.limit))
#      .sort('-score') # score desc
#      .execQ()
#
#      [ownerTasksPromise, nonOwnerTasksPromise]
#    )
#    #.then((tasks) ->
#    .spread((ownerTasks, nonOwnerTasks) ->
#      logger.debug "Discovered: #{ownerTasks.length} owner tasks, and #{nonOwnerTasks.length} non-owner tasks"
#      finalTasks = []
#
#      # If more than 7 owner tasks return only the top 7 owned
#      if ownerTasks.length > 7
#        deferred.resolve ownerTasks[0..6]
#      # Otherwise push the owner tasks then the other tasks so the owner in front, then take the top 7
#      else
#        logger.debug "Discovered: #{ownerTasks.length} owner tasks and #{nonOwnerTasks.length} non-owner tasks."
#        _.each ownerTasks, (t) -> finalTasks.push t
#        _.each nonOwnerTasks, (t) -> finalTasks.push t
#        deferred.resolve finalTasks[0..6]
#    )
#    .catch((err) ->
#      deferred.reject err
#    ).done()
#    return deferred.promise
#  else
#    findClause =
#      'state': {'$ne': 'closed'}
#    return MongoOps['models']['task'].find().where(findClause).limit(_.parseInt(opts.limit)).execQ()

TaskLogic.fetchTask = (opts) ->
  deferred = Q.defer()
  deferred.resolve _.find(TaskLogic.mockTasks, (t) -> t.resource?.resource?.caseNumber is opts.caseNumber)
  deferred.promise
#  MongoOps['models']['task']
#  .findById(opts['_id']).execQ()
#
TaskLogic.updateTask = (opts) ->
  deferred = Q.defer()
  deferred.resolve undefined
  deferred.promise
#  if opts.action is TaskActionsEnum.ASSIGN.name and opts.userInput?
#    UserLogic.fetchUser(opts).then((user) ->
#      $set =
#        $set:
#          state: TaskStateEnum.ASSIGNED.name
#          taskOp: TaskOpEnum.COMPLETE_TASK.name
#          owner: user
#
#      MongoOps['models']['task'].findOneAndUpdate({_id: new ObjectId(opts['_id'])}, $set).execQ()
#    )
#    .then(() ->
#      deferred.resolve()
#    ).catch((err) ->
#      deferred.reject err
#    ).done()
#  else if opts.action is TaskActionsEnum.DECLINE.name
#    UserLogic.fetchUser(opts)
#    .then((user) ->
#      $update =
#        $push:
#          declinedUsers:
#            id: user['id']
#            sso: user['sso']
#            fullName: user['fullName']
#            declinedOn: new Date()
#      logger.debug "Declining the event with #{prettyjson.render $update}"
#      MongoOps['models']['task'].findOneAndUpdate({_id: new ObjectId(opts['_id'])}, $update).execQ()
#    )
#    .then(->
#      deferred.resolve()
#    ).catch((err) ->
#      deferred.reject err
#    ).done()
#  else if opts.action is TaskActionsEnum.UNASSIGN.name
#    $set =
#      $set:
#        state: TaskStateEnum.UNASSIGNED.name
#        taskOp: TaskOpEnum.OWN_TASK.name
#        owner: null
#
#    MongoOps['models']['task'].findOneAndUpdate({_id: new ObjectId(opts['_id'])}, $set).execQ()
#    .then(->
#      deferred.resolve()
#    ).catch((err) ->
#      deferred.reject err
#    ).done()
#  else if opts.action is TaskActionsEnum.CLOSE.name
#    $set =
#      $set:
#        state: TaskStateEnum.CLOSED.name
#        taskOp: TaskOpEnum.NOOP.name
#        closed: new Date()
#
#    MongoOps['models']['task'].findOneAndUpdate({_id: new ObjectId(opts['_id'])}, $set).execQ()
#    .then(->
#      deferred.resolve()
#    ).catch((err) ->
#      deferred.reject err
#    ).done()
#  else
#    deferred.reject "#{opts.action} is not a known action"
#
#  deferred.promise

module.exports = TaskLogic
