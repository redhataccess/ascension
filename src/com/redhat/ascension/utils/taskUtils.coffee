_           = require 'lodash'
settings    = require '../settings/settings'
moment      = require 'moment'
logger      = require('tracer').colorConsole(exports.logger_config)
prettyjson  = require 'prettyjson'
TaskRules   = require '../rules/taskRules'


TaskUtils = {}

TaskUtils.generateMockTask = (overrides) ->
  c =
    accountNumber: '1301972'
    caseNumber: '00024904'
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

  t = TaskRules.makeTaskFromCase c

  if overrides?.task?
    _.assign t, overrides['task']

  t

module.exports = TaskUtils
