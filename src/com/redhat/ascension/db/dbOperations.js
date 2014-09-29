(function() {
  var DbOperations, Seq, _;

  Seq = require('sequelize');

  _ = require('lodash');

  DbOperations = {
    'sequelize': void 0,
    'tables': {
      'task': void 0
    }
  };

  DbOperations.generateMongoUrl = function(db) {
    var mongourl, o;
    o = {};
    o.host = resolveEnvVar(exports.config.mongoHost) || '127.0.0.1';
    o.port = resolveEnvVar(exports.config.mongoPort) || 27017;
    o.db = db || resolveEnvVar(exports.config.mongoDb) || 'test';
    o.user = resolveEnvVar(exports.config.mongoUser) || void 0;
    o.pass = resolveEnvVar(exports.config.mongoPass) || void 0;
    mongourl = void 0;
    if (((o.user != null) && o.user !== '') && ((o.pass != null) && o.pass !== '')) {
      mongourl = "mongodb://" + o.user + ":" + o.pass + "@" + o.host + ":" + o.port + "/" + o.db + "?auto_reconnect=true";
    } else {
      mongourl = "mongodb://" + o.host + ":" + o.port + "/" + o.db + "?auto_reconnect=true";
    }
    return mongourl;
  };

  DbOperations.init = function() {
    return DbOperations['sequelize'] = new Seq('postgres', void 0, void 0, {
      host: 'localhost',
      dialect: 'postgres',
      omitNull: true,
      port: 5432,
      pool: {
        maxConnections: 5,
        maxIdleTime: 30
      },
      timestamps: true,
      underscored: true,
      freezeTableName: true
    });
  };

  DbOperations.defineTables = function() {
    var Task;
    Task = DbOperations['sequelize'].define('task', {
      bid: {
        type: Seq.STRING(40)
      },
      type: {
        type: Seq.ENUM,
        values: ['case', 'kcs', 'user_defined']
      },
      name: {
        type: Seq.STRING(255)
      },
      score: {
        type: Seq.INTEGER
      },
      locked: {
        type: Seq.BOOLEAN
      },
      timeout: {
        type: Seq.BIGINT
      },
      sbrs: {
        type: Seq.ARRAY(Seq.TEXT)
      },
      tags: {
        type: Seq.ARRAY(Seq.TEXT)
      },
      owner: {
        type: Seq.STRING(40)
      },
      completed: {
        type: Seq.DATE
      },
      state: {
        type: Seq.ENUM,
        values: ['new', 'closed', 'abandoned', 'completed', 'assigned']
      }
    }, {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    });
    return DbOperations['tables']['task'] = Task;
  };

  DbOperations.syncTables = function(opts) {
    return DbOperations['tables']['task'].sync(opts || {
      force: false
    });
  };

  module.exports = DbOperations;

  if (require.main === module) {
    DbOperations.init();
    DbOperations.defineTables();
    DbOperations.syncTables({
      force: true
    });
  }

}).call(this);
