_ = require 'lodash'

# The Entity operation is the operation that needs to be performed on the entity in question
# So for example a 'Waiting on Owner' case operation would be to update the case.

# This all is primarily meta data driven by existing fields
ResourceOp = {}

######################################################
# Case related
######################################################

ResourceOp.TAKE_FTS =
  name: 'fts'
  display: 'Take FTS Role on case'
_.defaults ResourceOp,
  'fts': ResourceOp.TAKE_FTS

ResourceOp.OWN =
  name: 'takeOwnership'
  display: 'Take ownership of case'
_.defaults ResourceOp,
  'takeOwnership': ResourceOp.TAKE_FTS

ResourceOp.COLLABORATE =
  name: 'collaborate'
  display: 'Collaborate on case'
_.defaults ResourceOp,
  'collaborate': ResourceOp.COLLABORATE

ResourceOp.CONTRIBUTE =
  name: 'contribute'
  display: 'Contribute on case'
_.defaults ResourceOp,
  'contribute': ResourceOp.CONTRIBUTE

ResourceOp.UPDATE =
  name: 'update'
  display: 'Update case'
_.defaults ResourceOp,
  'update': ResourceOp.UPDATE

ResourceOp.SET_SBRS =
  name: 'setSbrs'
  display: 'Set SBRs on case'
_.defaults ResourceOp,
  'setSbrs': ResourceOp.SET_SBRS

ResourceOp.SET_TAGS =
  name: 'setTags'
  display: 'Set tags on case'
_.defaults ResourceOp,
  'setTags': ResourceOp.SET_TAGS

ResourceOp.TRANSLATE =
  name: 'translate'
  display: 'Translate case'
_.defaults ResourceOp,
  'translate': ResourceOp.TRANSLATE

ResourceOp.NOOP =
  name: 'noop'
  display: 'No action required'
_.defaults ResourceOp,
  'noop': ResourceOp.NOOP

ResourceOp.FOLLOW_UP_WITH_ENGINEERING =
  name: 'followUpWithEngineering'
  display: 'Follow up with engineering on case'
_.defaults ResourceOp,
  'followUpWithEngineering': ResourceOp.FOLLOW_UP_WITH_ENGINEERING

ResourceOp.FOLLOW_UP_WITH_SALES =
  name: 'followUpWithSales'
  display: 'Follow up with sales on case'
_.defaults ResourceOp,
  'followUpWithSales': ResourceOp.FOLLOW_UP_WITH_SALES

######################################################
# KCS related
######################################################

ResourceOp.CREATE_KCS =
  name: 'createKcsContent'
  display: 'Create KCS Content for case'
_.defaults ResourceOp,
  'createKcsContent': ResourceOp.CREATE_KCS

# Map case internal status to entity operations
ResourceOp.getOpFromIntStatus = (intStatus) ->
  switch intStatus
    when 'Closed' then ResourceOp.NOOP
    when 'Waiting on Owner' then ResourceOp.UPDATE
    when 'Waiting on Engineering' then ResourceOp.FOLLOW_UP_WITH_ENGINEERING
    when 'Waiting on Customer' then ResourceOp.NOOP
    when 'Unassigned' then ResourceOp.OWN
    when 'Waiting on PM' then ResourceOp.NOOP
    when 'Waiting on QA' then ResourceOp.UPDATE
    when 'Waiting on Contributor' then ResourceOp.CONTRIBUTE
    when 'Waiting on Sales' then ResourceOp.FOLLOW_UP_WITH_SALES
    when 'Waiting on 3rd Party Vendor' then ResourceOp.NOOP
    when 'Waiting on Collaboration' then ResourceOp.COLLABORATE
    when 'Waiting on Translation' then ResourceOp.UPDATE
    else ResourceOp.UPDATE

module.exports = ResourceOp
