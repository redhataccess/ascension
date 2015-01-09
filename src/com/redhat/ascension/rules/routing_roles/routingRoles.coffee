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
RoutingRoles.COLLABORATION = (user) ->
  #if super_region is 'EMEA'
  #  undefined

  #AND (
  #  (Case__r.Status = 'Waiting on Red Hat' OR Case__r.FTS__c = TRUE)
  #  OR
  #  (Case__r.Status = 'Waiting on Customer' AND Case__r.Internal_Status__c = 'Waiting on Owner')
  #)

#  where: if sbrConds?.length > 0 then UQL.and(UQL.or.apply(null, sbrConds), statusCond) else statusCond
  wocCond = UQL.cond('internalStatus', 'is', '"Waiting on Collaboration"')
  closedCond = UQL.cond('status', 'ne', 'Closed')
  worhCond = UQL.cond('status', 'is', '"Waiting on Red Hat"')

  # Use with UQL.or.apply(null, sbrConds)
  sbrConds = _.map(user.sbrs, (s) -> UQL.cond('sbrGroup', 'is', """\"#{s}\""""))

  """(#{wocCond} and #{UQL.or.apply(null, sbrConds)})"""
  UQL.and(wocCond, UQL.or.apply(null, sbrConds))

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

#  #language=SQL
#  example = """
#(
#  OwnerId = '{owner_id}'
#  AND (
#      (Status = 'Waiting on Red Hat' OR FTS__c = TRUE)
#      OR
#      (Status = 'Waiting on Customer' AND Internal_Status__c = 'Waiting on Owner')
#  )
#)
#OR
#(FTS_Role__c LIKE '%{kerberos}%' AND FTS__c = TRUE)
#  """
  """(#{ownerCond} and ((#{worhCond} or #{ftsCond}) or (#{wocCond} and #{wooCond}))) or (#{ftsRoleCond} and #{ftsCond})"""

module.exports = RoutingRoles
