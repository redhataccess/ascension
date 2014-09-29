(function() {
  var c, counter, handleLogin, jsforce, logger, login, pass_token, prettyjson, querySf, querySfHelper, recoverableError, settings, utils, _;

  jsforce = require('jsforce');

  utils = require('../utils/utils');

  settings = require('../settings/settings');

  logger = require('tracer').colorConsole(utils.logger_config);

  prettyjson = require('prettyjson');

  _ = require('lodash');

  pass_token = "" + settings.config.SFDC_API_PASS + settings.config['SFDC_API_TOKEN'];

  pass_token = pass_token.replace('\n', '');

  c = void 0;

  login = function(callback) {
    c.login(settings.config['SFDC_API_USER'], pass_token, function(err, userInfo) {
      if (err) {
        logger.debug("Lost sf connection: " + (prettyjson.render(err)));
      }
      logger.info("Access Token: " + c.accessToken);
      logger.debug("User ID: " + userInfo.id);
      logger.debug("Org ID: " + userInfo.organizationId);
      return callback();
    });
    return c.on("refresh", function(accessToken, res) {
      return logger.info("Access Token refreshed: " + c.accessToken);
    });
  };

  counter = 0;

  recoverableError = function(err) {
    return ((err != null ? err.errorCode : void 0) === "INVALID_SESSION_ID") || ((err != null ? err.errorCode : void 0) === "ECONNRESET") || ((err != null ? err['message'] : void 0) === "Invalid protocol");
  };

  handleLogin = function(opts, callback) {
    if (c == null) {
      c = new jsforce.Connection({});
      logger.debug("Querying SF for the first time, logging in...");
      return login(function() {
        return callback();
      });
    } else if (recoverableError(opts.err)) {
      return login(function() {
        return callback();
      });
    } else {
      return callback();
    }
  };

  querySfHelper = function(opts, callback) {
    return handleLogin({}, function() {
      var e, query, records;
      if (counter <= 2) {
        records = [];
        logger.debug("Querying Salesforce with: " + (prettyjson.render(opts.soql)));
        try {
          query = c.query(opts['soql']);
          return query.on('record', function(record) {
            return records.push(record);
          }).on('error', function(err) {
            logger.debug("recoverable? " + (recoverableError(err)));
            if (recoverableError(err) && counter < 10) {
              logger.error("SOQL produced an error: " + err + " Attempting to re-login");
              counter += 1;
              return handleLogin({
                err: err
              }, function() {
                logger.debug("Attmpting to re-query with the original soql.");
                return querySfHelper(opts, callback);
              });
            } else {
              counter = 0;
              logger.error("SOQL produced an error: " + err + ", this is a hard failure, soql: " + (prettyjson.render(opts.soql)));
              return callback(JSON.stringify(err));
            }
          }).on('end', function() {
            var output;
            output = opts['single'] === true ? records != null ? records[0] : void 0 : records;
            return callback(null, output);
          }).run({
            autoFetch: true,
            maxFetch: 10000
          });
        } catch (_error) {
          e = _error;
          logger.debug("recoverable? " + (recoverableError(err)));
          if (recoverableError(err) && counter < 10) {
            logger.error("SOQL produced an error: " + err + " Attempting to re-login");
            counter += 1;
            return handleLogin({
              err: err
            }, function() {
              logger.debug("Attmpting to re-query with the original soql.");
              return querySfHelper(opts, callback);
            });
          }
        }
      } else {
        counter = 0;
        return callback("Max 2 reconnection tries attempted, please contact smendenh@redhat.com");
      }
    });
  };

  querySf = function(opts, callback) {
    return querySfHelper(opts, function(err, results) {
      return callback(err, results);
    });
  };

  exports.SPAM_QUEUE_ID = '00GA0000000XxxNMAS';

  exports.querySf = querySf;

  exports.handleLogin = handleLogin;

  exports.conn = c;

  exports.cleanup = function() {
    return c.logout(function(err) {
      if (err) {
        logger.error("Session has already expired: " + err);
      }
      return logger.debug("Successfully logged out of the SF session with Access Token: " + c.accessToken);
    });
  };

}).call(this);

//# sourceMappingURL=salesforce.js.map
