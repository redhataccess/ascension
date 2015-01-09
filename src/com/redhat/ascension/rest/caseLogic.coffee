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

      statusCond = UQL.cond('status', 'is', """\"Waiting on Red Hat\"""")
      #sbrConds = _.map(user.sbrs, (s) -> UQL.cond('sbrGroup', 'is', """\"#{encodeURIComponent(s)}\""""))
      sbrConds = _.map(user.sbrs, (s) -> UQL.cond('sbrGroup', 'is', """\"#{s}\""""))

      # Fetch cases based on the SBRs
      sbrsUql =
        #where: "status is \"Waiting on Red Hat\" #{uqlSbrs}"
        where: if sbrConds?.length > 0 then UQL.and(UQL.or.apply(null, sbrConds), statusCond) else statusCond
        #limit: 7
        #resourceProjection: 'Minimal'

      # Fetch cases based on the owner
      ownerCond = UQL.cond('ownerId', 'is', """\"#{user.id}\"""")
      # TODO -- this should be where status is WoRH or internalStatus is WoOwner
      ownerUql =
        where: UQL.and(statusCond, ownerCond)

      if not user.id?
        throw Error("Could not generate owner UQL for owner: #{user.id}")

      finalUql =
        where: undefined

      if sbrConds?.length > 0
        # This needs to change to (sbr conds and status) or (ownerCond and status)
        finalUql.where = UQL.or(UQL.and(ownerCond, statusCond), UQL.and(UQL.or.apply(null, sbrConds), statusCond))
      else
        finalUql.where = UQL.and(statusCond, ownerCond)

      logger.debug("Discovered roles: #{opts.roles}")
      uqlParts = _.map(opts.roles, (r) -> RoutingRoles[r](user))
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
