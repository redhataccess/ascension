_     = require 'lodash'
UQL   = require '../../uds/uqlConditionBuilderMixin'

#https://mojo.redhat.com/docs/DOC-998524
RoutingRoles = {}

######################################################
# Case related
######################################################

RoutingRoles._makeSbrConds = (user) ->
  # Use with UQL.or.apply(null, sbrConds)
  sbrConds = _.map(user.sbrs, (s) -> UQL.cond('sbrGroup', 'is', """\"#{s}\""""))
  UQL.or.apply(null, sbrConds)

RoutingRoles.COLLABORATION = (user) ->
  wocCond = UQL.cond('internalStatus', 'is', '"Waiting on Collaboration"')
  notClosedCond = UQL.cond('status', 'ne', '"Closed"')

  #"""(#{wocCond} and #{notClosedCond} and #{RoutingRoles._makeSbrConds(user)})"""
  UQL.and(wocCond, UQL.and(notClosedCond, RoutingRoles._makeSbrConds(user)))

# This is a supplemental role to the owned cases role, since we can't roll it into one UQL query, have to split it apart
# Contributor example
# /case/associates?where=((userId is "005A0000001qUouIAE" and caseStatus is "Waiting on Red Hat") and (caseInternalStatus is "Waiting on Contributor" and roleName is "Contributor")
RoutingRoles._CONTRIBUTOR = (user) ->
  ownerCond = UQL.cond('userId', 'is', """\"#{user.id}\"""")
  worhCond = UQL.cond('caseStatus', 'is', '"Waiting on Red Hat"')
  wocCond = UQL.cond('caseInternalStatus', 'is', '"Waiting on Contributor"')
  contributorCond = UQL.cond('roleName', 'is', '"Contributor"')
  #"""((#{ownerCond} and #{worhCond}) and (#{wocCond} and #{contributorCond}))"""
  UQL.and(ownerCond, UQL.and(worhCond, UQL.and(wocCond, contributorCond)))

RoutingRoles.OWNED_CASES = (user) ->

  internalStatusCond = UQL.cond('internalStatus', 'is', '"Waiting on Owner"')
  ownerCond = UQL.cond('ownerId', 'is', """\"#{user.id}\"""")
  worhCond = UQL.cond('status', 'is', '"Waiting on Red Hat"')
  wocCond = UQL.cond('status', 'is', '"Waiting on Customer"')
  wooCond = UQL.cond('internalStatus', 'is', '"Waiting on Owner"')
  ftsCond = UQL.cond('isFTS', 'is', true)
  ftsRoleCond = UQL.cond('ftsRole', 'like', """\"%#{user.kerberos}%\"""")
  notClosedCond = UQL.cond('status', 'ne', '"Closed"')

#FROM
#  Case
#WHERE
#  (OwnerId = '{owner_id}'
#    AND (
#      (Status = 'Waiting on Red Hat' OR FTS__c = TRUE)
#      OR
#      (Status = 'Waiting on Customer' AND Internal_Status__c = 'Waiting on Owner')
#    )
#  )
#  OR
#  (FTS_Role__c LIKE '%{kerberos}%' AND FTS__c = TRUE)

  # Alt version that is more inline with the official routing roles
  #  (OwnerId = '{owner_id}' AND (Status = 'Waiting on Red Hat' OR Internal_Status__c = 'Waiting on Owner')
  #  OR
  #  (FTS_Role__c LIKE '%{kerberos}%')

  #"""((#{ownerCond} and ((#{worhCond} or #{ftsCond}) or (#{wocCond} and #{wooCond}))) or (#{ftsRoleCond} and #{ftsCond}))"""
  #UQL.or(UQL.and(ownerCond, UQL.or(UQL.and(worhCond, ftsCond), UQL.and(wocCond, wooCond))), UQL.and(ftsRoleCond, ftsCond))
  UQL.or(UQL.and(ownerCond, UQL.or(worhCond, wooCond)), UQL.and(ftsRoleCond, notClosedCond))

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
  #"""(#{ftsCond} and #{ftsRoleCond} and #{RoutingRoles._makeSbrConds(user)})"""
  UQL.and(ftsCond, UQL.and(ftsRoleCond, RoutingRoles._makeSbrConds(user)))

RoutingRoles._NNO_SUPER_REGION = (user, super_region) ->

  """
  NNO = "NA"
  SBR Group includes "<group1>,<group2>"(Matches users current SBRs)
  """

  nnoRegionCond = UQL.cond('nnoSuperRegion', 'is', """\"#{super_region}\"""")
  #"""(#{nnoNaCond} and #{RoutingRoles._makeSbrConds(user)})"""
  UQL.and(nnoRegionCond, RoutingRoles._makeSbrConds(user))

RoutingRoles.NNO_NA = (user) -> this._NNO_SUPER_REGION(user, 'NA')
RoutingRoles.NNO_APAC = (user) -> this._NNO_SUPER_REGION(user, 'APAC')
RoutingRoles.NNO_INDIA = (user) -> this._NNO_SUPER_REGION(user, 'INDIA')
RoutingRoles.NNO_EMEA = (user) -> this._NNO_SUPER_REGION(user, 'EMEA')

# INFO - UDS adds ownerId != spamId to all calls, so unassigned can drop that
RoutingRoles.NCQ = (user) ->
  unassignedCond = UQL.cond('internalStatus', 'is', """\"Unassigned\"""")
  notClosedCond = UQL.cond('status', 'ne', """\"Closed\"""")
  #"""(#{unassignedCond} and #{notClosedCond} and #{RoutingRoles._makeSbrConds(user)})"""
  UQL.and(unassignedCond, UQL.and(notClosedCond, RoutingRoles._makeSbrConds(user)))

######################################################
# Mapping
######################################################
#ex. Role:
#{
#  "resource": {
#    "name": "ascension-owned-cases",
#    "description": "Ascension - Owned Cases",
#    "superRegion": "NA"
#  },
#  "resourceReliability": "Fresh",
#  "externalModelId": 39
#},
RoutingRoles.extractRoutingRoles = (user) ->
  roleNames = []
  if user?.roles?.length > 0
    _.each user.roles, (r) ->
      if RoutingRoles.mapping[r.resource.name.toLowerCase()]?
        roleNames.push r.resource.name.toLowerCase()

  roleNames

RoutingRoles.key_mapping = {
  OWNED_CASES: "ascension-owned-cases"
  COLLABORATION: "ascension-collaboration"
  NNO_APAC: "ascension-nno-apac"
  NNO_NA: "ascension-nno-na"
  NNO_INDIA: "ascension-nno-india"
  NNO_EMEA: "ascension-nno-emea"
  FTS: "ascension-fts"
  NCQ: "ascension-ncq"
}

RoutingRoles.mapping = {
  "owned_cases": RoutingRoles.OWNED_CASES
  "ascension-owned-cases": RoutingRoles.OWNED_CASES

  "collaboration": RoutingRoles.COLLABORATION
  "ascension-collaboration": RoutingRoles.COLLABORATION

  "nno_apac": RoutingRoles.NNO_APAC
  "ascension-nno-apac": RoutingRoles.NNO_APAC
  "nno_na": RoutingRoles.NNO_NA
  "ascension-nno-na": RoutingRoles.NNO_NA
  "nno_india": RoutingRoles.NNO_INDIA
  "ascension-nno-india": RoutingRoles.NNO_INDIA
  "nno_emea": RoutingRoles.NNO_EMEA
  "ascension-nno-emea": RoutingRoles.NNO_EMEA

  "fts": RoutingRoles.FTS
  "ascension-fts": RoutingRoles.FTS

  "ncq": RoutingRoles.NCQ
  "ascension-ncq": RoutingRoles.NCQ

}

module.exports = RoutingRoles
