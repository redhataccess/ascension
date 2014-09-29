(function() {
  var MongoOps, ObjectId, Q, TaskActionsEnum, TaskLogic, TaskStateEnum, UserLogic, fs, logger, moment, mongoose, mongooseQ, prettyjson, request, settings, _;

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

  request = require('request');

  ObjectId = mongoose.Types.ObjectId;

  UserLogic = require('./userLogic');

  TaskLogic = {};

  TaskLogic.fetchTasks = function(opts) {
    return MongoOps['models']['task'].find().where().limit(100).execQ();
  };

  TaskLogic.fetchTask = function(opts) {
    return MongoOps['models']['task'].findById(opts['_id']).execQ();
  };

  TaskLogic.updateTask = function(opts) {
    var deferred;
    deferred = Q.defer();
    if (opts.action === TaskActionsEnum.ASSIGN && (opts.userInput != null)) {
      UserLogic.fetchUser(opts).then(function(user) {
        var $set;
        $set = {
          $set: {
            state: TaskStateEnum.ASSIGNED.name,
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
    } else {
      deferred.reject("" + opts.action + " is not a known action");
    }
    return deferred.promise;
  };

  module.exports = TaskLogic;

}).call(this);

//# sourceMappingURL=taskLogic.js.map
