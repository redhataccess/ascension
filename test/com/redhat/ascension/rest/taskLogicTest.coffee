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
TaskUtils         = require '../../../../../src/com/redhat/ascension/utils/taskUtils'
TaskRules         = require '../../../../../src/com/redhat/ascension/rules/taskRules'
TaskOpEnum        = require '../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum'
EntityOpEnum      = require '../../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum'
TaskStateEnum     = require '../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum'
TaskTypeEnum      = require '../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum'
TaskActionsEnum   = require '../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee'

# REST modules
TaskLogic      = require '../../../../../src/com/redhat/ascension/rest/taskLogic.coffee'

errorHandler = (err) -> throw err

describe "Task Logic", ->

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

  describe "POST Ops", () ->

    beforeEach (done) ->
      MongoOperations.reset().done(->
        TaskRules.initSession(true)
        done()
      , (err) ->
        logger.error err.stack
      )

    afterEach () ->
      TaskRules.session.dispose()


    it "Successfully assign an owner to a Task", (done) ->

      x = TaskUtils.generateMockTask
        'case':
          'status': 'Waiting on Red Hat'
          'internalStatus': 'Unassigned'
        'task':
          'type': TaskTypeEnum.CASE.name
          'taskOp': TaskOpEnum.NOOP.name
          'state': TaskStateEnum.UNASSIGNED.name

      Task = TaskRules.flow.getDefined("Task")
      t = new Task(x)

      TaskRules.session.assert t
      Q(TaskRules.session.match())
      .then(->
        t.taskOp.should.equal TaskOpEnum.OWN_TASK.name
        t.entityOp.should.equal EntityOpEnum.OWN.name
        TaskLogic.fetchTasks({})
      ).then((tasks) ->
        t = tasks[0]
        TaskLogic.updateTask({_id: t['_id'], action: TaskActionsEnum.ASSIGN, userInput: 'rhn-support-smendenh'})
      ).then(->
        TaskLogic.fetchTasks({})
      ).then((tasks) ->
        t = tasks[0]
        t.owner['id'].should.equal '005A0000001qpArIAI'
        t.owner['kerberos'].should.equal 'smendenh'
      )
      .catch((err) ->
        throw err
      ).done(() ->
        done()
      )
