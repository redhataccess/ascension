_ = require 'lodash'

# The Entity operation is the operation that needs to be performed on the entity in question
# So for example a 'Waiting on Owner' case operation would be to update the case.

# This all is primarily meta data driven by existing fields
EntityOp = {}

EntityOp.TAKE_FTS =
  name: 'fts'
  display: 'Take FTS Role'
_.defaults EntityOp,
  'fts': EntityOp.TAKE_FTS

EntityOp.OWN =
  name: 'takeOwnership'
  display: 'Take ownership of this case'
_.defaults EntityOp,
  'takeOwnership': EntityOp.TAKE_FTS

EntityOp.COLLABORATE =
  name: 'collaborate'
  display: 'Collaborate on this case'
_.defaults EntityOp,
  'collaborate': EntityOp.COLLABORATE

EntityOp.CONTRIBUTE =
  name: 'contribute'
  display: 'Contribute on this case'
_.defaults EntityOp,
  'contribute': EntityOp.CONTRIBUTE

EntityOp.UPDATE =
  name: 'update'
  display: 'Update this case'
_.defaults EntityOp,
  'update': EntityOp.UPDATE

EntityOp.SET_SBRS =
  name: 'setSbrs'
  display: 'Set SBRs on this case'
_.defaults EntityOp,
  'setSbrs': EntityOp.SET_SBRS

EntityOp.SET_TAGS =
  name: 'setTags'
  display: 'Set tags on this case'
_.defaults EntityOp,
  'setTags': EntityOp.SET_TAGS

EntityOp.TRANSLATE =
  name: 'translate'
  display: 'Translate this case'
_.defaults EntityOp,
  'translate': EntityOp.TRANSLATE

EntityOp.NOOP =
  name: 'noop'
  display: 'No action required'
_.defaults EntityOp,
  'noop': EntityOp.NOOP

EntityOp.FOLLOW_UP_WITH_ENGINEERING =
  name: 'followUpWithEngineering'
  display: 'Follow up with engineering'
_.defaults EntityOp,
  'followUpWithEngineering': EntityOp.FOLLOW_UP_WITH_ENGINEERING

EntityOp.FOLLOW_UP_WITH_SALES =
  name: 'followUpWithSales'
  display: 'Follow up with sales'
_.defaults EntityOp,
  'followUpWithSales': EntityOp.FOLLOW_UP_WITH_SALES

# Map case internal status to entity operations
EntityOp.getOpFromIntStatus = (intStatus) ->
  switch intStatus
    when 'Closed' then EntityOp.NOOP
    when 'Waiting on Owner' then EntityOp.UPDATE
    when 'Waiting on Engineering' then EntityOp.FOLLOW_UP_WITH_ENGINEERING
    when 'Waiting on Customer' then EntityOp.NOOP
    when 'Unassigned' then EntityOp.OWN
    when 'Waiting on PM' then EntityOp.NOOP
    when 'Waiting on QA' then EntityOp.UPDATE
    when 'Waiting on Contributor' then EntityOp.CONTRIBUTE
    when 'Waiting on Sales' then EntityOp.FOLLOW_UP_WITH_SALES
    when 'Waiting on 3rd Party Vendor' then EntityOp.NOOP
    when 'Waiting on Collaboration' then EntityOp.COLLABORATE
    when 'Waiting on Translation' then EntityOp.UPDATE
    else EntityOp.UPDATE

module.exports = EntityOp
