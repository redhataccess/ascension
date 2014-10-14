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
    var deferred, findClause, uql;
    if (((opts != null ? opts.ssoUsername : void 0) != null) && (opts != null ? opts.ssoUsername : void 0) !== '') {
      deferred = Q.defer();
      uql = {
        where: "SSO is \"" + opts.ssoUsername + "\""
      };
      UserLogic.fetchUserUql(uql).then(function(user) {
        var nonOwnerFindClause, nonOwnerTasksPromise, ownerFindClause, ownerTasksPromise;
        ownerFindClause = {
          'owner.id': user.id,
          'state': {
            '$ne': 'closed'
          },
          'declinedUsers.id': {
            '$ne': user.id
          }
        };
        nonOwnerFindClause = {
          '$and': [
            {
              'state': {
                '$ne': 'closed'
              }
            }, user.sbrs !== void 0 ? {
              'sbrs': {
                '$in': user.sbrs
              }
            } : void 0, {
              'owner.id': {
                '$ne': user.id
              }
            }, {
              'declinedUsers.id': {
                '$ne': user.id
              }
            }
          ]
        };
        logger.debug("Searching mongo with ownerFindClause: " + (JSON.stringify(ownerFindClause)));
        logger.debug("Searching mongo with nonOwnerFindClause: " + (JSON.stringify(nonOwnerFindClause)));
        ownerTasksPromise = MongoOps['models']['task'].find().where(ownerFindClause).limit(_.parseInt(opts.limit)).sort('-score').execQ();
        nonOwnerTasksPromise = MongoOps['models']['task'].find().where(nonOwnerFindClause).limit(_.parseInt(opts.limit)).sort('-score').execQ();
        return [ownerTasksPromise, nonOwnerTasksPromise];
      }).spread(function(ownerTasks, nonOwnerTasks) {
        var finalTasks;
        logger.debug("Discovered: " + ownerTasks.length + " owner tasks, and " + nonOwnerTasks.length + " non-owner tasks");
        finalTasks = [];
        if (ownerTasks.length > 7) {
          return deferred.resolve(ownerTasks.slice(0, 7));
        } else {
          logger.debug("Discovered: " + ownerTasks.length + " owner tasks and " + nonOwnerTasks.length + " non-owner tasks.");
          _.each(ownerTasks, function(t) {
            return finalTasks.push(t);
          });
          _.each(nonOwnerTasks, function(t) {
            return finalTasks.push(t);
          });
          return deferred.resolve(finalTasks.slice(0, 7));
        }
      })["catch"](function(err) {
        return deferred.reject(err);
      }).done();
      return deferred.promise;
    } else {
      findClause = {
        'state': {
          '$ne': 'closed'
        }
      };
      return MongoOps['models']['task'].find().where(findClause).limit(_.parseInt(opts.limit)).execQ();
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
    } else if (opts.action === TaskActionsEnum.DECLINE.name) {
      UserLogic.fetchUser(opts).then(function(user) {
        var $update;
        $update = {
          $push: {
            declinedUsers: {
              id: user['id'],
              sso: user['sso'],
              fullName: user['fullName'],
              declinedOn: new Date()
            }
          }
        };
        logger.debug("Declining the event with " + (prettyjson.render($update)));
        return MongoOps['models']['task'].findOneAndUpdate({
          _id: new ObjectId(opts['_id'])
        }, $update).execQ();
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
