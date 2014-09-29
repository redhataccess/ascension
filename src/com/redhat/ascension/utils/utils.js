(function() {
  var logger, moment, prettyjson, settings, _;

  _ = require('lodash');

  settings = require('../settings/settings');

  moment = require('moment');

  logger = require('tracer').colorConsole(exports.logger_config);

  prettyjson = require('prettyjson');

  exports.logger_config = {
    level: settings.env === 'development' ? 'debug' : 'info',
    level: 'debug',
    format: "[{{timestamp}}] <{{title}}> <{{file}}:{{line}}> {{message}}",
    dateformat: "yyyy-mm-dd hh:MM:ss"
  };

  exports.truthy = function(obj) {
    if (obj === void 0) {
      return false;
    } else if (_.isBoolean(obj)) {
      return obj;
    } else if (_.isString(obj)) {
      if (_.contains(['YES', 'Yes', 'yes', 'Y', 'y', '1', 'true', 'TRUE', 'ok', 'OK', 'Ok'], obj)) {
        return true;
      } else {
        return false;
      }
    } else if (_.isNumber(obj)) {
      return parseInt(obj) === 1;
    } else {
      return false;
    }
  };

}).call(this);

//# sourceMappingURL=utils.js.map
