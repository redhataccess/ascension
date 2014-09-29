(function() {
  var CaseRules, EntityOpEnum, MongoOperations, Q, TaskOpEnum, TaskRules, TaskStateEnum, TaskTypeEnum, db, dbPromise, logger, moment, mongoose, mongooseQ, nools, prettyjson, salesforce, _;

  nools = require('nools');

  logger = require('tracer').colorConsole();

  prettyjson = require('prettyjson');

  salesforce = require('../../db/salesforce');

  Q = require('q');

  MongoOperations = require('../../db/MongoOperations');

  TaskRules = require('../taskRules');

  TaskStateEnum = require('../enums/TaskStateEnum');

  TaskTypeEnum = require('../enums/TaskTypeEnum');

  TaskOpEnum = require('../enums/TaskOpEnum');

  EntityOpEnum = require('../enums/EntityOpEnum');

  _ = require('lodash');

  moment = require('moment');

  mongoose = require('mongoose');

  mongooseQ = require('mongoose-q')(mongoose);

  CaseRules = {};

  CaseRules.soql = "SELECT\n  AccountId,\n  Account_Number__c,\n  CaseNumber,\n  Collaboration_Score__c,\n  Comment_Count__c,\n  CreatedDate,\n  Created_By__c,\n  FTS_Role__c,\n  FTS__c,\n  Last_Breach__c,\n  PrivateCommentCount__c,\n  PublicCommentCount__c,\n  SBT__c,\n  SBR_Group__c,\n  Severity__c,\n  Status,\n  Internal_Status__c,\n  Strategic__c,\n  Tags__c\nFROM\n  Case\nWHERE\n  OwnerId != '00GA0000000XxxNMAS'\n  #andStatusCondition#\n  AND Internal_Status__c != 'Waiting on Engineering'\n  AND Internal_Status__c != 'Waiting on PM'\n  LIMIT 100";

  CaseRules.fetchCases = function() {
    var soql;
    soql = this.soql.replace(/#andStatusCondition#/, " AND Status = 'Waiting on Red Hat'");
    return Q.nfcall(salesforce.querySf, {
      'soql': soql
    });
  };

  CaseRules.intStatus = function(c, intStatus) {
    return c['Internal_Status__c'] === intStatus;
  };

  CaseRules.taskExistsWithEntityOp = function(tasks, intStatus) {
    return _.find(tasks, function(t) {
      return t['entityOp'] === intStatus;
    }) !== false;
  };

  CaseRules.findTask = function(c, tasks, entityOp) {
    return _.find(tasks, function(t) {
      return t['entityOp'] === entityOp;
    });
  };

  CaseRules.updateTaskFromCase = function(c, t) {
    var updateHash;
    logger.warn("Existing " + c['Internal_Status__c'] + " Task: " + c['CaseNumber'] + ", updating metadata");
    updateHash = TaskRules.taskFromCaseUpdateHash(existingTask, c);
    _.assign(t, updateHash);
    return TaskRules.updateTaskFromCase(t, c);
  };

  CaseRules.match = function(opts) {
    var cases, casesByCaseNumber, deferred, existingTasks, existingTasksByBid, promises, self;
    self = CaseRules;
    deferred = Q.defer();
    cases = opts['cases'] || [];
    existingTasks = opts['existingTasks'] || [];
    promises = [];
    casesByCaseNumber = _.object(_.map(cases, function(c) {
      return [c['CaseNumber'], c];
    }));
    existingTasksByBid = _.groupBy(existingTasks, function(t) {
      return t['bid'];
    });
    logger.debug("Matching " + cases.length + " cases");
    _.each(cases, function(c) {
      var entityOp, existingTask, t;
      logger.debug("Attempting to match case: " + c['CaseNumber'] + ", intStatus: " + c['Internal_Status__c']);
      if (self.intStatus(c, 'Unassigned')) {
        entityOp = EntityOpEnum.OWN;
        existingTask = self.findTask(c, existingTasksByBid[c['CaseNumber']], entityOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          logger.warn("Discovered new Unassigned case: " + c['CaseNumber'] + " setting the task to " + entityOp.display + ".");
          t = TaskRules.makeTaskFromCase(c);
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.entityOp = entityOp.name;
          return promises.push(TaskRules.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Owner')) {
        entityOp = EntityOpEnum.UPDATE;
        existingTask = self.findTask(c, existingTasksByBid[c['CaseNumber']], entityOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          logger.warn("Discovered new Waiting on Owner case: " + c['CaseNumber'] + " setting the task to " + entityOp.display + ".");
          t = TaskRules.makeTaskFromCase(c);
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.entityOp = entityOp.name;
          return promises.push(TaskRules.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Contributor')) {
        entityOp = EntityOpEnum.CONTRIBUTE;
        existingTask = self.findTask(c, existingTasksByBid[c['CaseNumber']], entityOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          logger.warn("Discovered new Waiting on Contributor case: " + c['CaseNumber'] + " setting the task to " + entityOp.display + ".");
          t = TaskRules.makeTaskFromCase(c);
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.entityOp = entityOp.name;
          return promises.push(TaskRules.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Collaboration')) {
        entityOp = EntityOpEnum.COLLABORATE;
        existingTask = self.findTask(c, existingTasksByBid[c['CaseNumber']], entityOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          logger.warn("Discovered new Waiting on Collaboration case: " + c['CaseNumber'] + " setting the task to " + entityOp.display + ".");
          t = TaskRules.makeTaskFromCase(c);
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.entityOp = entityOp.name;
          return promises.push(TaskRules.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Engineering')) {
        entityOp = EntityOpEnum.FOLLOW_UP_WITH_ENGINEERING;
        existingTask = self.findTask(c, existingTasksByBid[c['CaseNumber']], entityOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          logger.warn("Discovered new Waiting on Engineering case: " + c['CaseNumber'] + " setting the task to " + entityOp.display + ".");
          t = TaskRules.makeTaskFromCase(c);
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.entityOp = entityOp.name;
          return promises.push(TaskRules.saveRuleTask(t));
        }
      } else if (self.intStatus(c, 'Waiting on Sales')) {
        entityOp = EntityOpEnum.FOLLOW_UP_WITH_SALES;
        existingTask = self.findTask(c, existingTasksByBid[c['CaseNumber']], entityOp.name);
        if (existingTask != null) {
          return promises.push(self.updateTaskFromCase(c, existingTask));
        } else {
          logger.warn("Discovered new Waiting on Engineering case: " + c['CaseNumber'] + " setting the task to " + entityOp.display + ".");
          t = TaskRules.makeTaskFromCase(c);
          t.taskOp = TaskOpEnum.OWN_TASK.name;
          t.entityOp = entityOp.name;
          return promises.push(TaskRules.saveRuleTask(t));
        }
      } else {
        return logger.debug("Did not create task from case: " + (prettyjson.render(c)));
      }
    });
    deferred.resolve(promises);
    return deferred.promise;
  };

  CaseRules.reset = function() {
    var deferred;
    deferred = Q.defer();
    MongoOperations.reset().then(function() {
      return CaseRules.fetchCases();
    }).then(function(cases) {
      return CaseRules.match({
        cases: cases
      });
    }).then(function(promises) {
      return Q.allSettled(promises);
    }).then(function(results) {
      return logger.debug("Completed manipulating " + results.length + " tasks");
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
    MongoOperations.init();
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
      return CaseRules.match({
        cases: cases
      });
    }).then(function(promises) {
      return Q.allSettled(promises);
    }).then(function(results) {
      return logger.debug("Completed manipulating " + results.length + " tasks");
    })["catch"](function(err) {
      return logger.error(err.stack);
    }).done(function() {
      return process.exit();
    });
  }

}).call(this);

//# sourceMappingURL=caseRules.js.map
