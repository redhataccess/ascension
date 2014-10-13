logger            = require('tracer').colorConsole()
prettyjson        = require 'prettyjson'
settings          = require '../settings/settings'
Q                 = require 'q'
MongoOps          = require './MongoOperations'
_                 = require 'lodash'
moment            = require 'moment'
mongoose          = require 'mongoose'
mongooseQ         = require('mongoose-q')(mongoose)
request           = require 'request'
d3                = require 'd3'
#MongoClient   = require('mongodb').MongoClient
#Server        = require('mongodb').Server

M = {}

# Given a list of userIds, return an aggregate results containing the active task count for those users
M.getTaskCounts = (userIds) ->
  deferred = Q.defer()

  MongoOps['models']['task'].aggregate()
  .match({'owner.id': {$in: userIds}})
  .group(
    {
      _id: '$owner.id'
      taskCount: {$sum: 1}
    }
  )
  .execQ()
  .then((results) ->

    # hash the userIds and fill in the results so we have a guaranteed zero'd out object array
    hashedIds = _.object(_.map(userIds, (id) -> [id, {taskCount: 0}]))
    _.each results, (r) ->
      hashedIds[r['_id']]['taskCount'] = r['taskCount']

    deferred.resolve hashedIds
  )
  .catch((err) ->
    deferred.reject err
  )
  .done()

  deferred.promise

module.exports = M

if require.main is module
  MongoOps.init()
  db = mongoose['connection']
  db.on 'error', logger.error.bind(logger, 'connection error:')
  dbPromise = Q.defer()
  db.once 'open', () ->
    dbPromise.resolve()

  dbPromise.promise
  .then(->
    MongoOps.defineCollections()
    #MongoOps.reset()
  )
  .then(->
    # aogburn, klape
    M.getTaskCounts(['005A0000000zqMTIAY', '005A0000000wLT9IAM'])
  )
  .then((result) ->
    logger.debug prettyjson.render result
  )
  .catch((err) ->
    logger.error err.stack
  )
  .done(->
    process.exit()
  )

