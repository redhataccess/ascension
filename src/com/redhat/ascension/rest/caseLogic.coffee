fs                = require 'fs'
logger            = require('tracer').colorConsole()
settings          = require '../settings/settings'
prettyjson        = require 'prettyjson'
_                 = require 'lodash'
moment            = require 'moment'
Q                 = require 'q'
Q.longStackSupport = true
ResourceOpEnum    = require '../rules/enums/ResourceOpEnum'
TaskActionsEnum   = require './enums/taskActionsEnum'
TaskStateEnum     = require '../rules/enums/TaskStateEnum'
TaskTypeEnum      = require '../rules/enums/TaskTypeEnum'
TaskOpEnum        = require '../rules/enums/TaskOpEnum'
request           = require 'request'
Uri               = require 'jsuri'

UserLogic         = require './userLogic'

CaseLogic = {}

CaseLogic.fetchCasesUql = (opts) ->
  deferred = Q.defer()

  uri = new Uri(settings.UDS_URL).setPath('/case').setQuery('where=' + opts.where)
  logger.debug "Fetching cases with uri: #{uri}"
  opts =
    url: uri.toString()
    json: true

  # Lookup user based on given sso username
  request opts, (err, response, body) ->
    if err
      deferred.reject err
    else
      deferred.resolve body

  deferred.promise

CaseLogic.fetchCases = (opts) ->
  deferred = Q.defer()

  if opts?.ssoUsername? and opts?.ssoUsername isnt ''

    userUql =
      where: "SSO is \"#{opts.ssoUsername}\""
    UserLogic.fetchUserUql(userUql).then((user) ->

      # TODO -- this is hardcoded for the moment just to test
      casesUql =
#        where: "sbrGroup includes [\"Kernel\", \"Filesystem\"]"
        where: "status is \"Waiting on Red Hat\" and (sbrGroup is \"Webservers\")"

      # Returns a promise for the next then in the chain
      CaseLogic.fetchCasesUql(casesUql)
    ).then((cases) ->
      deferred.resolve cases
    ).catch((err) ->
      deferred.reject err
    ).done()
  else
    deferred.reject 'You must pass a ssoUsername in on the rest call'

  deferred.promise

CaseLogic.fetchCase = (opts) ->
  deferred = Q.defer()
  deferred.resolve _.find(CaseLogic.mockTasks, (t) -> t.resource?.resource?.caseNumber is opts.caseNumber)
  deferred.promise
#  MongoOps['models']['task']
#  .findById(opts['_id']).execQ()
#

module.exports = CaseLogic
