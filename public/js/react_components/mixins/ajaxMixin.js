(function() {
  var Mixin, Q, Uri, moment, _;

  moment = require('moment');

  _ = require('lodash');

  Uri = require('jsUri');

  Q = require('q/q');

  Mixin = {
    get: function(opts) {
      var callConfig, metricsConfig, uri;
      metricsConfig = {
        data: {},
        xhrFields: {
          withCredentials: true
        },
        timeout: 60000,
        cache: true
      };
      uri = new Uri();
      uri.setPath("" + opts.path);
      _.each(opts['queryParams'], function(queryParam) {
        return uri.addQueryParam(queryParam['name'], queryParam['value']);
      });
      callConfig = _.defaults(_.clone(metricsConfig), {
        url: uri.toString()
      });
      return Q($.ajax(callConfig));
    },
    post: function(opts) {
      var callConfig, metricsConfig, uri;
      metricsConfig = {
        data: {},
        xhrFields: {
          withCredentials: true
        },
        timeout: 60000,
        cache: true,
        type: 'POST'
      };
      uri = new Uri();
      uri.setPath("" + opts.path);
      _.each(opts['queryParams'], function(queryParam) {
        return uri.addQueryParam(queryParam['name'], queryParam['value']);
      });
      callConfig = _.defaults(_.clone(metricsConfig), {
        url: uri.toString()
      });
      return Q($.ajax(callConfig));
    }
  };

  module.exports = Mixin;

}).call(this);
