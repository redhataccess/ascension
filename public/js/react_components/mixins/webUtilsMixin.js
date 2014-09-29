(function() {
  var Q, WebUtilsMixin, _;

  _ = require('lodash');

  Q = require('q');

  WebUtilsMixin = {};

  WebUtilsMixin.calculateSpinnerClass = function(loading) {
    if (loading === true) {
      return 'fa-spinner fa-spin';
    } else {
      return '';
    }
  };

  WebUtilsMixin.isEqual = function(x) {
    _.each(x, function(group) {
      if (!_.isEqual(group[0], group[1])) {
        return false;
      }
    });
    return true;
  };

  WebUtilsMixin.trim = function(str) {
    var newstr;
    newstr = str.replace(/^\s*/, "").replace(/\s*$/, "");
    return newstr = newstr.replace(/\s{2,}/, " ");
  };

  WebUtilsMixin.getCookie = function(key) {
    var c, c_trimmed, _i, _len, _ref;
    key = key + "=";
    _ref = document.cookie.split(';');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      c_trimmed = WebUtilsMixin.trim(c);
      if (c_trimmed.indexOf(key) === 0) {
        return c_trimmed.substring(key.length, c_trimmed.length);
      }
    }
    return null;
  };

  WebUtilsMixin.getRhUserCookie = function() {
    var rh_user;
    rh_user = WebUtilsMixin.getCookie('rh_user');
    if ((rh_user != null) && rh_user.indexOf("|") !== -1) {
      rh_user = rh_user.substring(0, rh_user.indexOf("|"));
      return rh_user;
    } else {
      return void 0;
    }
  };

  WebUtilsMixin.getAuthenticatedUser = function(ssoUsername) {
    var config, deferred, url;
    deferred = Q.defer();
    if ((ssoUsername != null) && ssoUsername !== '') {
      url = "/user/" + ssoUsername;
      config = {
        url: url,
        type: 'GET',
        timeout: 60000,
        success: (function(result, textStatus, jqXHR) {
          return deferred.resolve(result);
        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown) {
          console.error("Error while retrieving user: " + ssoUsername);
          return deferred.reject(errorThrown);
        }).bind(this)
      };
      $.ajax(config);
    }
    return deferred.promise;
  };

  module.exports = WebUtilsMixin;

}).call(this);
