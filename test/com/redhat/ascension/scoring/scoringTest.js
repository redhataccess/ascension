(function() {
  var EntityOpEnum, MongoOperations, Q, ScoringLogic, TaskActionsEnum, TaskOpEnum, TaskRules, TaskStateEnum, TaskTypeEnum, TaskUtils, assert, chai, errorHandler, expect, fs, logger, moment, mongoose, path, prettyjson, should, userTaskCounts, users, yaml, _;

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

  ScoringLogic = require('../../../../../src/com/redhat/ascension/rules/scoring/scoringLogic');

  TaskUtils = require('../../../../../src/com/redhat/ascension/utils/taskUtils');

  TaskRules = require('../../../../../src/com/redhat/ascension/rules/taskRules');

  TaskOpEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum');

  EntityOpEnum = require('../../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum');

  TaskStateEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum');

  TaskTypeEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum');

  TaskActionsEnum = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum');

  errorHandler = function(err) {
    throw err;
  };

  users = [
    {
      'id': 1,
      "fullName": "Ogburn, Aaron",
      "sso": 'rhn-support-aogburn',
      "outOfOffice": false,
      "sbrs": ["Webservers", "JVM & Diagnostics", "JBoss Base AS"],
      "skills": [
        {
          "resource": {
            "name": "memory",
            "skillType": "kcsdw",
            "level": 2
          }
        }, {
          "resource": {
            "name": "nsapi_redirector",
            "skillType": "kcsdw",
            "level": 1
          }
        }, {
          "resource": {
            "name": "ipa",
            "skillType": "kcsdw",
            "level": 1
          }
        }, {
          "resource": {
            "name": "scsi_disk",
            "skillType": "kcsdw",
            "level": 0
          }
        }, {
          "resource": {
            "name": "mdraid",
            "skillType": "kcsdw",
            "level": 2
          }
        }, {
          "resource": {
            "name": "httpd",
            "skillType": "kcsdw",
            "level": 2
          }
        }
      ]
    }, {
      'id': 2,
      "fullName": "Sutherland, Coty",
      "sso": 'rhn-support-csutherl',
      "outOfOffice": false,
      "sbrs": ["Webservers", "JVM & Diagnostics", "JBoss Base AS"],
      "skills": [
        {
          "resource": {
            "name": "httpd",
            "skillType": "kcsdw",
            "level": 1
          }
        }, {
          "resource": {
            "name": "mod_jk",
            "skillType": "kcsdw",
            "level": 1
          }
        }, {
          "resource": {
            "name": "mod_cluster",
            "skillType": "kcsdw",
            "level": 2
          }
        }
      ]
    }
  ];

  userTaskCounts = {
    1: {
      taskCount: 0
    },
    2: {
      taskCount: 1
    }
  };

  describe("Scoring Logic", function() {
    return describe("Score a httpd task higher for higher skill user", function() {
      it("Score aogburn higher", function(done) {
        var aogburn, coty, t;
        t = TaskUtils.generateMockTask({
          'case': {
            'status': 'Waiting on Red Hat',
            'internalStatus': 'Unassigned'
          },
          'task': {
            'type': TaskTypeEnum.CASE.name,
            'taskOp': TaskOpEnum.NOOP.name,
            'state': TaskStateEnum.UNASSIGNED.name,
            'sbrs': ['Webservers'],
            'tags': ['httpd']
          }
        });
        t = ScoringLogic.determinePotentialOwners({
          task: t,
          userTaskCounts: userTaskCounts,
          users: users
        });
        logger.debug(prettyjson.render(t));
        aogburn = _.find(t.potentialOwners, function(p) {
          return p.id === 1;
        });
        coty = _.find(t.potentialOwners, function(p) {
          return p.id === 2;
        });
        aogburn.score.should.be.above(coty.score);
        return done();
      });
      return it("Score coty equal to aogburn due to tasks owned", function(done) {
        var aogburn, coty, t;
        t = TaskUtils.generateMockTask({
          'case': {
            'status': 'Waiting on Red Hat',
            'internalStatus': 'Unassigned'
          },
          'task': {
            'type': TaskTypeEnum.CASE.name,
            'taskOp': TaskOpEnum.NOOP.name,
            'state': TaskStateEnum.UNASSIGNED.name,
            'sbrs': ['Webservers'],
            'tags': ['mod_cluster']
          }
        });
        t = ScoringLogic.determinePotentialOwners({
          task: t,
          userTaskCounts: userTaskCounts,
          users: users
        });
        logger.debug(prettyjson.render(t));
        aogburn = _.find(t.potentialOwners, function(p) {
          return p.id === 1;
        });
        coty = _.find(t.potentialOwners, function(p) {
          return p.id === 2;
        });
        coty.score.should.equal(aogburn.score);
        return done();
      });
    });
  });

}).call(this);

//# sourceMappingURL=scoringTest.js.map
