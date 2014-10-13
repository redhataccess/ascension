(function() {
  var M, MongoOps, Q, d3, db, dbPromise, logger, moment, mongoose, mongooseQ, prettyjson, request, settings, _;

  logger = require('tracer').colorConsole();

  prettyjson = require('prettyjson');

  settings = require('../settings/settings');

  Q = require('q');

  MongoOps = require('./MongoOperations');

  _ = require('lodash');

  moment = require('moment');

  mongoose = require('mongoose');

  mongooseQ = require('mongoose-q')(mongoose);

  request = require('request');

  d3 = require('d3');

  M = {};

  M.getTaskCounts = function(userIds) {
    var deferred;
    deferred = Q.defer();
    MongoOps['models']['task'].aggregate().match({
      'owner.id': {
        $in: userIds
      }
    }).group({
      _id: '$owner.id',
      taskCount: {
        $sum: 1
      }
    }).execQ().then(function(results) {
      var hashedIds;
      hashedIds = _.object(_.map(userIds, function(id) {
        return [
          id, {
            taskCount: 0
          }
        ];
      }));
      _.each(results, function(r) {
        return hashedIds[r['_id']]['taskCount'] = r['taskCount'];
      });
      return deferred.resolve(hashedIds);
    })["catch"](function(err) {
      return deferred.reject(err);
    }).done();
    return deferred.promise;
  };

  module.exports = M;

  if (require.main === module) {
    MongoOps.init();
    db = mongoose['connection'];
    db.on('error', logger.error.bind(logger, 'connection error:'));
    dbPromise = Q.defer();
    db.once('open', function() {
      return dbPromise.resolve();
    });
    dbPromise.promise.then(function() {
      return MongoOps.defineCollections();
    }).then(function() {
      return M.getTaskCounts(['005A0000000zqMTIAY', '005A0000000wLT9IAM']);
    }).then(function(result) {
      return logger.debug(prettyjson.render(result));
    })["catch"](function(err) {
      return logger.error(err.stack);
    }).done(function() {
      return process.exit();
    });
  }

}).call(this);

//# sourceMappingURL=taskCounts.js.map
