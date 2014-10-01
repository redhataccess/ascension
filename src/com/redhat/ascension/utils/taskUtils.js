(function() {
  var TaskRules, TaskUtils, logger, moment, prettyjson, settings, _;

  _ = require('lodash');

  settings = require('../settings/settings');

  moment = require('moment');

  logger = require('tracer').colorConsole(exports.logger_config);

  prettyjson = require('prettyjson');

  TaskRules = require('../rules/taskRules');

  TaskUtils = {};

  TaskUtils.generateMockTask = function(overrides) {
    var c, t;
    c = {
      accountNumber: '1301972',
      caseNumber: '00024904',
      collaborationScore: 2334,
      created: new Date(2014, 5, 5),
      sbt: 1000,
      sbrs: ['JBoss Base AS', 'Webservers'],
      severity: '3 (Normal)',
      status: 'Waiting on Red Hat',
      internalStatus: 'Unassigned',
      strategic: 'Yes',
      tags: ['httpd']
    };
    if ((overrides != null ? overrides["case"] : void 0) != null) {
      _.assign(c, overrides['case']);
    }
    t = TaskRules.makeTaskFromCase(c);
    if ((overrides != null ? overrides.task : void 0) != null) {
      _.assign(t, overrides['task']);
    }
    return t;
  };

  module.exports = TaskUtils;

}).call(this);

//# sourceMappingURL=taskUtils.js.map
