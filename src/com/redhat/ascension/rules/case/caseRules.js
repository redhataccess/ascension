(function() {
  var CaseRules, EntityOpEnum, KcsRules, MongoOperations, MongoOps, ObjectId, Q, S, ScoringLogic, TaskCounts, TaskLogic, TaskOpEnum, TaskStateEnum, TaskTypeEnum, TaskUtils, UserLogic, db, dbPromise, logger, moment, mongoose, mongooseQ, nools, prettyjson, request, salesforce, settings, _;

  nools = require('nools');

  logger = require('tracer').colorConsole();

  prettyjson = require('prettyjson');

  salesforce = require('../../db/salesforce');

  settings = require('../../settings/settings');

  Q = require('q');

  MongoOperations = require('../../db/MongoOperations');

  TaskUtils = require('../../utils/taskUtils');

  TaskStateEnum = require('../enums/TaskStateEnum');

  TaskTypeEnum = require('../enums/TaskTypeEnum');

  TaskOpEnum = require('../enums/TaskOpEnum');

  EntityOpEnum = require('../enums/ResourceOpEnum');

  _ = require('lodash');

  moment = require('moment');

  MongoOps = require('../../db/MongoOperations');

  mongoose = require('mongoose');

  mongooseQ = require('mongoose-q')(mongoose);

  ObjectId = mongoose.Types.ObjectId;

  request = require('request');

  S = require('string');

  KcsRules = require('./kcsRules');

  UserLogic = require('../../rest/userLogic');

  TaskCounts = require('../../db/taskCounts');

  ScoringLogic = require('../../rules/scoring/scoringLogic');

  TaskLogic = require('../../rest/taskLogic');

  CaseRules = {};

  CaseRules.caseFields = "AccountId,\nAccount_Number__c,\nCaseNumber,\nCollaboration_Score__c,\nComment_Count__c,\nCreatedDate,\nCreated_By__c,\nFTS_Role__c,\nFTS__c,\nLast_Breach__c,\nPrivateCommentCount__c,\nPublicCommentCount__c,\nSBT__c,\nSBR_Group__c,\nSeverity__c,\nStatus,\nSubject,\nInternal_Status__c,\nStrategic__c,\nTags__c,\n(SELECT\n  Id,\n  Linking_Mechanism__c,\n  Type__c,\n  Resource_Type__c\nFROM\n  Case_Resource_Relationships__r)";

  CaseRules.fetchCaseSoql = "SELECT\n  #caseFields#\nFROM\n  Case\nWHERE\n  CaseNumber = #caseNumber#";

  CaseRules.fetchCasesSoql = "SELECT\n  #caseFields#\nFROM\n  Case\nWHERE\n  OwnerId != '00GA0000000XxxNMAS'\n  #andStatusCondition#\n  AND Internal_Status__c != 'Waiting on Engineering'\n  AND Internal_Status__c != 'Waiting on PM'\nLIMIT 1000";

  CaseRules.fetchCase = function(opts) {
    var soql;
    soql = this.fetchCaseSoql.replace(/#caseFields#/, this.caseFields);
    soql = soql.replace(/#caseNumber#/, "'" + opts.caseNumber + "'");
    return Q.nfcall(salesforce.querySf, {
      'soql': soql,
      single: true
    });
  };

  CaseRules.fetchCases = function() {
    var soql;
    soql = this.fetchCasesSoql.replace(/#caseFields#/, this.caseFields);
    soql = soql.replace(/#andStatusCondition#/, " AND Status = 'Waiting on Red Hat'");
    return Q.nfcall(salesforce.querySf, {
      'soql': soql
    });
  };

  CaseRules.intStatus = function(c, intStatus) {
    return c['internalStatus'] === intStatus;
  };

  CaseRules.taskExistsWithEntityOp = function(tasks, intStatus) {
    return _.find(tasks, function(t) {
      return t['resourceOp'] === intStatus;
    }) !== false;
  };

  CaseRules.findTask = function(c, tasks, resourceOp) {
    return _.find(tasks, function(t) {
      return t['resourceOp'] === resourceOp;
    });
  };

  CaseRules.updateTaskFromCase = function(c, t) {
    var updateHash;
    logger.warn("Existing " + c['internalStatus'] + " Task: " + c['caseNumber'] + ", updating metadata");
    updateHash = TaskUtils.taskFromCaseUpdateHash(t, c);
    _.assign(t, updateHash);
    return TaskUtils.updateTaskFromCase(t, c);
  };

  CaseRules.normalizeCase = function(c) {
    var _ref;
    return {
      status: c['status'] || c['Status'],
      internalStatus: c['internalStatus'] || c['Internal_Status__c'],
      severity: c['severity'] || c['Severity__c'],
      sbrs: c['sbrs'] || TaskUtils.parseSfArray(c['SBR_Group__c']),
      tags: c['tags'] || TaskUtils.parseSfArray(c['Tags__c']),
      sbt: c['sbt'] || c['SBT__c'] || null,
      created: c['created'] || c['CreatedDate'],
      collaborationScore: c['collaborationScore'] || c['Collaboration_Score__c'],
      caseNumber: c['caseNumber'] || c['CaseNumber'],
      subject: c['subject'] || c['Subject'],
      linkedSolutionCount: _.filter(((_ref = c['Case_Resource_Relationships__r']) != null ? _ref['records'] : void 0) || [], function(r) {
        return r['Resource_Type__c'] === 'Solution' && _.contains(['Link', 'Link;Pin'], r['Type__c']);
      })
    };
  };

  CaseRules.match = function(opts) {
    var cases, deferred, existingTasks, existingTasksByBid, promises, self;
    self = CaseRules;
    deferred = Q.defer();
    cases = opts['cases'] || [];
    existingTasks = opts['existingTasks'] || [];
    promises = [];
    existingTasksByBid = _.groupBy(existingTasks, function(t) {
      return t['bid'];
    });
    logger.debug("Matching " + cases.length + " cases");
    _.each(cases, function(c) {
      var existingTask, resourceOp, t;
      logger.debug("Attempting to match case: " + (c['caseNumber'] || c['CaseNumber']) + ", intStatus: " + c['internalStatus']);
      if (self.intStatus(c, 'Unassigned')) {
        resourceOp = EntityOpEnum.OWN;
        existingTask = self.findTask(c, existingTasksByBid[c['caseNumber']], resourceOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          t = TaskUtils.makeTaskFromCase(c);
          logger.debug("Discovered new Unassigned case: " + t['bid'] + " setting the task to " + resourceOp.display + ".");
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.resourceOp = resourceOp.name;
          return promises.push(TaskUtils.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Owner')) {
        resourceOp = EntityOpEnum.UPDATE;
        existingTask = self.findTask(c, existingTasksByBid[c['caseNumber']], resourceOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          t = TaskUtils.makeTaskFromCase(c);
          logger.debug("Discovered new Waiting on Owner case: " + t['bid'] + " setting the task to " + resourceOp.display + ".");
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.resourceOp = resourceOp.name;
          return promises.push(TaskUtils.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Contributor')) {
        resourceOp = EntityOpEnum.CONTRIBUTE;
        existingTask = self.findTask(c, existingTasksByBid[c['caseNumber']], resourceOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          t = TaskUtils.makeTaskFromCase(c);
          logger.debug("Discovered new Waiting on Contributor case: " + t['bid'] + " setting the task to " + resourceOp.display + ".");
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.resourceOp = resourceOp.name;
          return promises.push(TaskUtils.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Collaboration')) {
        resourceOp = EntityOpEnum.COLLABORATE;
        existingTask = self.findTask(c, existingTasksByBid[c['caseNumber']], resourceOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          t = TaskUtils.makeTaskFromCase(c);
          logger.debug("Discovered new Waiting on Collaboration case: " + t['bid'] + " setting the task to " + resourceOp.display + ".");
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.resourceOp = resourceOp.name;
          return promises.push(TaskUtils.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Engineering')) {
        resourceOp = EntityOpEnum.FOLLOW_UP_WITH_ENGINEERING;
        existingTask = self.findTask(c, existingTasksByBid[c['caseNumber']], resourceOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          logger.debug("Discovered new Waiting on Engineering case: " + t['bid'] + " setting the task to " + resourceOp.display + ".");
          t = TaskUtils.makeTaskFromCase(c);
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.resourceOp = resourceOp.name;
          return promises.push(TaskUtils.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Sales')) {
        resourceOp = EntityOpEnum.FOLLOW_UP_WITH_SALES;
        existingTask = self.findTask(c, existingTasksByBid[c['caseNumber']], resourceOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          t = TaskUtils.makeTaskFromCase(c);
          logger.debug("Discovered new Waiting on Engineering case: " + t['bid'] + " setting the task to " + resourceOp.display + ".");
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.resourceOp = resourceOp.name;
          return promises.push(TaskUtils.saveRuleTask(t));
        }
      } else {
        return logger.warn("Did not create task from case: " + (prettyjson.render(c)));
      }
    });
    logger.debug("CaseRules.match resolving " + promises.length + " promises");
    deferred.resolve(promises);
    return deferred.promise;
  };

  CaseRules.reset = function() {
    var deferred;
    deferred = Q.defer();
    MongoOperations.reset().then(function() {
      return CaseRules.fetchCases();
    }).then(function(cases) {
      var normalizedCases;
      normalizedCases = _.map(cases, function(c) {
        return CaseRules.normalizeCase(c);
      });
      return [
        CaseRules.match({
          cases: normalizedCases
        }), KcsRules.match({
          cases: normalizedCases
        })
      ];
    }).spread(function(casePromises, kcsPromises) {
      logger.debug("Received " + casePromises.length + " caseResults and " + kcsPromises + " kcs results");
      return Q.allSettled(_.flatten([casePromises, kcsPromises]));
    }).then(function(results) {
      logger.debug("Completed manipulating " + results.length + " tasks");
      return TaskLogic.fetchTasks({});
    }).then(function(tasks) {
      var sbrs, uql, uqlParts;
      sbrs = _.chain(tasks).pluck('sbrs').flatten().unique().value();
      uqlParts = [];
      _.each(sbrs, function(sbr) {
        return uqlParts.push("(sbrName is \"" + sbr + "\")");
      });
      uql = uqlParts.join(' OR ');
      logger.debug("Generated uql: " + uql);
      return [
        tasks, UserLogic.fetchUsersUql({
          where: uql
        })
      ];
    }).spread(function(tasks, users) {
      var userIds;
      userIds = _.chain(users).pluck('id').unique().value();
      logger.debug("Discovered " + userIds + " userIds");
      return [tasks, users, TaskCounts.getTaskCounts(userIds)];
    }).spread(function(tasks, users, userTaskCounts) {
      var updatePromises;
      logger.debug("Determining potential owners");
      updatePromises = [];
      _.each(tasks, function(t) {
        var $update, potentialOwners;
        ScoringLogic.determinePotentialOwners({
          task: t,
          users: users,
          userTaskCounts: userTaskCounts
        });
        potentialOwners = t.potentialOwners;
        $update = {
          $set: {
            potentialOwners: potentialOwners
          }
        };
        return updatePromises.push(MongoOps['models']['task'].findOneAndUpdate({
          _id: new ObjectId(t._id)
        }, $update).execQ());
      });
      logger.debug("Generated " + updatePromises.length + " update promises");
      return Q.allSettled(updatePromises);
    }).then(function(results) {
      return logger.debug("Completed setting potential owners on " + results.length + " tasks");
    })["catch"](function(err) {
      logger.error(err.stack);
      return deferred.reject(err);
    }).done(function() {
      return deferred.resolve();
    });
    return deferred.promise;
  };

  module.exports = CaseRules;

  if (require.main === module) {
    MongoOperations.init({
      mongoDebug: true
    });
    db = mongoose['connection'];
    db.on('error', logger.error.bind(logger, 'connection error:'));
    dbPromise = Q.defer();
    db.once('open', function() {
      return dbPromise.resolve();
    });
    dbPromise.promise.then(function() {
      MongoOperations.defineCollections();
      return MongoOperations.reset();
    }).then(function() {
      return CaseRules.fetchCases();
    }).then(function(cases) {
      var normalizedCases;
      normalizedCases = _.map(cases, function(c) {
        return CaseRules.normalizeCase(c);
      });
      return [
        CaseRules.match({
          cases: normalizedCases
        }), KcsRules.match({
          cases: normalizedCases
        })
      ];
    }).spread(function(casePromises, kcsPromises) {
      logger.debug("Received " + casePromises.length + " caseResults and " + kcsPromises + " kcs results");
      return Q.allSettled(_.flatten([casePromises, kcsPromises]));
    }).then(function(results) {
      logger.debug("Completed manipulating " + results.length + " tasks");
      return TaskLogic.fetchTasks({});
    }).then(function(tasks) {
      var sbrs, uql, uqlParts;
      sbrs = _.chain(tasks).pluck('sbrs').flatten().unique().value();
      uqlParts = [];
      _.each(sbrs, function(sbr) {
        return uqlParts.push("(sbrName is \"" + sbr + "\")");
      });
      uql = uqlParts.join(' OR ');
      logger.debug("Generated uql: " + uql);
      return [
        tasks, UserLogic.fetchUsersUql({
          where: uql
        })
      ];
    }).spread(function(tasks, users) {
      var userIds;
      userIds = _.chain(users).pluck('id').unique().value();
      logger.debug("Discovered " + userIds + " userIds");
      return [tasks, users, TaskCounts.getTaskCounts(userIds)];
    }).spread(function(tasks, users, userTaskCounts) {
      var updatePromises;
      logger.debug("Determining potential owners");
      updatePromises = [];
      _.each(tasks, function(t) {
        var $update, potentialOwners;
        ScoringLogic.determinePotentialOwners({
          task: t,
          users: users,
          userTaskCounts: userTaskCounts
        });
        potentialOwners = t.potentialOwners;
        $update = {
          $set: {
            potentialOwners: potentialOwners
          }
        };
        return updatePromises.push(MongoOps['models']['task'].findOneAndUpdate({
          _id: new ObjectId(t._id)
        }, $update).execQ());
      });
      logger.debug("Generated " + updatePromises.length + " update promises");
      return Q.allSettled(updatePromises);
    }).then(function(results) {
      return logger.debug("Completed setting potential owners on " + results.length + " tasks");
    })["catch"](function(err) {
      return logger.error(err.stack);
    }).done(function() {
      return process.exit();
    });
  }

}).call(this);

//# sourceMappingURL=caseRules.js.map
