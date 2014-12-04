_           = require 'lodash'
settings    = require '../settings/settings'
moment      = require 'moment'
logger      = require('tracer').colorConsole(exports.logger_config)
prettyjson  = require 'prettyjson'
TaskRules   = require '../rules/taskRules'
MongoOperations   = require '../db/MongoOperations'
TaskTypeEnum = require '../rules/enums/TaskTypeEnum'


TaskUtils = {}

TaskUtils.parseSfArray = (o) ->
  if o? and o isnt ''
    if ';' in o
      return o.split(';')
    if _.isArray(o)
      return o
    else
      return [o]
  return []

TaskUtils.makeTaskFromCase = (c) ->
  _id: null
  bid: "#{c['caseNumber']}" || "#{c['CaseNumber']}"
  score: c['collaborationScore'] || c['Collaboration_Score__c'] || 0
  timeout: -1
  #sbrs: @parseSfArray(c['SBR_Group__c'])
  #tags: @parseSfArray(c['Tags__c'])
  sbrs: c['sbrs'] || @parseSfArray(c['SBR_Group__c'])
  tags: c['tags'] || @parseSfArray(c['Tags__c'])
  owner: null
  created: new Date()
  closed: null # Date or null
  type: TaskTypeEnum.CASE.name
  taskOp: TaskOpEnum.NOOP.name
  entityOp: TaskOpEnum.NOOP.name
  state: TaskStateEnum.UNASSIGNED.name
  'case':
    status: c['status'] || c['Status']
    internalStatus: c['internalStatus'] || c['Internal_Status__c']
    severity: c['severity'] || c['Severity__c']
    sbrs: c['sbrs'] || @parseSfArray(c['SBR_Group__c'])
    tags: c['tags'] || @parseSfArray(c['Tags__c'])
    sbt: c['sbt'] || c['SBT__c']
    created: c['created'] || c['CreatedDate']
    score: c['collaborationScore'] || c['Collaboration_Score__c']
    subject: c['subject'] || c['Subject']

# Constructs a Mongo Task from a Rule Task and returns a promise
# INFO -- Must construct a new instance of the task first then assign data, don't pass the obj hash to the new Task
# That presents problems with the default assignments in mongoose.
TaskUtils.saveRuleTask = (t) ->
  #logger.debug "saveRuleTask: Creating task [p]"
  x = new MongoOperations['models']['task']();
  _.keys(t).forEach (key) -> x[key] = t[key] unless key is 'toString'
  _.keys(t['case']).forEach (key) -> x['case'][key] = t['case'][key] unless key is 'toString'
  # Do not return the promise with this way of instantiation of the task.
  #new MongoOperations['models']['task'](x).saveQ()
  x.saveQ()

# Returns an update hash to be pushed to mongo to just update these fields that overlap
TaskUtils.taskFromCaseUpdateHash = (t, c) ->
  'score': c['collaborationScore'] || 0
  #'sbrs': @parseSfArray(c['SBR_Group__c'])
  #'tags': @parseSfArray(c['Tags__c'])
  'sbrs': c['sbrs']
  'tags': c['tags']
  'lastUpdated': new Date()
  'case': c

# Update a task from a case, this assumes task is mongoose modeled
TaskUtils.updateTaskFromCase = (t, c) ->
  MongoOperations['models']['task'].where()
  .setOptions({multi: true})
  .update({'bid': c['caseNumber']}, @taskFromCaseUpdateHash(t, c))
  .exec()

TaskRules.makeTaskFromCase = (c) ->
  _id: null
  bid: "#{c['caseNumber']}" || "#{c['CaseNumber']}"
  score: c['collaborationScore'] || c['Collaboration_Score__c'] || 0
  timeout: -1
  #sbrs: @parseSfArray(c['SBR_Group__c'])
  #tags: @parseSfArray(c['Tags__c'])
  sbrs: c['sbrs'] || @parseSfArray(c['SBR_Group__c'])
  tags: c['tags'] || @parseSfArray(c['Tags__c'])
  owner: null
  created: new Date()
  closed: null # Date or null
  type: TaskTypeEnum.CASE.name
  taskOp: TaskOpEnum.NOOP.name
  entityOp: TaskOpEnum.NOOP.name
  state: TaskStateEnum.UNASSIGNED.name
  'case':
    status: c['status'] || c['Status']
    internalStatus: c['internalStatus'] || c['Internal_Status__c']
    severity: c['severity'] || c['Severity__c']
    sbrs: c['sbrs'] || @parseSfArray(c['SBR_Group__c'])
    tags: c['tags'] || @parseSfArray(c['Tags__c'])
    sbt: c['sbt'] || c['SBT__c']
    created: c['created'] || c['CreatedDate']
    score: c['collaborationScore'] || c['Collaboration_Score__c']
    subject: c['subject'] || c['Subject']

TaskUtils.generateMockTask = (overrides) ->
  c =
    accountNumber: '1234567'
    caseNumber: '00012345'
    collaborationScore: 2334
    created: new Date(2014, 5, 5)
    sbt: 1000
    sbrs: ['JBoss Base AS', 'Webservers']
    severity: '3 (Normal)'
    status: 'Waiting on Red Hat'
    internalStatus: 'Unassigned'
    strategic: 'Yes'
    tags: ['httpd']

  if overrides?.case?
    _.assign c, overrides['case']

  t = TaskUtils.makeTaskFromCase c

  if overrides?.task?
    _.assign t, overrides['task']

  t

module.exports = TaskUtils
