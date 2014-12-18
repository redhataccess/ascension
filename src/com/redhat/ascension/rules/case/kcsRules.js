(function() {
  var EntityOpEnum, KcsRules, MongoOperations, Q, TaskOpEnum, TaskRules, TaskStateEnum, TaskTypeEnum, logger, moment, mongoose, mongooseQ, nools, prettyjson, request, salesforce, settings, _;

  nools = require('nools');

  logger = require('tracer').colorConsole();

  prettyjson = require('prettyjson');

  salesforce = require('../../db/salesforce');

  settings = require('../../settings/settings');

  Q = require('q');

  MongoOperations = require('../../db/MongoOperations');

  TaskRules = require('../taskRules');

  TaskStateEnum = require('../enums/TaskStateEnum');

  TaskTypeEnum = require('../enums/TaskTypeEnum');

  TaskOpEnum = require('../enums/TaskOpEnum');

  EntityOpEnum = require('../enums/ResourceOpEnum');

  _ = require('lodash');

  moment = require('moment');

  mongoose = require('mongoose');

  mongooseQ = require('mongoose-q')(mongoose);

  request = require('request');

  KcsRules = {};

  KcsRules.intStatus = function(c, intStatus) {
    return c['internalStatus'] === intStatus;
  };

  KcsRules.taskExistsWithEntityOp = function(tasks, intStatus) {
    return _.find(tasks, function(t) {
      return t['entityOp'] === intStatus;
    }) !== false;
  };

  KcsRules.findTask = function(c, tasks, entityOp) {
    return _.find(tasks, function(t) {
      return t['entityOp'] === entityOp;
    });
  };

  KcsRules.updateTaskFromCase = function(c, t) {
    var updateHash;
    logger.warn("Existing " + c['internalStatus'] + " Task: " + c['caseNumber'] + ", updating metadata");
    updateHash = TaskRules.taskFromCaseUpdateHash(t, c);
    _.assign(t, updateHash);
    return TaskRules.updateTaskFromCase(t, c);
  };

  KcsRules.normalizeCase = function(c) {
    var x, _ref;
    x = {
      status: c['status'] || c['Status'],
      internalStatus: c['internalStatus'] || c['Internal_Status__c'],
      severity: c['severity'] || c['Severity__c'],
      sbrs: c['sbrs'] || TaskRules.parseSfArray(c['SBR_Group__c']),
      tags: c['tags'] || TaskRules.parseSfArray(c['Tags__c']),
      sbt: c['sbt'] || c['SBT__c'] || null,
      created: c['created'] || c['CreatedDate'],
      collaborationScore: c['collaborationScore'] || c['Collaboration_Score__c'],
      caseNumber: c['caseNumber'] || c['CaseNumber'],
      linkedSolutionCount: _.filter(((_ref = c['Case_Resource_Relationships__r']) != null ? _ref['records'] : void 0) || [], function(r) {
        return r['Resource_Type__c'] === 'Solution' && _.contains(['Link', 'Link;Pin'], r['Type__c']);
      }).length
    };
    logger.debug("here");
    return x;
  };

  KcsRules.match = function(opts) {
    var cases, deferred, existingTasks, existingTasksByBid, promises, self;
    self = KcsRules;
    deferred = Q.defer();
    cases = opts['cases'] || [];
    existingTasks = opts['existingTasks'] || [];
    promises = [];
    existingTasksByBid = _.groupBy(existingTasks, function(t) {
      return t['bid'];
    });
    logger.debug("KcsRules matching " + cases.length + " cases");
    _.each(cases, function(c) {
      var entityOp, existingTask, t;
      if (c['linkedSolutionCount'] === 0) {
        entityOp = EntityOpEnum.CREATE_KCS;
        existingTask = self.findTask(c, existingTasksByBid[c['caseNumber']], entityOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          t = TaskRules.makeTaskFromCase(c);
          logger.warn("Discovered case without a KCS resource: " + t['bid'] + " setting the task to " + entityOp.display + ".");
          t.type = TaskTypeEnum.KCS.name;
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.entityOp = entityOp.name;
          return promises.push(TaskRules.saveRuleTask(t));
        }
      } else {
        return logger.debug("Did not create kcs task from case " + c['caseNumber']);
      }
    });
    logger.debug("KcsRules.match resolving " + promises.length + " promises");
    deferred.resolve(promises);
    return deferred.promise;
  };

  module.exports = KcsRules;

}).call(this);

//# sourceMappingURL=kcsRules.js.map
