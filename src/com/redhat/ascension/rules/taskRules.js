(function() {
  var EntityOpEnum, MongoOperations, Q, TaskOpEnum, TaskRules, TaskStateEnum, TaskTypeEnum, db, logger, moment, mongoose, mongooseQ, nools, prettyjson, salesforce, _;

  nools = require('nools');

  logger = require('tracer').colorConsole();

  prettyjson = require('prettyjson');

  salesforce = require('../db/salesforce');

  Q = require('q');

  MongoOperations = require('../db/MongoOperations');

  TaskStateEnum = require('./enums/TaskStateEnum');

  TaskTypeEnum = require('./enums/TaskTypeEnum');

  TaskOpEnum = require('./enums/TaskOpEnum');

  EntityOpEnum = require('./enums/EntityOpEnum');

  _ = require('lodash');

  moment = require('moment');

  mongoose = require('mongoose');

  mongooseQ = require('mongoose-q')(mongoose);

  TaskRules = {};

  TaskRules.soql = "SELECT\n  AccountId,\n  Account_Number__c,\n  CaseNumber,\n  Collaboration_Score__c,\n  Comment_Count__c,\n  CreatedDate,\n  Created_By__c,\n  FTS_Role__c,\n  FTS__c,\n  Last_Breach__c,\n  PrivateCommentCount__c,\n  PublicCommentCount__c,\n  SBT__c,\n  SBR_Group__c,\n  Severity__c,\n  Status,\n  Internal_Status__c,\n  Strategic__c,\n  Tags__c\nFROM\n  Case\nWHERE\n  OwnerId != '00GA0000000XxxNMAS'\n  #andStatusCondition#\n  LIMIT 100";

  TaskRules.noolsDefs = "// The ExistingTask represents a minimal fetch of all existing tasks, this allows rules such as 'If no prior NNO task,\n// create one'\n//define ExistingTask {\n//  bid: null,\n//  taskOp: null,\n//  entityOp: null,\n//  owner: null\n//}\n\ndefine Task {\n  _id: null,\n  bid: null,\n  type: null,\n  score: 0,\n  locked: false,\n  timeout: -1,\n  sbrs: [],\n  tags: [],\n  owner: null,\n  closed: null,\n  type: null,\n  taskOp: null,\n  entityOp: null,\n  state: 'new',\n  'case': {\n    AccountId : null,\n    Account_Number__c : null,\n    CaseNumber : null,\n    Collaboration_Score__c : null,\n    Comment_Count__c : null,\n    CreatedDate : null,\n    Created_By__c : null,\n    FTS_Role__c : null,\n    FTS__c : null,\n    Last_Breach__c : null,\n    PrivateCommentCount__c : null,\n    PublicCommentCount__c : null,\n    SBT__c : null,\n    Severity__c : null,\n    Status : null,\n    Internal_status__c : null,\n    Strategic__c : null,\n    SBR_Group__c : null,\n    Tags__c : null\n  },\n  owner: {\n    \"fullName\" : null,\n    \"email\" : null,\n    \"sso\" : null,\n    \"gss\" : null,\n    \"superRegion\" : null,\n    \"timezone\" : null,\n    \"firstName\" : null,\n    \"lastName\" : null,\n    \"aliasName\" : null,\n    \"kerberos\" : null,\n    \"salesforce\" : null,\n    \"isManager\" : null,\n    \"active\" : null,\n    \"created\" : null,\n    \"lastLogin\" : null,\n    \"lastModified\" : null,\n    \"outOfOffice\" : null,\n    \"id\" : null\n  }\n}";

  TaskRules.nools = "\n// This is the most basic of all rules, it says if there is no real task associated with an Unassigned case, create\n// One and set the appropriate states -- In this one situation there is no question there is a single resulting task\n// Thus we can retract that task once created.\nrule \"noop task/unassigned case\" {\n  when {\n    t : Task t.taskOp == TaskOpEnum.NOOP.name && t.case.Internal_Status__c == 'Unassigned';\n    // Make sure there is no prior existing task created already\n    not(et: Task et.taskOp != TaskOpEnum.NOOP.name && et.bid == t.bid && et.case.Internal_Status__c == 'Unassigned');\n  }\n  then {\n    logger.warn('Found unmanaged task: ' + t.bid + ', setting the task to NNO.');\n    modify(t, function() {\n      this.taskOp = TaskOpEnum.OWN_TASK.name;\n      this.entityOp = EntityOpEnum.OWN.name;\n    });\n    //logger.warn('Sending task to be saved: ' + t.bid);\n    retract(t);\n    return saveRuleTask(t);\n  }\n}\n\n// New Waiting on Collab case without any prior associated Task\nrule \"noop task/collab case\" {\n  when {\n    t : Task t.taskOp == TaskOpEnum.NOOP.name && t.case.Internal_Status__c == 'Waiting on Collaboration';\n    // Make sure there is no prior task created for this Waiting on Collaboration task\n    not(et: Task et.taskOp != TaskOpEnum.NOOP.name && et.bid == t.bid && et.entityOp == EntityOpEnum.COLLAB.name);\n  }\n  then {\n    modify(t, function(){\n      this.taskOp = TaskOpEnum.OWN_TASK.name;\n      this.entityOp = EntityOpEnum.COLLAB.name;\n    });\n    retract(t);\n    return saveRuleTask(t);\n  }\n}\n// New Waiting on Collab case with an associated Task\nrule \"noop task/collab case w/exiting task\" {\n  when {\n    t : Task t.taskOp == TaskOpEnum.NOOP.name && t.case.Internal_Status__c == 'Waiting on Collaboration';\n    // If there is an existing task that matches this noop task, retract both\n    et: Task et.taskOp != TaskOpEnum.NOOP.name && et.bid == t.bid && et.entityOp == EntityOpEnum.COLLAB.name;\n  }\n  then {\n    retract(t);\n    retract(et);\n  }\n}\nrule \"noop task/default\" {\n  when {\n    t : Task t.taskOp == TaskOpEnum.NOOP.name;\n    // Make sure there is no prior existing task created already\n    not(et: Task et.taskOp != TaskOpEnum.NOOP.name && et.bid == t.bid);\n  }\n  then {\n    //logger.warn('DEFAULT: Found unmanaged task: ' + t.bid + ', setting the task to NNO.');\n    //modify(t, function(){\n    //  this.taskOp = TaskOpEnum.OWN_TASK.name;\n    //  this.entityOp = EntityOpEnum.OWN.name;\n    //});\n    retract(t);\n    return saveRuleTask(t);\n  }\n}\n";

  TaskRules.generateSaveTasksPromises = function(tasks) {
    var promises;
    promises = [];
    _.each(tasks, function(t) {
      return promises.push(new MongoOperations['models']['task'](t).saveQ());
    });
    return promises;
  };

  TaskRules.getExistingTasks = function() {
    return MongoOperations['models']['task'].find().where('state').ne(TaskStateEnum.CLOSED).execQ();
  };

  TaskRules.getTasks = function(tasks) {
    return _.map(tasks, function(t) {
      return new MongoOperations['models']['task'](t);
    });
  };

  TaskRules.saveTasks = function(tasks) {
    var deferred;
    deferred = Q.defer();
    Q.all(this.generateSaveTasksPromises(tasks)).then(function() {
      return deferred.resolve();
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  };

  TaskRules.updateTasksWithCaseMetadata = function(t) {
    return MongoOperations['models']['task'].where().setOptions({
      multi: true
    }).update({
      'bid': c['CaseNumber']
    }, this.taskFromCaseUpdateHash(t, t['case'])).exec();
  };

  TaskRules.divineTasks = function(cases) {
    var caseNumbers, deferred, outputHash;
    deferred = Q.defer();
    _.each(cases, function(c) {
      delete c['attributes'];
      c['SBR_Group__c'] = TaskRules.parseSfArray(c['SBR_Group__c']);
      return c['Tags__c'] = TaskRules.parseSfArray(c['Tags__c']);
    });
    outputHash = _.object(_.map(cases, function(x) {
      return [
        x['CaseNumber'], {
          'case': x,
          'task': void 0
        }
      ];
    }));
    caseNumbers = _.chain(cases).pluck('CaseNumber').value();
    MongoOperations['models']['task'].find().where('bid')["in"](caseNumbers).execQ().done(function(tasks) {
      var existingCaseNumbers, existingTasks, newCases, newTasks, noopTasks, taskPromises;
      existingCaseNumbers = _.chain(tasks).pluck('bid').unique().value();
      newCases = _.chain(cases).reject(function(c) {
        return _.contains(existingCaseNumbers, c['CaseNumber']);
      }).value();
      newTasks = _.map(newCases, function(c) {
        return TaskRules.makeTaskFromCase(c);
      });
      logger.debug("Discovered " + newTasks.length + " new tasks");
      existingTasks = _.chain(tasks).filter(function(t) {
        return _.contains(existingCaseNumbers, t['bid']);
      }).value();
      logger.debug("Discovered " + existingTasks.length + " existing tasks");
      taskPromises = [];
      _.each(existingTasks, function(t) {
        var c, updateHash;
        c = outputHash[t['bid']]['case'];
        updateHash = TaskRules.taskFromCaseUpdateHash(t, c);
        _.assign(t, updateHash);
        return taskPromises.push(TaskRules.updateTaskFromCase(t, c));
      });
      noopTasks = TaskRules.getTasks(newTasks);
      taskPromises = _.chain(taskPromises).value();
      return Q.allSettled(taskPromises).then(function() {
        var d;
        d = Q.defer();
        logger.debug("Completed all task promises, re-fetching the tasks from mongo");
        MongoOperations['models']['task'].where('bid')["in"](existingCaseNumbers).exec(function(err, results) {
          logger.debug("re-fetched " + results.length + " results");
          if (err != null) {
            return d.reject(err);
          } else {
            return d.resolve(results);
          }
        });
        return d.promise;
      }).then(function(results) {
        var output;
        output = _.chain([results, noopTasks]).flatten().value();
        logger.debug("Resolving the main deferred with a total of " + results.length + " existing tasks, and " + noopTasks.length + " noop tasks");
        return deferred.resolve(output);
      }).fail(function(err) {
        return logger.error(err.stack);
      }).done();
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  };

  TaskRules.initFlow = function() {
    this.beginFire = 0;
    this.endFire = 0;
    this.flow = nools.compile(this.noolsDefs + this.nools, {
      name: 'helloFlow',
      scope: {
        logger: logger,
        TaskOpEnum: TaskOpEnum,
        EntityOpEnum: EntityOpEnum,
        saveRuleTask: TaskRules.saveRuleTask,
        saveRuleTaskCb: TaskRules.saveRuleTaskCb,
        prettyjson: prettyjson
      }
    });
    this.assertCalls = 0;
    return this.fireCalls = 0;
  };

  TaskRules.printSimple = function(op, fact) {
    return logger.debug(("" + op + ": ") + prettyjson.render({
      bid: fact['bid'],
      taskOp: fact['taskOp'],
      entityOp: fact['entityOp']
    }));
  };

  TaskRules.initSession = function(debug) {
    if (debug == null) {
      debug = false;
    }
    this.session = this.flow.getSession();
    this.session.on("assert", function(fact) {
      TaskRules.assertCalls += 1;
      if (debug === true) {
        return TaskRules.printSimple('assert', fact);
      }
    });
    this.session.on("retract", function(fact) {
      if (debug === true) {
        return TaskRules.printSimple('retract', fact);
      }
    });
    this.session.on("modify", function(fact) {
      if (debug === true) {
        return TaskRules.printSimple('modify', fact);
      }
    });
    return this.session.on("fire", function(name, rule) {
      if (debug === true) {
        logger.debug("fired: " + name);
      }
      return TaskRules.fireCalls += 1;
    });
  };

  TaskRules.executeTest = function() {
    var Task, soql;
    Task = this.flow.getDefined("Task");
    soql = this.soql.replace(/#andStatusCondition#/, " AND Status = 'Waiting on Red Hat'");
    return Q.nfcall(salesforce.querySf, {
      'soql': soql
    }).then(function(cases) {
      return TaskRules.divineTasks(cases);
    }).then(function(tasks) {
      logger.debug("Completed persisting the tasks");
      return _.each(tasks, function(x) {
        var beginFire, t;
        t = new Task(x);
        TaskRules.session.assert(t);
        beginFire = +moment();
        return TaskRules.session.match().then(function() {
          var dur, endFire;
          logger.info("Done, assert calls: " + TaskRules.assertCalls + ", fire calls: " + TaskRules.fireCalls);
          endFire = +moment();
          dur = ((endFire - beginFire) / 1000).toFixed(0);
          logger.info("Completed firing rules in " + dur + "s");
          TaskRules.session.dispose();
          return process.exit(0);
        }, function(err) {
          return logger.error(err.stack);
        });
      });
    }).done();
  };

  module.exports = TaskRules;

  if (require.main === module) {
    MongoOperations.init({
      mongoDebug: true
    });
    db = mongoose['connection'];
    db.on('error', logger.error.bind(logger, 'connection error:'));
    db.once('open', function() {
      MongoOperations.defineCollections();
      TaskRules.initFlow();
      TaskRules.initSession(false);
      return MongoOperations.reset().done(function() {
        return TaskRules.executeTest();
      }, function(err) {
        return logger.error(err.stack);
      });
    });
  }

}).call(this);

//# sourceMappingURL=taskRules.js.map
