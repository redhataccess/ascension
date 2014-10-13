(function() {
  var EntityOpEnum, MongoOperations, Q, TaskActionsEnum, TaskLogic, TaskOpEnum, TaskRules, TaskStateEnum, TaskTypeEnum, TaskUtils, assert, chai, errorHandler, expect, fs, logger, moment, mongoose, path, prettyjson, should, yaml, _;

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

  TaskActionsEnum = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');

  TaskLogic = require('../../../../../src/com/redhat/ascension/rest/taskLogic.coffee');

  errorHandler = function(err) {
    throw err;
  };

  describe("Task Logic", function() {
    before(function(done) {
      var db;
      MongoOperations.init(true);
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
    return describe("POST Ops", function() {
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
      return it("Successfully assign an owner to a Task", function(done) {
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
        return Q(TaskRules.session.match()).then(function() {
          t.taskOp.should.equal(TaskOpEnum.OWN_TASK.name);
          t.entityOp.should.equal(EntityOpEnum.OWN.name);
          return TaskLogic.fetchTasks({});
        }).then(function(tasks) {
          t = tasks[0];
          return TaskLogic.updateTask({
            _id: t['_id'],
            action: TaskActionsEnum.ASSIGN,
            userInput: 'rhn-support-smendenh'
          });
        }).then(function() {
          return TaskLogic.fetchTasks({});
        }).then(function(tasks) {
          t = tasks[0];
          t.owner['id'].should.equal('005A0000001qpArIAI');
          return t.owner['kerberos'].should.equal('smendenh');
        })["catch"](function(err) {
          throw err;
        }).done(function() {
          return done();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=taskLogicTest.js.map
