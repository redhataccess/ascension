(function() {
  var EntityOpEnum, MongoOperations, Q, TaskOpEnum, TaskRules, TaskStateEnum, TaskTypeEnum, TaskUtils, assert, chai, errorHandler, expect, fs, logger, moment, mongoose, path, prettyjson, should, yaml, _;

  chai = require('chai');

  expect = chai.expect;

  should = chai.should();

  fs = require('fs');

  yaml = require('js-yaml');

  path = require('path');

  assert = require('assert');

  should = require('should');

  moment = require('moment');

  logger = require('tracer').colorConsole();

  mongoose = require('mongoose');

  prettyjson = require('prettyjson');

  _ = require('lodash');

  Q = require('q');

  MongoOperations = require('../../../../../src/com/redhat/ascension/db/MongoOperations');

  TaskUtils = require('../../../../../src/com/redhat/ascension/utils/taskUtils');

  TaskRules = require('../../../../../src/com/redhat/ascension/rules/taskRules');

  TaskOpEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum');

  EntityOpEnum = require('../../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum');

  TaskStateEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum');

  TaskTypeEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum');

  errorHandler = function(err) {
    throw err;
  };

  describe("Case rules", function() {
    before(function(done) {
      var db;
      MongoOperations.init({
        mongoDebug: true,
        testDb: true
      });
      db = mongoose['connection'];
      db.on('error', logger.error.bind(logger, 'connection error:'));
      return db.once('open', function() {
        MongoOperations.defineCollections();
        TaskRules.initFlow();
        return MongoOperations.reset().done(function() {
          return done();
        }, function(err) {
          return logger.error(err.stack);
        });
      });
    });
    return describe("Case w/o Task rules", function() {
      beforeEach(function(done) {
        return MongoOperations.reset().done(function() {
          TaskRules.initSession(true);
          return done();
        }, function(err) {
          return logger.error(err.stack);
        });
      });
      afterEach(function() {
        return TaskRules.session.dispose();
      });
      it("Unassigned case should result in new Task", function(done) {
        var Task, t, x;
        x = TaskUtils.generateMockTask({
          'case': {
            'status': 'Waiting on Red Hat',
            'internalStatus': 'Unassigned'
          },
          'task': {
            'type': TaskTypeEnum.CASE.name,
            'taskOp': TaskOpEnum.NOOP.name,
            'state': TaskStateEnum.UNASSIGNED.name
          }
        });
        Task = TaskRules.flow.getDefined("Task");
        t = new Task(x);
        TaskRules.session.assert(t);
        return TaskRules.session.match().then(function() {
          t.taskOp.should.equal(TaskOpEnum.OWN_TASK.name);
          t.entityOp.should.equal(EntityOpEnum.OWN.name);
          return done();
        }, function(err) {
          throw err;
          return logger.error(err.stack);
        });
      });
      it("Waiting on Collab Case w/o associated Task", function(done) {
        var Task, t, x;
        x = TaskUtils.generateMockTask({
          'case': {
            'status': 'Waiting on Red Hat',
            'internalStatus': 'Waiting on Collaboration'
          },
          'task': {
            'type': TaskTypeEnum.CASE.name,
            'taskOp': TaskOpEnum.NOOP.name,
            'state': TaskStateEnum.UNASSIGNED.name
          }
        });
        Task = TaskRules.flow.getDefined("Task");
        t = new Task(x);
        TaskRules.session.assert(t);
        return TaskRules.session.match().then(function() {
          t.taskOp.should.equal(TaskOpEnum.OWN_TASK.name);
          t.entityOp.should.equal(EntityOpEnum.COLLABORATE.name);
          return done();
        }, function(err) {
          return logger.error(err.stack);
        });
      });
      return it("Waiting on Collab Case w/associated Task", function(done) {
        var Task, fetchExisting, firstFire, t, t1, x, x1;
        Task = TaskRules.flow.getDefined("Task");
        x = TaskUtils.generateMockTask({
          'case': {
            'status': 'Waiting on Red Hat',
            'internalStatus': 'Waiting on Collaboration',
            'collaborationScore': 99
          },
          'task': {
            'type': TaskTypeEnum.CASE.name,
            'taskOp': TaskOpEnum.NOOP.name,
            'state': TaskStateEnum.UNASSIGNED.name
          }
        });
        t = new Task(x);
        firstFire = Q.defer();
        TaskRules.session.assert(t);
        TaskRules.session.match().then(function() {
          t.taskOp.should.equal(TaskOpEnum.OWN_TASK.name);
          t.entityOp.should.equal(EntityOpEnum.COLLABORATE.name);
          t.score.should.equal(99);
          TaskRules.session.dispose();
          return firstFire.resolve();
        }, errorHandler);
        fetchExisting = Q.defer();
        firstFire.promise.done(function() {
          var existingTasksPromise;
          existingTasksPromise = TaskRules.getExistingTasks();
          return existingTasksPromise.done(function(existingTasks) {
            existingTasks.length.should.equal(1);
            existingTasks[0]['entityOp'].should.equal(EntityOpEnum.COLLABORATE.name);
            return fetchExisting.resolve(existingTasks);
          }, errorHandler);
        }, errorHandler);
        x1 = TaskUtils.generateMockTask({
          'case': {
            'status': 'Waiting on Red Hat',
            'internalStatus': 'Waiting on Collaboration',
            'collaborationScore': 100
          },
          'task': {
            'type': TaskTypeEnum.CASE.name,
            'taskOp': TaskOpEnum.NOOP.name,
            'state': TaskStateEnum.UNASSIGNED.name
          }
        });
        t1 = new Task(x1);
        return fetchExisting.promise.done(function(existingTasks) {
          TaskRules.session.dispose();
          TaskRules.initSession(true);
          _.each(existingTasks, function(e) {
            var et;
            et = new Task(e);
            return TaskRules.session.assert(et);
          });
          TaskRules.session.assert(t1);
          return TaskRules.session.match().then(function() {
            var existingTasksPromise;
            logger.info("Done, assert calls: " + TaskRules.assertCalls + ", fire calls: " + TaskRules.fireCalls);
            t1.taskOp.should.equal(TaskOpEnum.NOOP.name);
            t1.entityOp.should.equal(TaskOpEnum.NOOP.name);
            existingTasksPromise = TaskRules.getExistingTasks();
            return existingTasksPromise.done(function(existingTasks) {
              existingTasks.length.should.equal(1);
              existingTasks[0]['entityOp'].should.equal(EntityOpEnum.COLLABORATE.name);
              return done();
            }, errorHandler);
          }, errorHandler);
        }, errorHandler);
      });
    });
  });

}).call(this);

//# sourceMappingURL=caseRulesTest.js.map
