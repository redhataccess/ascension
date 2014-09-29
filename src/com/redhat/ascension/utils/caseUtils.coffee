_           = require 'lodash'
settings    = require '../settings/settings'
moment      = require 'moment'
logger      = require('tracer').colorConsole(exports.logger_config)
prettyjson  = require 'prettyjson'
TaskRules   = require '../rules/taskRules'


CaseUtils = {}

module.exports = CaseUtils
