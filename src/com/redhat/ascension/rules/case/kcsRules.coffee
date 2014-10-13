nools             = require 'nools'
logger            = require('tracer').colorConsole()
prettyjson        = require 'prettyjson'
salesforce        = require '../../db/salesforce'
settings          = require '../../settings/settings'
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
request           = require 'request'
#MongoClient   = require('mongodb').MongoClient
#Server        = require('mongodb').Server


KcsRules = {}

#KcsRules.unassignedCase = (c) -> c['internalStatus '] is 'Unassigned'
KcsRules.intStatus = (c, intStatus) -> c['internalStatus'] is intStatus

KcsRules.taskExistsWithEntityOp = (tasks, intStatus) ->
  _.find(tasks, (t) -> t['entityOp'] is intStatus) isnt false

KcsRules.findTask = (c, tasks, entityOp) ->
  _.find(tasks, (t) -> t['entityOp'] is entityOp)

# Given an existing task, updates the metadata of the task given the case and returns a promise
KcsRules.updateTaskFromCase = (c, t) ->
  logger.warn("Existing #{c['internalStatus']} Task: #{c['caseNumber']}, updating metadata")
  updateHash = TaskRules.taskFromCaseUpdateHash(t, c)
  _.assign t, updateHash
  TaskRules.updateTaskFromCase(t, c)

KcsRules.normalizeCase = (c) ->
  x =
    status: c['status'] || c['Status']
    internalStatus: c['internalStatus'] || c['Internal_Status__c']
    severity: c['severity'] || c['Severity__c']
    sbrs: c['sbrs'] || TaskRules.parseSfArray(c['SBR_Group__c'])
    tags: c['tags'] || TaskRules.parseSfArray(c['Tags__c'])
    sbt: c['sbt'] || c['SBT__c'] || null
    created: c['created'] || c['CreatedDate']
    collaborationScore: c['collaborationScore'] || c['Collaboration_Score__c']
    caseNumber: c['caseNumber'] || c['CaseNumber']
    linkedSolutionCount: _.filter(c['Case_Resource_Relationships__r']?['records'] || [], (r) -> r['Resource_Type__c'] is 'Solution' and _.contains(['Link', 'Link;Pin'], r['Type__c'])).length
  logger.debug "here"
  x

KcsRules.match = (opts) ->
  self = KcsRules
  deferred = Q.defer()
  cases = opts['cases'] || []
  existingTasks = opts['existingTasks'] || []

  # Resulting promises from this iteration
  promises = []

  # There may be more than one result per bid, so can't do a straight hash
  existingTasksByBid = _.groupBy existingTasks, (t) -> t['bid']

  logger.debug "KcsRules matching #{cases.length} cases"
  _.each cases, (c) ->
    #c = self.normalizeCase(x)

    #######################################################################################################
    # Cases with no KCS attached
    # Narrow the search space by only passing tasks matching this case
    #######################################################################################################
    if c['linkedSolutionCount'] is 0
      entityOp = EntityOpEnum.CREATE_KCS
      # Represents the task to test the logic against existing unassigned Cases/tasks
      existingTask = self.findTask c, existingTasksByBid[c['caseNumber']], entityOp.name

      if existingTask?
        promises.push self.updateTaskFromCase(c, existingTask)
      else
        t = TaskRules.makeTaskFromCase(c)
        logger.warn("Discovered case without a KCS resource: #{t['bid']} setting the task to #{entityOp.display}.")
        t.type = TaskTypeEnum.KCS.name
        t.taskOp = TaskOpEnum.OWN_TASK.name
        t.entityOp = entityOp.name
        promises.push TaskRules.saveRuleTask(t)

    else
      logger.debug "Did not create kcs task from case #{c['caseNumber']}"

  logger.debug "KcsRules.match resolving #{promises.length} promises"
  deferred.resolve promises
  deferred.promise


module.exports = KcsRules

#TaskRules.executeTest()
