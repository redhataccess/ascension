chai        = require 'chai'
expect      = chai.expect
should      = chai.should()
fs          = require 'fs'
yaml        = require 'js-yaml'
path        = require('path')
assert      = require 'assert'
should      = require 'should'
moment      = require 'moment'
logger      = require('tracer').colorConsole()
mongoose    = require 'mongoose'
prettyjson  = require 'prettyjson'
_           = require 'lodash'
Q           = require 'q'

UserLogic   = require '../../../../../src/com/redhat/ascension/rest/userLogic'

errorHandler = (err) -> throw err

#mocha --require coffee-script/register --compilers coffee:coffee-script/register test/com/redhat/ascension/user/userLogicTest.coffee
describe "User Logic", ->

  describe "Pulling Kernel Users by UQL", () ->

    it "should contain rmanes", (done) ->

      # Get a unique list of SBRs and grab the users in those SBRs
      sbrs = ['Kernel', 'Webservers']

      uqlParts = []
      _.each sbrs, (sbr) -> uqlParts.push "(sbrName is \"#{sbr}\")"
      uql = uqlParts.join(' OR ')
      logger.debug "Generated uql: #{uql}"

      UserLogic.fetchUsersUql({where: uql})
      .then((users) ->
        ssos = _.chain(users).pluck('sso').value()

        # rmanes is in Kernel, Networking
        expect(ssos).to.contain('rhn-support-rmanes')

        # aogburn is in Webservers, JVM, and JBoss Base AS
        expect(ssos).to.contain('rhn-support-aogburn')

        done()

      ).done()

