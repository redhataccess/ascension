(function() {
  var MongoOps, ObjectId, Q, TaskActionsEnum, TaskLogic, TaskOpEnum, TaskStateEnum, UserLogic, fs, logger, moment, mongoose, mongooseQ, prettyjson, request, settings, _;

  fs = require('fs');

  logger = require('tracer').colorConsole();

  settings = require('../settings/settings');

  prettyjson = require('prettyjson');

  _ = require('lodash');

  moment = require('moment');

  Q = require('q');

  MongoOps = require('../db/MongoOperations');

  mongoose = require('mongoose');

  mongooseQ = require('mongoose-q')(mongoose);

  TaskActionsEnum = require('./enums/taskActionsEnum');

  TaskStateEnum = require('../rules/enums/TaskStateEnum');

  TaskOpEnum = require('../rules/enums/TaskOpEnum');

  request = require('request');

  ObjectId = mongoose.Types.ObjectId;

  UserLogic = require('./userLogic');

  TaskLogic = {};

  TaskLogic.fetchTasks = function(opts) {
    var deferred, uql;
    if ((opts != null ? opts.ssoUsername : void 0) != null) {
      deferred = Q.defer();
      uql = {
        where: "SSO is \"" + opts.ssoUsername + "\""
      };
      UserLogic.fetchUserUql(uql).then(function(user) {
        var findClause;
        findClause = {
          '$or': [
            {
              'sbrs': {
                '$in': user.sbrs
              }
            }, {
              'owner.id': user.id
            }
          ]
        };
        logger.debug("Searching mongo with: " + (JSON.stringify(findClause)));
        return MongoOps['models']['task'].find().where(findClause).limit(100).execQ();
      }).then(function(tasks) {
        logger.debug("Discovered: " + tasks.length + " tasks");
        return deferred.resolve(tasks);
      })["catch"](function(err) {
        return deferred.reject(err);
      }).done();
      return deferred.promise;
    } else {
      return MongoOps['models']['task'].find().where().limit(100).execQ();
    }
  };

  TaskLogic.fetchTask = function(opts) {
    return MongoOps['models']['task'].findById(opts['_id']).execQ();
  };

  TaskLogic.updateTask = function(opts) {
    var $set, deferred;
    deferred = Q.defer();
    if (opts.action === TaskActionsEnum.ASSIGN.name && (opts.userInput != null)) {
      UserLogic.fetchUser(opts).then(function(user) {
        var $set;
        $set = {
          $set: {
            state: TaskStateEnum.ASSIGNED.name,
            taskOp: TaskOpEnum.COMPLETE_TASK.name,
            owner: user
          }
        };
        return MongoOps['models']['task'].findOneAndUpdate({
          _id: new ObjectId(opts['_id'])
        }, $set).execQ();
      }).then(function() {
        return deferred.resolve();
      })["catch"](function(err) {
        return deferred.reject(err);
      }).done();
    } else if (opts.action === TaskActionsEnum.UNASSIGN.name) {
      $set = {
        $set: {
          state: TaskStateEnum.UNASSIGNED.name,
          taskOp: TaskOpEnum.OWN_TASK.name,
          owner: null
        }
      };
      MongoOps['models']['task'].findOneAndUpdate({
        _id: new ObjectId(opts['_id'])
      }, $set).execQ().then(function() {
        return deferred.resolve();
      })["catch"](function(err) {
        return deferred.reject(err);
      }).done();
    } else if (opts.action === TaskActionsEnum.CLOSE.name) {
      $set = {
        $set: {
          state: TaskStateEnum.CLOSED.name,
          taskOp: TaskOpEnum.NOOP.name,
          closed: new Date()
        }
      };
      MongoOps['models']['task'].findOneAndUpdate({
        _id: new ObjectId(opts['_id'])
      }, $set).execQ().then(function() {
        return deferred.resolve();
      })["catch"](function(err) {
        return deferred.reject(err);
      }).done();
    } else {
      deferred.reject("" + opts.action + " is not a known action");
    }
    return deferred.promise;
  };

  module.exports = TaskLogic;

}).call(this);

//# sourceMappingURL=taskLogic.js.map
