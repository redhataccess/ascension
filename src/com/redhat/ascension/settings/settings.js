(function() {
  var Q, configFile, doc, e, fs, logger, prettyjson, yaml, _;

  yaml = require('js-yaml');

  fs = require('fs');

  logger = require('tracer').colorConsole();

  prettyjson = require('prettyjson');

  _ = require('lodash');

  Q = require('q');

  Q.longStackSupport = true;

  configFile = "" + process.env['HOME'] + "/.ascension-settings.yml";

  if (process.env['OPENSHIFT_DATA_DIR'] != null) {
    logger.debug("Loading settings under Openshift");
    configFile = "" + process.env['OPENSHIFT_DATA_DIR'] + "/.ascension-settings.yml";
  } else {
    logger.debug("Loading settings under a non-Openshift env");
    configFile = "" + process.env['HOME'] + "/.ascension-settings.yml";
  }

  exports.resolveEnvVar = function(envVar) {
    if (envVar === void 0) {
      return void 0;
    }
    if (/^\$/i.test(envVar)) {
      return process.env[envVar.slice(1, envVar.length)];
    }
    return envVar;
  };

  exports.AUTH_URL = "https://access.redhat.com/services/user/status";

  exports.SF_URL = "https://na7.salesforce.com";

  exports.UDS_URL = 'http://unified-ds.gsslab.rdu2.redhat.com:9100';

  exports.ONE_DAY_IN_S = 86400;

  exports.ONE_DAY_IN_MS = 86400 * 1000;

  try {
    doc = yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'));
    exports.config = doc;
    exports.config.SFDC_API_PASS = new Buffer(doc.SFDC_API_PASS, 'base64').toString('ascii').replace('\n', '');
    exports.env = doc.env;
    exports.environment = doc.env;
    logger.info("Running in " + doc.env);
  } catch (_error) {
    e = _error;
    throw e;
  }

}).call(this);

//# sourceMappingURL=settings.js.map
