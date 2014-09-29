(function() {
  var EntityOp, _;

  _ = require('lodash');

  EntityOp = {};

  EntityOp.TAKE_FTS = {
    name: 'fts',
    display: 'Take FTS Role'
  };

  _.defaults(EntityOp, {
    'fts': EntityOp.TAKE_FTS
  });

  EntityOp.OWN = {
    name: 'takeOwnership',
    display: 'Take ownership of this case'
  };

  _.defaults(EntityOp, {
    'takeOwnership': EntityOp.TAKE_FTS
  });

  EntityOp.COLLABORATE = {
    name: 'collaborate',
    display: 'Collaborate on this case'
  };

  _.defaults(EntityOp, {
    'collaborate': EntityOp.COLLABORATE
  });

  EntityOp.CONTRIBUTE = {
    name: 'contribute',
    display: 'Contribute on this case'
  };

  _.defaults(EntityOp, {
    'contribute': EntityOp.CONTRIBUTE
  });

  EntityOp.UPDATE = {
    name: 'update',
    display: 'Update this case'
  };

  _.defaults(EntityOp, {
    'update': EntityOp.UPDATE
  });

  EntityOp.SET_SBRS = {
    name: 'setSbrs',
    display: 'Set SBRs on this case'
  };

  _.defaults(EntityOp, {
    'setSbrs': EntityOp.SET_SBRS
  });

  EntityOp.SET_TAGS = {
    name: 'setTags',
    display: 'Set tags on this case'
  };

  _.defaults(EntityOp, {
    'setTags': EntityOp.SET_TAGS
  });

  EntityOp.TRANSLATE = {
    name: 'translate',
    display: 'Translate this case'
  };

  _.defaults(EntityOp, {
    'translate': EntityOp.TRANSLATE
  });

  EntityOp.NOOP = {
    name: 'noop',
    display: 'No action required'
  };

  _.defaults(EntityOp, {
    'noop': EntityOp.NOOP
  });

  EntityOp.FOLLOW_UP_WITH_ENGINEERING = {
    name: 'followUpWithEngineering',
    display: 'Follow up with engineering'
  };

  _.defaults(EntityOp, {
    'followUpWithEngineering': EntityOp.FOLLOW_UP_WITH_ENGINEERING
  });

  EntityOp.FOLLOW_UP_WITH_SALES = {
    name: 'followUpWithSales',
    display: 'Follow up with sales'
  };

  _.defaults(EntityOp, {
    'followUpWithSales': EntityOp.FOLLOW_UP_WITH_SALES
  });

  EntityOp.getOpFromIntStatus = function(intStatus) {
    switch (intStatus) {
      case 'Closed':
        return EntityOp.NOOP;
      case 'Waiting on Owner':
        return EntityOp.UPDATE;
      case 'Waiting on Engineering':
        return EntityOp.FOLLOW_UP_WITH_ENGINEERING;
      case 'Waiting on Customer':
        return EntityOp.NOOP;
      case 'Unassigned':
        return EntityOp.OWN;
      case 'Waiting on PM':
        return EntityOp.NOOP;
      case 'Waiting on QA':
        return EntityOp.UPDATE;
      case 'Waiting on Contributor':
        return EntityOp.CONTRIBUTE;
      case 'Waiting on Sales':
        return EntityOp.FOLLOW_UP_WITH_SALES;
      case 'Waiting on 3rd Party Vendor':
        return EntityOp.NOOP;
      case 'Waiting on Collaboration':
        return EntityOp.COLLABORATE;
      case 'Waiting on Translation':
        return EntityOp.UPDATE;
      default:
        return EntityOp.UPDATE;
    }
  };

  module.exports = EntityOp;

}).call(this);

//# sourceMappingURL=EntityOpEnum.js.map
