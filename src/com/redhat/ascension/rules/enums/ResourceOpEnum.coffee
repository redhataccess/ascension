_ = require 'lodash'

# The Entity operation is the operation that needs to be performed on the entity in question
# So for example a 'Waiting on Owner' case operation would be to update the case.

# This all is primarily meta data driven by existing fields
ResourceOp = {}

######################################################
# Case related
######################################################

ResourceOp.TAKE_FTS =
  name: 'FTS'
  display: 'Take FTS Role'
_.defaults ResourceOp,
  'FTS': ResourceOp.TAKE_FTS

ResourceOp.TAKE_OWNERSHIP =
  name: 'TAKE_OWNERSHIP'
  display: 'Take ownership'
_.defaults ResourceOp,
  'TAKE_OWNERSHIP': ResourceOp.TAKE_OWNERSHIP

ResourceOp.COLLABORATE =
  name: 'COLLABORATE'
  display: 'Collaborate'
_.defaults ResourceOp,
  'COLLABORATE': ResourceOp.COLLABORATE

ResourceOp.CONTRIBUTE =
  name: 'CONTRIBUTE'
  display: 'Contribute'
_.defaults ResourceOp,
  'CONTRIBUTE': ResourceOp.CONTRIBUTE

ResourceOp.UPDATE =
  name: 'UPDATE'
  display: 'Update case'
_.defaults ResourceOp,
  'UPDATE': ResourceOp.UPDATE

ResourceOp.SET_SBRS =
  name: 'SET_SBRS'
  display: 'Set SBRs'
_.defaults ResourceOp,
  'SET_SBRS': ResourceOp.SET_SBRS

ResourceOp.SET_TAGS =
  name: 'SET_TAGS'
  display: 'Set tags'
_.defaults ResourceOp,
  'SET_TAGS': ResourceOp.SET_TAGS

ResourceOp.TRANSLATE =
  name: 'TRANSLATE'
  display: 'Translate'
_.defaults ResourceOp,
  'TRANSLATE': ResourceOp.TRANSLATE

ResourceOp.NOOP =
  name: 'NOOP'
  display: 'No action required'
_.defaults ResourceOp,
  'NOOP': ResourceOp.NOOP

ResourceOp.FOLLOW_UP_WITH_ENGINEERING =
  name: 'FOLLOW_UP_WITH_ENGINEERING '
  display: 'Follow up with engineering'
_.defaults ResourceOp,
  'FOLLOW_UP_WITH_ENGINEERING': ResourceOp.FOLLOW_UP_WITH_ENGINEERING

ResourceOp.FOLLOW_UP_WITH_SALES =
  name: 'FOLLOW_UP_WITH_SALES'
  display: 'Follow up with sales'
_.defaults ResourceOp,
  'FOLLOW_UP_WITH_SALES': ResourceOp.FOLLOW_UP_WITH_SALES

######################################################
# KCS related
######################################################

ResourceOp.CREATE_KCS =
  name: 'CREATE_KCS'
  display: 'Create KCS Content for case'
_.defaults ResourceOp,
  'CREATE_KCS': ResourceOp.CREATE_KCS

# Map case internal status to entity operations
ResourceOp.getOpFromIntStatus = (intStatus) ->
  switch intStatus
    when 'Closed' then ResourceOp.NOOP
    when 'Waiting on Owner' then ResourceOp.UPDATE
    when 'Waiting on Engineering' then ResourceOp.FOLLOW_UP_WITH_ENGINEERING
    when 'Waiting on Customer' then ResourceOp.NOOP
    when 'Unassigned' then ResourceOp.TAKE_OWNERSHIP
    when 'Waiting on PM' then ResourceOp.NOOP
    when 'Waiting on QA' then ResourceOp.UPDATE
    when 'Waiting on Contributor' then ResourceOp.CONTRIBUTE
    when 'Waiting on Sales' then ResourceOp.FOLLOW_UP_WITH_SALES
    when 'Waiting on 3rd Party Vendor' then ResourceOp.NOOP
    when 'Waiting on Collaboration' then ResourceOp.COLLABORATE
    when 'Waiting on Translation' then ResourceOp.UPDATE
    else ResourceOp.UPDATE

module.exports = ResourceOp
