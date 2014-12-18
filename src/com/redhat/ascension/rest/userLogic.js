(function() {
  var Q, TaskActionsEnum, Uri, UserLogic, Utils, fs, logger, moment, prettyjson, request, settings, _;

  fs = require('fs');

  logger = require('tracer').colorConsole();

  settings = require('../settings/settings');

  Utils = require('../utils/utils');

  prettyjson = require('prettyjson');

  _ = require('lodash');

  moment = require('moment');

  Q = require('q');

  TaskActionsEnum = require('./enums/taskActionsEnum');

  request = require('request');

  Uri = require('jsuri');

  UserLogic = {};

  UserLogic.normalizeUserResponse = function(body) {
    var id, u, _ref, _ref1, _ref2;
    u = void 0;
    if (_.isArray(body)) {
      u = body[0];
    } else {
      u = body;
    }
    if ((u != null ? u['resource'] : void 0) != null) {
      id = u['externalModelId'];
      u = u['resource'];
      u.id = id;
      u.email = (_ref = u.email) != null ? (_ref1 = _ref[0]) != null ? _ref1.address : void 0 : void 0;
      u.sso = (_ref2 = u.sso) != null ? _ref2[0] : void 0;
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
    logger.debug("UserLogic.fetchUser: " + opts.url);
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
      return deferred.resolve(user);
    });
    return deferred.promise;
  };

  UserLogic.fetchUsersUql = function(opts) {
    var deferred, self, uri;
    self = UserLogic;
    deferred = Q.defer();
    uri = new Uri(settings.UDS_URL).setPath('/user').setQuery('where=' + opts.where);
    opts = {
      url: uri.toString(),
      json: true
    };
    logger.debug("Fetching users with uri: " + opts.url);
    request(opts, function(err, response, body) {
      var users;
      if (err) {
        deferred.reject(err);
        return;
      }
      users = [];
      _.each(body, function(u) {
        var normalizedUser;
        normalizedUser = self.normalizeUserResponse(u);
        return users.push(normalizedUser);
      });
      return deferred.resolve(users);
    });
    return deferred.promise;
  };

  module.exports = UserLogic;

}).call(this);

//# sourceMappingURL=userLogic.js.map
