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
    o = {};
    o.host = settings.resolveEnvVar(settings.config.mongoHost) || '127.0.0.1';
    o.port = settings.resolveEnvVar(settings.config.mongoPort) || 27017;
    o.db = db || settings.resolveEnvVar(settings.config.mongoDb) || 'test';
    o.user = settings.resolveEnvVar(settings.config.mongoUser) || void 0;
    o.pass = settings.resolveEnvVar(settings.config.mongoPass) || void 0;
    mongourl = void 0;
    if (((o.user != null) && o.user !== '') && ((o.pass != null) && o.pass !== '')) {
      mongourl = "mongodb://" + o.user + ":" + o.pass + "@" + o.host + ":" + o.port + "/" + o.db + "?auto_reconnect=true";
    } else {
      mongourl = "mongodb://" + o.host + ":" + o.port + "/" + o.db + "?auto_reconnect=true";
    }
    return mongourl;
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
      completed: Date,
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
        AccountId: String,
        Account_Number__c: String,
        CaseNumber: String,
        Collaboration_Score__c: Number,
        Comment_Count__c: Number,
        CreatedDate: Date,
        Created_By__c: String,
        FTS_Role__c: String,
        FTS__c: Boolean,
        Last_Breach__c: Date,
        PrivateCommentCount__c: Number,
        PublicCommentCount__c: Number,
        SBT__c: Number,
        SBR_Group__c: Array,
        Severity__c: String,
        Status: String,
        Strategic__c: Boolean,
        Internal_Status__c: String,
        Tags__c: Array
      }
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
