(function() {
  var EntityOpEnum, M, Mocha, MongoOperations, Q, TaskOpEnum, TaskStateEnum, TaskTypeEnum, d3, f, fs, logger, mocha, moment, mongoose, mongooseQ, nools, path, prettyjson, request, runner, salesforce, settings, _;

  nools = require('nools');

  logger = require('tracer').colorConsole();

  prettyjson = require('prettyjson');

  salesforce = require('../../db/salesforce');

  settings = require('../../settings/settings');

  Q = require('q');

  MongoOperations = require('../../db/MongoOperations');

  TaskStateEnum = require('../enums/TaskStateEnum');

  TaskTypeEnum = require('../enums/TaskTypeEnum');

  TaskOpEnum = require('../enums/TaskOpEnum');

  EntityOpEnum = require('../enums/EntityOpEnum');

  _ = require('lodash');

  moment = require('moment');

  mongoose = require('mongoose');

  mongooseQ = require('mongoose-q')(mongoose);

  request = require('request');

  d3 = require('d3');

  M = {};

  M.determinePotentialOwners = function(opts) {
    var availableUsers, maxTaskCount, minTaskCount, obj, scale, task, taskCounts, userId, userTaskCounts, users;
    task = opts.task || new Error('The scoreTask method requires a task parameter');
    users = opts.users || [];
    userTaskCounts = opts['userTaskCounts'] || {};
    availableUsers = _.filter(users, function(u) {
      return (u['outOfOffice'] === false) && (_.intersection(task.sbrs, u.sbrs).length > 0);
    });
    taskCounts = [];
    for (userId in userTaskCounts) {
      obj = userTaskCounts[userId];
      taskCounts.push(obj['taskCount']);
    }
    minTaskCount = _.min(taskCounts);
    maxTaskCount = _.max(taskCounts);
    scale = d3.scale.linear().domain([minTaskCount, maxTaskCount]).range([1, .25]);
    task.potentialOwners = [];
    _.each(availableUsers, function(u) {
      var sbrWeight, sbrsMatched, score, skillWeight, skillsMatched, tasksOwnedWeight, userSkillNames;
      userSkillNames = _.chain(u['skills']).pluck('resource').pluck('name').flatten().unique().value();
      sbrsMatched = _.intersection(u.sbrs, task.sbrs).length;
      sbrWeight = 0;
      if (task.sbrs.length > 0) {
        sbrWeight += sbrsMatched / task.sbrs.length;
      }
      skillsMatched = _.intersection(userSkillNames, task.tags).length;
      skillWeight = 0;
      if (skillsMatched > 0) {
        _.intersection(userSkillNames, task.tags).forEach(function(tag) {
          var matchedSkill;
          matchedSkill = _.find(u.skills, function(s) {
            return s.resource.name === tag;
          });
          return skillWeight += (1 + matchedSkill.resource.level) / 4;
        });
        skillWeight = skillWeight / skillsMatched;
      }
      tasksOwnedWeight = scale(userTaskCounts[u.id].taskCount);
      score = sbrWeight + skillWeight + tasksOwnedWeight;
      return task.potentialOwners.push({
        id: u.id,
        sso: u.sso,
        fullName: u.fullName,
        score: score,
        sbrWeight: sbrWeight,
        skillWeight: skillWeight,
        tasksOwned: userTaskCounts[u.id].taskCount,
        tasksOwnedWeight: tasksOwnedWeight
      });
    });
    return task;
  };

  module.exports = M;

  if (require.main === module) {
    Mocha = require('mocha');
    path = require('path');
    fs = require('fs');
    mocha = new Mocha({
      reporter: 'dot',
      ui: 'bdd',
      timeout: 999999
    });
    f = "" + __dirname + "/../../../../../../test/com/redhat/ascension/scoring/scoringTest.js";
    mocha.addFile(f);
    runner = mocha.run(function() {
      return console.log("finished");
    });
    runner.on('pass', function(test) {
      return console.log("... " + test.title + " passed");
    });
    runner.on('fail', function(test) {
      return console.log("... " + test.title + " failed");
    });
  }

}).call(this);

//# sourceMappingURL=scoringLogic.js.map
