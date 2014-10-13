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

MongoOperations   = require '../../../../../src/com/redhat/ascension/db/MongoOperations'
ScoringLogic      = require '../../../../../src/com/redhat/ascension/rules/scoring/scoringLogic'
TaskCounts      = require '../../../../../src/com/redhat/ascension/db/taskCounts'
UserLogic         = require '../../../../../src/com/redhat/ascension/rest/userLogic'
CaseRules         = require '../../../../../src/com/redhat/ascension/rules/case/caseRules'
TaskUtils         = require '../../../../../src/com/redhat/ascension/utils/taskUtils'
TaskRules         = require '../../../../../src/com/redhat/ascension/rules/taskRules'
TaskOpEnum        = require '../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum'
EntityOpEnum      = require '../../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum'
TaskStateEnum     = require '../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum'
TaskTypeEnum      = require '../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum'
TaskActionsEnum   = require '../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum'

errorHandler = (err) -> throw err

users = [
  {
    'id': 1
    "fullName": "Ogburn, Aaron",
    "sso": 'rhn-support-aogburn'
  #"sso": [
  #  "rhn-support-aogburn",
  #  "support_aogburn"
  #]
    "outOfOffice": false,
    "sbrs": [
      "Webservers",
      "JVM & Diagnostics",
      "JBoss Base AS"
    ],
    "skills": [
      { "resource": { "name": "memory", "skillType": "kcsdw", "level": 2, }},
      { "resource": { "name": "nsapi_redirector", "skillType": "kcsdw", "level": 1, }},
      { "resource": { "name": "ipa", "skillType": "kcsdw", "level": 1, }},
      { "resource": { "name": "scsi_disk", "skillType": "kcsdw", "level": 0, }},
      { "resource": { "name": "mdraid", "skillType": "kcsdw", "level": 2, }},
      { "resource": { "name": "httpd", "skillType": "kcsdw", "level": 2, }},
    ]
  }
  {
    'id': 2
    "fullName": "Sutherland, Coty",
    "sso": 'rhn-support-csutherl'
    "outOfOffice": false,
    "sbrs": [
      "Webservers",
      "JVM & Diagnostics",
      "JBoss Base AS"
    ],
    "skills": [
      { "resource": { "name": "httpd", "skillType": "kcsdw", "level": 1, }},
      { "resource": { "name": "mod_jk", "skillType": "kcsdw", "level": 1, }},
      { "resource": { "name": "mod_cluster", "skillType": "kcsdw", "level": 2, }},
    ]
  }
]

userTaskCounts =
  1:
    taskCount: 0
  2:
    taskCount: 1

#mocha --require coffee-script/register --compilers coffee:coffee-script/register test/com/redhat/ascension/scoring/scoringTest.coffee
describe "Scoring Logic", ->

  before (done) ->
    MongoOperations.init({mongoDebug: true, testDb: true})
    db = mongoose['connection']
    db.on 'error', logger.error.bind(logger, 'connection error:')
    db.once 'open', () ->
      MongoOperations.defineCollections()
      TaskRules.initFlow()

      MongoOperations.reset().done(->
        done()
      , (err) ->
        logger.error err.stack
      )

  describe "Score a httpd task higher for higher skill user", () ->

    it "Score aogburn higher", (done) ->

      t = TaskUtils.generateMockTask
        'case':
          'status': 'Waiting on Red Hat'
          'internalStatus': 'Unassigned'
        'task':
          'type': TaskTypeEnum.CASE.name
          'taskOp': TaskOpEnum.NOOP.name
          'state': TaskStateEnum.UNASSIGNED.name
          'sbrs': ['Webservers']
          'tags': ['httpd']

      ScoringLogic.determinePotentialOwners({
        task: t
        userTaskCounts: userTaskCounts
        users: users
      })

      logger.debug prettyjson.render t
      aogburn = _.find t.potentialOwners, (p) -> p.id is 1
      coty = _.find t.potentialOwners, (p) -> p.id is 2
      aogburn.score.should.be.above coty.score

      done()

    it "Score coty equal to aogburn due to tasks owned", (done) ->

      t = TaskUtils.generateMockTask
        'case':
          'status': 'Waiting on Red Hat'
          'internalStatus': 'Unassigned'
        'task':
          'type': TaskTypeEnum.CASE.name
          'taskOp': TaskOpEnum.NOOP.name
          'state': TaskStateEnum.UNASSIGNED.name
          'sbrs': ['Webservers']
          'tags': ['mod_cluster']

      ScoringLogic.determinePotentialOwners({
        task: t
        userTaskCounts: userTaskCounts
        users: users
      })

      logger.debug prettyjson.render t
      aogburn = _.find t.potentialOwners, (p) -> p.id is 1
      coty = _.find t.potentialOwners, (p) -> p.id is 2
      coty.score.should.equal aogburn.score

      done()

    # TODO -- never finished this, it errors out right I believe on the getTaskCounts but now that I am using the test
    # db it may not anymore, I switched gears at this point
    it "rmanes should show up in a Kernel case", (done) ->
      @timeout(5000)

      CaseRules.fetchCase({caseNumber: '01167752'})
      .then((c) ->
        t = TaskRules.makeTaskFromCase(c)

        sbrs = t['sbrs']
        uqlParts = []
        _.each sbrs, (sbr) -> uqlParts.push "(sbrName is \"#{sbr}\")"
        uql = uqlParts.join(' OR ')

        [t, UserLogic.fetchUsersUql({where: uql})]
      ).spread((task, users) ->
        ssos = _.chain(users).pluck('sso').value()

        # rmanes is in Kernel, Networking
        expect(ssos).to.contain('rhn-support-rmanes')

        userIds = _.chain(users).pluck('id').unique().value()
        logger.debug "Discovered #{userIds} userIds"

        [task, users, TaskCounts.getTaskCounts(userIds)]

      )
      .spread((task, users, userTaskCounts) ->

        ScoringLogic.determinePotentialOwners({
          task: task
          userTaskCounts: {'005A0000002a7XZIAY': 0}
          users: users
        })

        potentialOwnersSsos = _.chain(task.potentialOwners).pluck('sso').value()
        logger.debug "Potential Owners: #{potentialOwnersSsos}"
        potentialOwnersSsos.should.contain('rhn-support-rmanes')
        done()
      ).done()
