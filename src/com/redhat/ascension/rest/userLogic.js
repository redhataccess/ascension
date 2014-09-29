(function() {
  var MongoOps, Q, TaskActionsEnum, UserLogic, Utils, fs, logger, moment, mongoose, mongooseQ, prettyjson, request, settings, _;

  fs = require('fs');

  logger = require('tracer').colorConsole();

  settings = require('../settings/settings');

  Utils = require('../utils/utils');

  prettyjson = require('prettyjson');

  _ = require('lodash');

  moment = require('moment');

  Q = require('q');

  MongoOps = require('../db/MongoOperations');

  mongoose = require('mongoose');

  mongooseQ = require('mongoose-q')(mongoose);

  TaskActionsEnum = require('./enums/taskActionsEnum');

  request = require('request');

  UserLogic = {};

  UserLogic.fetchUser = function(opts) {
    var deferred;
    deferred = Q.defer();
    opts = {
      url: "" + settings.UDS_URL + "/user/" + opts.userInput,
      json: true
    };
    request(opts, function(err, response, body) {
      var user, _ref;
      user = body['resource'];
      if (err) {
        deferred.reject(err);
        return;
      }
      if (user == null) {
        deferred.reject("Could not find user with input: " + opts.userInput);
        return;
      }
      user.email = (_ref = user.email[0]) != null ? _ref.address : void 0;
      user.sso = user.sso[0];
      user.id = body['externalModelId'];
      return deferred.resolve(user);
    });
    return deferred.promise;
  };

  module.exports = UserLogic;

}).call(this);

//# sourceMappingURL=userLogic.js.map
