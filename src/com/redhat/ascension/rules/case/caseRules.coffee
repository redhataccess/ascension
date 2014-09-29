nools             = require 'nools'
logger            = require('tracer').colorConsole()
prettyjson        = require 'prettyjson'
salesforce        = require '../../db/salesforce'
Q                 = require 'q'
#DbOperations    = require '../db/dbOperations'
MongoOperations   = require '../../db/MongoOperations'
TaskRules         = require '../taskRules'
TaskStateEnum     = require '../enums/TaskStateEnum'
TaskTypeEnum      = require '../enums/TaskTypeEnum'
TaskOpEnum        = require '../enums/TaskOpEnum'
EntityOpEnum        = require '../enums/EntityOpEnum'
_                 = require 'lodash'
moment            = require 'moment'
mongoose          = require 'mongoose'
mongooseQ         = require('mongoose-q')(mongoose)
#MongoClient   = require('mongodb').MongoClient
#Server        = require('mongodb').Server


CaseRules = {}

CaseRules.soql = """
SELECT
  AccountId,
  Account_Number__c,
  CaseNumber,
  Collaboration_Score__c,
  Comment_Count__c,
  CreatedDate,
  Created_By__c,
  FTS_Role__c,
  FTS__c,
  Last_Breach__c,
  PrivateCommentCount__c,
  PublicCommentCount__c,
  SBT__c,
  SBR_Group__c,
  Severity__c,
  Status,
  Internal_Status__c,
  Strategic__c,
  Tags__c
FROM
  Case
WHERE
  OwnerId != '00GA0000000XxxNMAS'
  #andStatusCondition#
  AND Internal_Status__c != 'Waiting on Engineering'
  AND Internal_Status__c != 'Waiting on PM'
  LIMIT 100
"""

CaseRules.fetchCases = () ->
  soql = @soql.replace /#andStatusCondition#/, " AND Status = 'Waiting on Red Hat'"
  Q.nfcall(salesforce.querySf, {'soql': soql})


#CaseRules.unassignedCase = (c) -> c['Internal_Status__c '] is 'Unassigned'
CaseRules.intStatus = (c, intStatus) -> c['Internal_Status__c'] is intStatus

CaseRules.taskExistsWithEntityOp = (tasks, intStatus) ->
  _.find(tasks, (t) -> t['entityOp'] is intStatus) isnt false

CaseRules.findTask = (c, tasks, entityOp) ->
  _.find(tasks, (t) -> t['entityOp'] is entityOp)

# Given an existing task, updates the metadata of the task given the case and returns a promise
CaseRules.updateTaskFromCase = (c, t) ->
  logger.warn("Existing #{c['Internal_Status__c']} Task: #{c['CaseNumber']}, updating metadata")
  updateHash = TaskRules.taskFromCaseUpdateHash(existingTask, c)
  _.assign t, updateHash
  TaskRules.updateTaskFromCase(t, c)

CaseRules.match = (opts) ->
  self = CaseRules
  deferred = Q.defer()
  cases = opts['cases'] || []
  existingTasks = opts['existingTasks'] || []

  # Resulting promises from this iteration
  promises = []

  # Hash by Case Number
  casesByCaseNumber = _.object(_.map(cases, (c) -> [c['CaseNumber'], c]))

  # There may be more than one result per bid, so can't do a straight hash
  existingTasksByBid = _.groupBy existingTasks, (t) -> t['bid']

  logger.debug "Matching #{cases.length} cases"
  _.each cases, (c) ->

    logger.debug "Attempting to match case: #{c['CaseNumber']}, intStatus: #{c['Internal_Status__c']}"


    #######################################################################################################
    # Where there is an unassigned case and no associated task
    # Narrow the search space by only passing tasks matching this case
    #######################################################################################################
    if self.intStatus(c, 'Unassigned')
      entityOp = EntityOpEnum.OWN
      # Represents the task to test the logic against existing unassigned Cases/tasks
      existingTask = self.findTask c, existingTasksByBid[c['CaseNumber']], entityOp.name

      if existingTask?
        promises.push self.updateTaskFromCase(c, existingTask)
      else
        logger.warn("Discovered new Unassigned case: #{c['CaseNumber']} setting the task to #{entityOp.display}.")
        t = TaskRules.makeTaskFromCase(c)
        t.taskOp = TaskOpEnum.OWN_TASK.name
        t.entityOp = entityOp.name
        promises.push TaskRules.saveRuleTask(t)

    #######################################################################################################
    # Waiting on Owner tasks
    #######################################################################################################
    else if self.intStatus(c, 'Waiting on Owner')
      entityOp = EntityOpEnum.UPDATE
      # Represents the task to test the logic against existing unassigned Cases/tasks
      existingTask = self.findTask c, existingTasksByBid[c['CaseNumber']], entityOp.name

      if existingTask?
        promises.push self.updateTaskFromCase(c, existingTask)
      else
        logger.warn("Discovered new Waiting on Owner case: #{c['CaseNumber']} setting the task to #{entityOp.display}.")
        t = TaskRules.makeTaskFromCase(c)
        t.taskOp = TaskOpEnum.OWN_TASK.name
        t.entityOp = entityOp.name
        promises.push TaskRules.saveRuleTask(t)

    #######################################################################################################
    # Waiting on Contributor tasks
    #######################################################################################################
    else if self.intStatus(c, 'Waiting on Contributor')
      entityOp = EntityOpEnum.CONTRIBUTE
      # Represents the task to test the logic against existing unassigned Cases/tasks
      existingTask = self.findTask c, existingTasksByBid[c['CaseNumber']], entityOp.name

      if existingTask?
        promises.push self.updateTaskFromCase(c, existingTask)
      else
        logger.warn("Discovered new Waiting on Contributor case: #{c['CaseNumber']} setting the task to #{entityOp.display}.")
        t = TaskRules.makeTaskFromCase(c)
        t.taskOp = TaskOpEnum.OWN_TASK.name
        t.entityOp = entityOp.name
        promises.push TaskRules.saveRuleTask(t)

    #######################################################################################################
    # Waiting on Collaboration tasks
    #######################################################################################################
    else if self.intStatus(c, 'Waiting on Collaboration')
      entityOp = EntityOpEnum.COLLABORATE
      # Represents the task to test the logic against existing unassigned Cases/tasks
      existingTask = self.findTask c, existingTasksByBid[c['CaseNumber']], entityOp.name

      if existingTask?
        promises.push self.updateTaskFromCase(c, existingTask)
      else
        logger.warn("Discovered new Waiting on Collaboration case: #{c['CaseNumber']} setting the task to #{entityOp.display}.")
        t = TaskRules.makeTaskFromCase(c)
        t.taskOp = TaskOpEnum.OWN_TASK.name
        t.entityOp = entityOp.name
        promises.push TaskRules.saveRuleTask(t)

    #######################################################################################################
    # Tasks for this case relating to Waiting on Engineering
    #######################################################################################################
    else if self.intStatus(c, 'Waiting on Engineering')
      entityOp = EntityOpEnum.FOLLOW_UP_WITH_ENGINEERING
      existingTask = self.findTask c, existingTasksByBid[c['CaseNumber']], entityOp.name
      if existingTask?
        promises.push self.updateTaskFromCase(c, existingTask)
      else
        logger.warn("Discovered new Waiting on Engineering case: #{c['CaseNumber']} setting the task to #{entityOp.display}.")
        t = TaskRules.makeTaskFromCase(c)
        t.taskOp = TaskOpEnum.OWN_TASK.name
        t.entityOp = entityOp.name
        promises.push TaskRules.saveRuleTask(t)

    #######################################################################################################
    # Tasks for this case relating to Waiting on Sales
    #######################################################################################################
    else if self.intStatus(c, 'Waiting on Sales')
      entityOp = EntityOpEnum.FOLLOW_UP_WITH_SALES
      existingTask = self.findTask c, existingTasksByBid[c['CaseNumber']], entityOp.name

      if existingTask?
        promises.push self.updateTaskFromCase(c, existingTask)
      else
        logger.warn("Discovered new Waiting on Engineering case: #{c['CaseNumber']} setting the task to #{entityOp.display}.")
        t = TaskRules.makeTaskFromCase(c)
        t.taskOp = TaskOpEnum.OWN_TASK.name
        t.entityOp = entityOp.name
        promises.push TaskRules.saveRuleTask(t)
    else
      logger.debug "Did not create task from case: #{prettyjson.render c}"

  deferred.resolve promises
  deferred.promise

module.exports = CaseRules

if require.main is module
  MongoOperations.init()
  db = mongoose['connection']
  db.on 'error', logger.error.bind(logger, 'connection error:')
  dbPromise = Q.defer()
  db.once 'open', () ->
    dbPromise.resolve()

  dbPromise.promise
  .then(->
    MongoOperations.defineCollections()
    MongoOperations.reset()
  )
  .then(->
    CaseRules.fetchCases()
  )
  .then((cases) ->
    CaseRules.match({cases: cases})
  )
  .then((promises) ->
    Q.allSettled(promises)
  )
  .then((results) ->
    logger.debug "Completed manipulating #{results.length} tasks"
  )
  .catch((err) ->
    logger.error err.stack
  )
  .done(->
    process.exit()
  )

#TaskRules.executeTest()
