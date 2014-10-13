(function() {
  var MongoOps, Schema, TaskOpEnum, TaskStateEnum, TaskTypeEnum, db, logger, mongoose, prettyjson, settings, _;

  _ = require('lodash');

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  logger = require('tracer').colorConsole();

  settings = require('../settings/settings');

  TaskStateEnum = require('../rules/enums/TaskStateEnum');

  TaskTypeEnum = require('../rules/enums/TaskTypeEnum');

  TaskOpEnum = require('../rules/enums/TaskOpEnum');

  prettyjson = require('prettyjson');

  MongoOps = {
    'schemas': {
      'task': void 0
    },
    'models': {
      'task': void 0
    }
  };

  MongoOps.generateMongoUrl = function(db) {
    var mongourl, o;
    if (settings.getEnvVar('OPENSHIFT_MONGODB_DB_URL')) {
      return settings.getEnvVar('OPENSHIFT_MONGODB_DB_URL');
    } else {
      o = {};
      o.host = settings.getEnvVar('OPENSHIFT_MONGODB_DB_HOST') || '127.0.0.1';
      o.port = settings.getEnvVar('OPENSHIFT_MONGODB_DB_PORT') || 27017;
      o.db = db || 'ascension';
      o.user = settings.getEnvVar('OPENSHIFT_MONGODB_DB_USERNAME') || void 0;
      o.pass = settings.getEnvVar('OPENSHIFT_MONGODB_DB_PASSWORD') || void 0;
      if (((o.user != null) && o.user !== '') && ((o.pass != null) && o.pass !== '')) {
        mongourl = "mongodb://" + o.user + ":" + o.pass + "@" + o.host + ":" + o.port + "/" + o.db + "?auto_reconnect=true";
      } else {
        mongourl = "mongodb://" + o.host + ":" + o.port + "/" + o.db + "?auto_reconnect=true";
      }
      return mongourl;
    }
  };

  MongoOps.init = function(test) {
    var db, opts;
    if (test == null) {
      test = false;
    }
    opts = {
      native_parser: true,
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    };
    mongoose.set('debug', true);
    db = test ? 'ascension-test' : 'ascension';
    return mongoose.connect(MongoOps.generateMongoUrl(db), opts);
  };

  MongoOps.defineCollections = function() {
    MongoOps['schemas']['task'] = new Schema({
      bid: String,
      score: Number,
      locked: {
        type: Boolean,
        "default": false
      },
      scoreLocked: {
        type: Boolean,
        "default": false
      },
      timeout: {
        type: Number,
        "default": -1
      },
      sbrs: {
        type: Array,
        "default": []
      },
      tags: {
        type: Array,
        "default": []
      },
      owner: {
        id: String,
        fullName: String,
        email: String,
        sso: String,
        gss: Boolean,
        superRegion: String,
        timezone: String,
        firstName: String,
        lastName: String,
        aliasName: String,
        kerberos: String,
        salesforce: String,
        isManager: Boolean,
        active: Boolean,
        created: Date,
        lastLogin: Date,
        lastModified: Date,
        outOfOffice: Boolean
      },
      closed: Date,
      created: {
        type: Date,
        "default": Date.now
      },
      lastUpdated: {
        type: Date,
        "default": Date.now
      },
      type: {
        type: String
      },
      taskOp: {
        type: String,
        "default": TaskOpEnum.NOOP.name
      },
      entityOp: {
        type: String,
        "default": TaskOpEnum.NOOP.name
      },
      state: {
        type: String,
        "default": TaskStateEnum.UNASSIGNED.name
      },
      "case": {
        accountNumber: String,
        caseNumber: String,
        collaborationScore: Number,
        created: Date,
        fts: Boolean,
        sbt: Number,
        sbrs: Array,
        tags: Array,
        severity: String,
        status: String,
        strategic: Boolean,
        internalStatus: String
      },
      declinedUsers: {
        id: String,
        sso: String,
        fullName: String,
        declinedOn: Date
      },
      potentialOwners: []
    });
    return MongoOps['models']['task'] = mongoose.model('Task', MongoOps['schemas']['task']);
  };

  MongoOps.reset = function() {
    return MongoOps['models']['task'].removeQ({});
  };

  module.exports = MongoOps;

  if (require.main === module) {
    MongoOps.init();
    db = mongoose['connection'];
    db.on('error', logger.error.bind(logger, 'connection error:'));
    db.once('open', function() {
      MongoOps.defineCollections();
      return process.exit();
    });
  }

}).call(this);

//# sourceMappingURL=MongoOperations.js.map
