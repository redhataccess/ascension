(function() {
  var Q, UserLogic, assert, chai, errorHandler, expect, fs, logger, moment, mongoose, path, prettyjson, should, yaml, _;

  chai = require('chai');

  expect = chai.expect;

  should = chai.should();

  fs = require('fs');

  yaml = require('js-yaml');

  path = require('path');

  assert = require('assert');

  should = require('should');

  moment = require('moment');

  logger = require('tracer').colorConsole();

  mongoose = require('mongoose');

  prettyjson = require('prettyjson');

  _ = require('lodash');

  Q = require('q');

  UserLogic = require('../../../../../src/com/redhat/ascension/rest/userLogic');

  errorHandler = function(err) {
    throw err;
  };

  describe("User Logic", function() {
    return describe("Pulling Kernel Users by UQL", function() {
      return it("should contain rmanes", function(done) {
        var sbrs, uql, uqlParts;
        sbrs = ['Kernel', 'Webservers'];
        uqlParts = [];
        _.each(sbrs, function(sbr) {
          return uqlParts.push("(sbrName is \"" + sbr + "\")");
        });
        uql = uqlParts.join(' OR ');
        logger.debug("Generated uql: " + uql);
        return UserLogic.fetchUsersUql({
          where: uql
        }).then(function(users) {
          var ssos;
          ssos = _.chain(users).pluck('sso').value();
          expect(ssos).to.contain('rhn-support-rmanes');
          expect(ssos).to.contain('rhn-support-aogburn');
          return done();
        }).done();
      });
    });
  });

}).call(this);

//# sourceMappingURL=userLogicTest.js.map
