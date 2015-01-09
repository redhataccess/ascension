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
RoutingRoles      = require '../rules/routing_roles/routingRoles'
UQL               = require '../uds/uqlConditionBuilderMixin'
request           = require 'request'
Uri               = require 'jsuri'

UserLogic         = require './userLogic'

CaseLogic = {}

CaseLogic.fetchCasesUql = (opts) ->
  deferred = Q.defer()

  uri = new Uri(settings.UDS_URL).setPath('/case').addQueryParam('where', opts.where)
  if opts.limit?
    uri.addQueryParam('limit', opts.limit)
  if opts.resourceProjection?
    uri.addQueryParam('resourceProjection', opts.resourceProjection)

  logger.debug "Fetching cases with uri: #{uri}"
  opts =
    url: uri.toString()
    json: true

  # Lookup user based on given sso username
  request opts, (err, response, body) ->
    if err?
      deferred.reject err
    else
      deferred.resolve body

  deferred.promise

CaseLogic.fetchCases = (opts) ->
  deferred = Q.defer()

  if opts?.ssoUsername? and opts?.ssoUsername isnt ''

    # http://cl.ly/image/3t3N1g0n0Q0j
    userUql =
      where: "SSO is \"#{opts.ssoUsername}\""
    UserLogic.fetchUserUql(userUql).then((user) ->

      finalUql =
        where: undefined

      ######################################################
      # The url query params should override any user roles
      ######################################################
      if opts.roles?.length > 0
        logger.debug("Discovered roles from the query parms: #{opts.roles}")
        uqlParts = _.map(opts.roles, (r) -> RoutingRoles[r](user))
        uqlFormatted = uqlParts.join(' or ')
        finalUql.where = uqlFormatted
      ######################################################
      # Next fall through to the user defined roles from UDS
      ######################################################
      else if user.roles?.length > 0
        undefined
      ######################################################
      # Finally just show the standard plate for the user
      # Based on the my plate logic
      ######################################################
      else
        uqlParts = [RoutingRoles.COLLABORATION(user), RoutingRoles.OWNED_CASES(user), RoutingRoles.FTS(user)]
        uqlFormatted = uqlParts.join(' or ')
        finalUql.where = uqlFormatted

      logger.debug("Generated UQL: #{finalUql.where}")
      # Returns a promise for the next then in the chain
      #[CaseLogic.fetchCasesUql(sbrsUql), CaseLogic.fetchCasesUql(ownerUql)]
      CaseLogic.fetchCasesUql(finalUql)
    )
    .then((cases) ->
      deferred.resolve _.chain([cases || []]).flatten().uniq((c) -> c.externalModelId).value()
    )
#    .spread((sbrCases, ownerCases) ->
#      logger.debug("Found #{sbrCases.length} sbrCases and #{ownerCases} ownerCases")
#      finalCases = _.chain([sbrCases || [], ownerCases || []]).flatten().uniq((c) -> c.externalModelId).value()
#      logger.debug("finalCase count: #{finalCases.length}")
#      deferred.resolve finalCases
#    )
    .catch((err) ->
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
