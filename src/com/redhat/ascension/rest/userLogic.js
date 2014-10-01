(function() {
  var MongoOps, Q, TaskActionsEnum, Uri, UserLogic, Utils, fs, logger, moment, mongoose, mongooseQ, prettyjson, request, settings, _;

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

  Uri = require('jsuri');

  UserLogic = {};

  UserLogic.normalizeUserResponse = function(body) {
    var id, u, _ref;
    u = void 0;
    if ((body != null ? body['resource'] : void 0) != null) {
      id = body['externalModelId'];
      u = _.clone(body['resource']);
      u.id = id;
      u.email = (_ref = u.email[0]) != null ? _ref.address : void 0;
      u.sso = u.sso[0];
    }
    return u;
  };

  UserLogic.fetchUser = function(opts) {
    var deferred, self;
    self = UserLogic;
    deferred = Q.defer();
    opts = {
      url: "" + settings.UDS_URL + "/user/" + opts.userInput,
      json: true
    };
    request(opts, function(err, response, body) {
      var user;
      user = self.normalizeUserResponse(body);
      if (err) {
        deferred.reject(err);
        return;
      }
      if (user == null) {
        deferred.reject("Could not find user with input: " + opts.userInput);
        return;
      }
      return deferred.resolve(user);
    });
    return deferred.promise;
  };

  UserLogic.fetchUserUql = function(opts) {
    var deferred, self, uri;
    self = UserLogic;
    deferred = Q.defer();
    uri = new Uri(settings.UDS_URL).setPath('/user').setQuery('where=' + opts.where);
    opts = {
      url: uri.toString(),
      json: true
    };
    request(opts, function(err, response, body) {
      var user;
      user = void 0;
      if (_.isArray(body)) {
        user = self.normalizeUserResponse(body[0]);
      } else {
        user = self.normalizeUserResponse(body);
      }
      if (err) {
        deferred.reject(err);
        return;
      }
      if (user == null) {
        deferred.reject("Could not find user with input: " + opts.userInput);
        return;
      }
      logger.debug("Discovered user: " + (prettyjson.render(user)));
      return deferred.resolve(user);
    });
    return deferred.promise;
  };

  module.exports = UserLogic;

}).call(this);

//# sourceMappingURL=userLogic.js.map
