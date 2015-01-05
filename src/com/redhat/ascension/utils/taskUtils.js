(function() {
  var MongoOperations, TaskOpEnum, TaskRules, TaskStateEnum, TaskTypeEnum, TaskUtils, logger, moment, prettyjson, settings, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  settings = require('../settings/settings');

  moment = require('moment');

  logger = require('tracer').colorConsole(exports.logger_config);

  prettyjson = require('prettyjson');

  TaskRules = require('../rules/taskRules');

  MongoOperations = require('../db/MongoOperations');

  TaskTypeEnum = require('../rules/enums/TaskTypeEnum');

  TaskOpEnum = require('../rules/enums/TaskOpEnum');

  TaskStateEnum = require('../rules/enums/TaskStateEnum');

  TaskUtils = {};

  TaskUtils.parseSfArray = function(o) {
    if ((o != null) && o !== '') {
      if (__indexOf.call(o, ';') >= 0) {
        return o.split(';');
      }
      if (_.isArray(o)) {
        return o;
      } else {
        return [o];
      }
    }
    return [];
  };

  TaskUtils.makeTaskFromCase = function(c) {
    return {
      _id: null,
      bid: ("" + c['caseNumber']) || ("" + c['CaseNumber']),
      score: c['collaborationScore'] || c['Collaboration_Score__c'] || 0,
      timeout: -1,
      sbrs: c['sbrs'] || this.parseSfArray(c['SBR_Group__c']),
      tags: c['tags'] || this.parseSfArray(c['Tags__c']),
      owner: null,
      created: new Date(),
      closed: null,
      type: TaskTypeEnum.CASE.name,
      taskOp: TaskOpEnum.NOOP.name,
      entityOp: TaskOpEnum.NOOP.name,
      state: TaskStateEnum.UNASSIGNED.name,
      'case': {
        status: c['status'] || c['Status'],
        internalStatus: c['internalStatus'] || c['Internal_Status__c'],
        severity: c['severity'] || c['Severity__c'],
        sbrs: c['sbrs'] || this.parseSfArray(c['SBR_Group__c']),
        tags: c['tags'] || this.parseSfArray(c['Tags__c']),
        sbt: c['sbt'] || c['SBT__c'],
        created: c['created'] || c['CreatedDate'],
        score: c['collaborationScore'] || c['Collaboration_Score__c'],
        subject: c['subject'] || c['Subject']
      }
    };
  };

  TaskUtils.saveRuleTask = function(t) {
    var x;
    x = new MongoOperations['models']['task']();
    _.keys(t).forEach(function(key) {
      if (key !== 'toString') {
        return x[key] = t[key];
      }
    });
    _.keys(t['case']).forEach(function(key) {
      if (key !== 'toString') {
        return x['case'][key] = t['case'][key];
      }
    });
    return x.saveQ();
  };

  TaskUtils.taskFromCaseUpdateHash = function(t, c) {
    return {
      'score': c['collaborationScore'] || 0,
      'sbrs': c['sbrs'],
      'tags': c['tags'],
      'lastUpdated': new Date(),
      'case': c
    };
  };

  TaskUtils.updateTaskFromCase = function(t, c) {
    return MongoOperations['models']['task'].where().setOptions({
      multi: true
    }).update({
      'bid': c['caseNumber']
    }, this.taskFromCaseUpdateHash(t, c)).exec();
  };

  TaskRules.makeTaskFromCase = function(c) {
    return {
      _id: null,
      bid: ("" + c['caseNumber']) || ("" + c['CaseNumber']),
      score: c['collaborationScore'] || c['Collaboration_Score__c'] || 0,
      timeout: -1,
      sbrs: c['sbrs'] || this.parseSfArray(c['SBR_Group__c']),
      tags: c['tags'] || this.parseSfArray(c['Tags__c']),
      owner: null,
      created: new Date(),
      closed: null,
      type: TaskTypeEnum.CASE.name,
      taskOp: TaskOpEnum.NOOP.name,
      entityOp: TaskOpEnum.NOOP.name,
      state: TaskStateEnum.UNASSIGNED.name,
      'case': {
        status: c['status'] || c['Status'],
        internalStatus: c['internalStatus'] || c['Internal_Status__c'],
        severity: c['severity'] || c['Severity__c'],
        sbrs: c['sbrs'] || this.parseSfArray(c['SBR_Group__c']),
        tags: c['tags'] || this.parseSfArray(c['Tags__c']),
        sbt: c['sbt'] || c['SBT__c'],
        created: c['created'] || c['CreatedDate'],
        score: c['collaborationScore'] || c['Collaboration_Score__c'],
        subject: c['subject'] || c['Subject']
      }
    };
  };

  TaskUtils.generateMockTask = function(overrides) {
    var c, t;
    c = {
      accountNumber: '1234567',
      caseNumber: '00012345',
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
    t = TaskUtils.makeTaskFromCase(c);
    if ((overrides != null ? overrides.task : void 0) != null) {
      _.assign(t, overrides['task']);
    }
    return t;
  };

  module.exports = TaskUtils;

}).call(this);

//# sourceMappingURL=taskUtils.js.map
