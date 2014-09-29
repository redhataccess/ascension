_           = require 'lodash'
settings    = require '../settings/settings'
moment      = require 'moment'
logger      = require('tracer').colorConsole(exports.logger_config)
prettyjson  = require 'prettyjson'

#  level: if process.env.OPENSHIFT_DATA_DIR is undefined then 'debug' else 'info'
exports.logger_config =
  level: if settings.env is 'development' then 'debug' else 'info'
  level: 'debug'
  format : "[{{timestamp}}] <{{title}}> <{{file}}:{{line}}> {{message}}"
  dateformat : "yyyy-mm-dd hh:MM:ss"

exports.truthy = (obj) ->
  if obj is undefined
    return false
  else if _.isBoolean obj
    return obj
  else if _.isString obj
    return if _.contains ['YES', 'Yes', 'yes', 'Y', 'y', '1', 'true', 'TRUE', 'ok', 'OK', 'Ok'], obj then true else false
  else if _.isNumber obj
    return parseInt(obj) is 1
  else
    return false

