_     = require 'lodash'
UQL   = require '../../uds/uqlConditionBuilderMixin'

#https://mojo.redhat.com/docs/DOC-998524
RoutingRoles = {}

######################################################
# Case related
######################################################

#Filters
#  Internal status equal to "Waiting on collaboration"
#  Status not equal to "Closed"
#  Status equals "Waiting on Red Hat"
#  TAM case not equal to "TRUE"(This is for EMEA only.  Americas, India, and APAC in the TAM 6/1 workflow no longer exclude TAM cases)
#  SBR Group includes "<group1>,<group2>"(Matches users current SBRs)
# TODO -- this can't be completed until the UDS has isTAM included

RoutingRoles._makeSbrConds = (user) ->
  # Use with UQL.or.apply(null, sbrConds)
  sbrConds = _.map(user.sbrs, (s) -> UQL.cond('sbrGroup', 'is', """\"#{s}\""""))
  UQL.or.apply(null, sbrConds)

RoutingRoles.COLLABORATION = (user) ->
  wocCond = UQL.cond('internalStatus', 'is', '"Waiting on Collaboration"')
  worhCond = UQL.cond('status', 'is', '"Waiting on Red Hat"')

  """(#{wocCond} and #{worhCond} and #{this._makeSbrConds(user)})"""

#TODO need filter logic and contributors field
RoutingRoles.OWNED_CASES = (user) ->

#  where: if sbrConds?.length > 0 then UQL.and(UQL.or.apply(null, sbrConds), statusCond) else statusCond
  internalStatusCond = UQL.cond('internalStatus', 'is', '"Waiting on Owner"')
  ownerCond = UQL.cond('ownerId', 'is', """\"#{user.id}\"""")
  worhCond = UQL.cond('status', 'is', '"Waiting on Red Hat"')
  wocCond = UQL.cond('status', 'is', '"Waiting on Customer"')
  wooCond = UQL.cond('internalStatus', 'is', '"Waiting on Owner"')
  ftsCond = UQL.cond('isFTS', 'is', true)
  ftsRoleCond = UQL.cond('ftsRole', 'like', """\"#{user.kerberos}\"""")

  #"""(#{ownerCond} and ((#{worhCond} or #{ftsCond}) or (#{wocCond} and #{wooCond}))) or (#{ftsRoleCond} and #{ftsCond})"""
  """(#{internalStatusCond} and ((#{ownerCond} or #{ftsRoleCond}) or (#{wocCond} and #{wooCond})) and #{worhCond}"""

# TODO can't be implemented until we can query the user's geo in relation to the case geo
RoutingRoles.FTS = (user) ->

  """
  Filters
  No owner/role for User's current Geo on ticket
  24x7 equals "TRUE"
  SBR Group includes "<group1>,<group2>"(Matches users current SBRs)
  """

  ftsCond = UQL.cond('isFTS', 'is', true)
  ftsRoleCond = UQL.cond('ftsRole', 'is', '""')
  """(#{ftsCond} and #{ftsRoleCond} and #{this._makeSbrConds(user)})"""

RoutingRoles._NNO_SUPER_REGION = (user, super_region) ->

  """
  NNO = "NA"
  SBR Group includes "<group1>,<group2>"(Matches users current SBRs)
  """

  nnoNaCond = UQL.cond('nnoSuperRegion', 'is', """\"#{super_region}\"""")
  """(#{nnoNaCond} and #{this._makeSbrConds(user)})"""

RoutingRoles.NNO_NA = (user) -> this._NNO_SUPER_REGION(user, 'NA')
RoutingRoles.NNO_APAC = (user) -> this._NNO_SUPER_REGION(user, 'APAC')
RoutingRoles.NNO_INDIA = (user) -> this._NNO_SUPER_REGION(user, 'INDIA')
RoutingRoles.NNO_EMEA = (user) -> this._NNO_SUPER_REGION(user, 'EMEA')

# INFO - UDS adds ownerId != spamId to all calls, so unassigned can drop that
RoutingRoles.NCQ = (user) ->

  #OwnerId != '{spam_queue_id}'
  #AND Internal_Status__c = 'Unassigned'
  #AND Status != 'Closed'
  #AND Product__c LIKE '%%JBoss%%'
  #ORDER BY SBT__c ASC

  unassignedCond = UQL.cond('internalStatus', 'is', """\"Unassigned\"""")
  notClosedCond = UQL.cond('status', 'ne', """\"Closed\"""")
  """(#{unassignedCond} and #{notClosedCond} and #{this._makeSbrConds(user)})"""

module.exports = RoutingRoles
