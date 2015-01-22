fs                = require 'fs'
logger            = require('tracer').colorConsole()
settings          = require '../settings/settings'
prettyjson        = require 'prettyjson'
_                 = require 'lodash'
moment            = require 'moment'
Q                 = require 'q'
S                 = require 'string'
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
  # coffeescript refuses to not translate is or == to ===, and void 0 != null, and isEqual does ===.  Therefore, the
  # only way to do this is ? which translates !=, now that is annoying
  if opts.resourceProjection?
    uri.addQueryParam('resourceProjection', opts.resourceProjection)
  else
    uri.addQueryParam('resourceProjection', 'Minimal')

  logger.debug "Fetching cases with uri: #{uri}"
  opts =
    url: uri.toString()
    json: true
    gzip: true

  # Lookup user based on given sso username
  request opts, (err, response, body) ->
    if err?
      deferred.reject err
    else
      deferred.resolve body

  deferred.promise

CaseLogic.fetchContributorCasesUql = (opts) ->
  deferred = Q.defer()

  uri = new Uri(settings.UDS_URL).setPath('/case/associates').addQueryParam('where', opts.where)
  if opts.limit?
    uri.addQueryParam('limit', opts.limit)
  if opts.resourceProjection?
    uri.addQueryParam('resourceProjection', opts.resourceProjection)
  else
    uri.addQueryParam('resourceProjection', 'Minimal')

  logger.debug "Fetching contributors cases with uri: #{uri}"
  opts =
    url: uri.toString()
    json: true
    gzip: true

  # Lookup user based on given sso username
  request opts, (err, response, body) ->
    if err?
      deferred.reject err
    else
      #{
      #"resource": {
      #  "role": "Contributor",
      #  "associate": {
      #    "resourceReliability": "Fresh",
      #    "externalModelId": "005A0000001qUouIAE"
      #  },
      #  "caseId": "500A000000J5Eh2IAF"
      #},
      #"resourceReliability": "Fresh",
      #"externalModelId": "500A000000J5Eh2IAF"
      #}
      caseIds = _.map(body, (r) -> r.resource.caseId)
      if caseIds?.length > 0
        caseIdConds = _.map(caseIds, (caseId) -> UQL.cond('caseId', 'is', """\"#{caseId}\""""))
        caseIdsUql =
          where: UQL.or.apply(null, caseIdConds)
        CaseLogic.fetchCasesUql(caseIdsUql).then((cases) ->
          deferred.resolve cases
        )
        .catch((err) ->
          logger.error(err?.stack || err)
          deferred.reject err
        ).done()
      else
        deferred.resolve []

  deferred.promise

# TODO -- may need to make a function that creates and resolves a promise with []

CaseLogic.fetchCases = (opts) ->
  # Actual roles on the user object
  userRoles = null
  # flag to indicate no user roles and roles were assumed
  defaultRoles = false
  # flag to indicate that url roles were used instead of user or default
  urlRoles = false
  finalUql =
    where: undefined
  deferred = Q.defer()

  if opts?.ssoUsername? and opts?.ssoUsername isnt ''

    userUql =
      where: "SSO is \"#{opts.ssoUsername}\""

    UserLogic.fetchUserUql(userUql).then((user) ->

      if (not user?) or (not user?.externalModelId?)
        new Error("Was not able to fetch user given UQL: #{userUql.where}")

      # Attempt to extract the routing role specific roles from the UDS user
      userRoles = RoutingRoles.extractRoutingRoles(user)

      # Holds the individual uqlParts to be OR'd together
      uqlParts = []

      ######################################################
      # The url query params should override any user roles
      ######################################################
      if opts.roles?.length > 0
        userRoles = opts.roles
        logger.debug("Discovered roles from the query parms: #{userRoles}")
        urlRoles = true
      ######################################################
      # This should be the primary condition, where a user
      # has routing roles on his/her user object
      ######################################################
      else if userRoles?.length > 0
        logger.debug("Discovered roles on the user: #{userRoles}")
      ######################################################
      # If no sbrs present just pull the owned + fts cases, collaboration requires sbrs
      ######################################################
      else if (not user.sbrs?) or user.sbrs?.length is 0
        logger.debug("No sbrs found on user.")
        userRoles = [RoutingRoles.key_mapping.OWNED_CASES]
        defaultRoles = true

      ######################################################
      # Finally just show the standard plate for the user
      # Based on the my plate logic
      ######################################################
      else
        logger.debug("No url roles or user roles found.")
        userRoles = [RoutingRoles.key_mapping.OWNED_CASES, RoutingRoles.key_mapping.COLLABORATION, RoutingRoles.key_mapping.FTS]
        defaultRoles = true

      userRoles = _.map(userRoles, (ur) -> ur.toLowerCase())
      logger.debug("Mapping the following roles: #{userRoles}")
      uqlParts = _.map(userRoles, (r) -> RoutingRoles.mapping[r](user))

      # Now that the role UQL statements are determined, or them together
      finalUql.where = uqlParts.join(' or ')

      logger.debug("Generated UQL: #{finalUql.where}")
      # Returns a promise for the next then in the chain
      #[CaseLogic.fetchCasesUql(sbrsUql), CaseLogic.fetchCasesUql(ownerUql)]

      # Here return the promise of the main UQL fetch, and since we can't fetch contributor cases directly, return
      # an optional second array element containing either null or the promise for the contributor cases
      [CaseLogic.fetchCasesUql(finalUql), if _.contains(userRoles, RoutingRoles.key_mapping.OWNED_CASES) then CaseLogic.fetchContributorCasesUql({where: RoutingRoles._CONTRIBUTOR(user)}) else null]

    )
    .spread((cases, contributorCases) ->
      contribCases = contributorCases || []
      logger.debug("fetched #{cases.length} main case(s) and #{contribCases.length} contributor case(s)")
      deferred.resolve {
        cases: _.chain([[cases || []], [contribCases]]).flatten().without(undefined).uniq((c) -> c.externalModelId).each((c) -> c.resource.caseNumber = S(c.resource.caseNumber).padLeft(8, '0').s).value(),
        userRoles: userRoles
        defaultRoles: defaultRoles
        urlRoles: urlRoles
        uql: finalUql.where
      }
    )
#    .then((cases) ->
#      logger.debug("fetched #{cases.length} cases")
#      deferred.resolve _.chain([cases || []]).flatten().without(undefined).uniq((c) -> c.externalModelId).each((c) -> c.resource.caseNumber = S(c.resource.caseNumber).padLeft(8, '0').s).value()
#    )
    .catch((err) ->
      logger.error(err?.stack || err)
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
