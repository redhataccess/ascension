(function() {
  var Q, ResourceOpEnum, TaskActionsEnum, TaskLogic, TaskOpEnum, TaskStateEnum, TaskTypeEnum, UserLogic, fs, logger, moment, prettyjson, request, settings, _;

  fs = require('fs');

  logger = require('tracer').colorConsole();

  settings = require('../settings/settings');

  prettyjson = require('prettyjson');

  _ = require('lodash');

  moment = require('moment');

  Q = require('q');

  ResourceOpEnum = require('../rules/enums/ResourceOpEnum');

  TaskActionsEnum = require('./enums/taskActionsEnum');

  TaskStateEnum = require('../rules/enums/TaskStateEnum');

  TaskTypeEnum = require('../rules/enums/TaskTypeEnum');

  TaskOpEnum = require('../rules/enums/TaskOpEnum');

  request = require('request');

  UserLogic = require('./userLogic');

  TaskLogic = {};

  TaskLogic.mockTasks = [];

  TaskLogic.makeSfId = function() {
    var i, possible, text;
    text = "";
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    i = 0;
    while (i < 18) {
      text += possible.charAt(Math.floor(Math.random() * possible.length)).toUpperCase();
      i++;
    }
    return text;
  };

  TaskLogic.generateExampleTask = function(caseNumber, accountNumber) {
    var accountSfId, caseSfId, createdBySfId, ownerSfId, score, taskId, tmp;
    score = Math.floor((Math.random() * 2000) + 1000);
    createdBySfId = TaskLogic.makeSfId();
    ownerSfId = TaskLogic.makeSfId();
    accountSfId = TaskLogic.makeSfId();
    caseSfId = TaskLogic.makeSfId();
    taskId = TaskLogic.makeSfId();
    tmp = {
      "resource": {
        "externalModelId": taskId,
        "closed": "2014-12-16T12:01:11.000Z",
        "created": "2014-10-30T14:55:11.000Z",
        "createdBy": {
          "externalModelId": createdBySfId
        },
        "lastModified": "2014-12-16T12:01:11.000Z",
        "resource": {
          "externalModelId": caseSfId,
          "resource": {
            "account": {
              "externalModelId": accountSfId,
              "resource": {
                "accountName": "Acme Foo",
                "accountNumber": accountNumber,
                "hasSRM": true,
                "hasTAM": true,
                "isActive": true,
                "specialHandlingRequired": true,
                "strategic": true,
                "superRegion": "NA"
              },
              "resourceReliability": "Fresh"
            },
            "caseNumber": caseNumber,
            "collaborationScore": score,
            "created": "2014-10-30T14:55:11.000Z",
            "internalPriority": "1 (Urgent)",
            "internalStatus": "Waiting on Owner",
            "isFTSCase": false,
            "isTAMCase": false,
            "lastModified": "2014-12-16T12:01:11.000Z",
            "owner": {
              "externalModelId": ownerSfId,
              "resourceReliability": "Fresh"
            },
            "product": {
              "externalModelId": null,
              "resource": {
                "line": {
                  "externalModelId": 1462,
                  "resource": {
                    "name": "Red Hat Storage Server"
                  },
                  "resourceReliability": "Fresh"
                },
                "version": {
                  "externalModelId": 17838,
                  "resource": {
                    "name": "3.0"
                  },
                  "resourceReliability": "Fresh"
                }
              },
              "resourceReliability": "Fresh"
            },
            "sbrs": ["Filesystem"],
            "sbt": Math.floor((Math.random() * 100) + 1),
            "severity": "1 (Urgent)",
            "status": "Waiting on Red Hat",
            "subject": "Example case",
            "summary": "example summary",
            "tags": ["gluster"]
          },
          "resourceReliability": "Fresh"
        },
        "resourceOperation": ResourceOpEnum.TAKE_OWNERSHIP.name,
        "score": score,
        "status": TaskStateEnum.UNASSIGNED.name,
        "taskOperation": TaskOpEnum.NOOP.name,
        "type": TaskTypeEnum.CASE.name
      }
    };
    return tmp;
  };

  TaskLogic.fetchTasks = function(opts) {
    var deferred;
    if (((opts != null ? opts.ssoUsername : void 0) != null) && (opts != null ? opts.ssoUsername : void 0) !== '') {
      deferred = Q.defer();
      deferred.resolve(TaskLogic.mockTasks);
      return deferred.promise;
    }
  };

  TaskLogic.fetchTask = function(opts) {
    var deferred;
    deferred = Q.defer();
    deferred.resolve(_.find(TaskLogic.mockTasks, function(t) {
      var _ref, _ref1;
      return ((_ref = t.resource) != null ? (_ref1 = _ref.resource) != null ? _ref1.caseNumber : void 0 : void 0) === opts.caseNumber;
    }));
    return deferred.promise;
  };

  TaskLogic.updateTask = function(opts) {
    var deferred;
    deferred = Q.defer();
    deferred.resolve(void 0);
    return deferred.promise;
  };

  module.exports = TaskLogic;

}).call(this);

//# sourceMappingURL=taskLogic.js.map
