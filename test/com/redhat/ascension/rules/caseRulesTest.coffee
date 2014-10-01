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

errorHandler = (err) -> throw err

describe "Case rules", ->

  before (done) ->
    MongoOperations.init(true)
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

  describe "Case w/o Task rules", () ->

    beforeEach (done) ->
      MongoOperations.reset().done(->
        TaskRules.initSession(true)
        done()
      , (err) ->
        logger.error err.stack
      )

    afterEach () ->
      TaskRules.session.dispose()


    it "Unassigned case should result in new Task", (done) ->

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
      TaskRules.session.match().then(() ->
        t.taskOp.should.equal TaskOpEnum.OWN_TASK.name
        t.entityOp.should.equal EntityOpEnum.OWN.name
        done()
      , (err) ->
        throw err
        logger.error err.stack
      )

    it "Waiting on Collab Case w/o associated Task", (done) ->

      x = TaskUtils.generateMockTask
        'case':
          'status': 'Waiting on Red Hat'
          'internalStatus': 'Waiting on Collaboration'
        'task':
          'type': TaskTypeEnum.CASE.name
          'taskOp': TaskOpEnum.NOOP.name
          'state': TaskStateEnum.UNASSIGNED.name

      Task = TaskRules.flow.getDefined("Task")
      t = new Task(x)

      TaskRules.session.assert t
      TaskRules.session.match().then(() ->
        t.taskOp.should.equal TaskOpEnum.OWN_TASK.name
        t.entityOp.should.equal EntityOpEnum.COLLABORATE.name
        done()
      , (err) ->
        logger.error err.stack
      )

    it "Waiting on Collab Case w/associated Task", (done) ->

      Task = TaskRules.flow.getDefined("Task")

      x = TaskUtils.generateMockTask
        'case':
          'status': 'Waiting on Red Hat'
          'internalStatus': 'Waiting on Collaboration'
          'collaborationScore': 99
        'task':
          'type': TaskTypeEnum.CASE.name
          'taskOp': TaskOpEnum.NOOP.name
          'state': TaskStateEnum.UNASSIGNED.name
      t = new Task(x)

      # Fire the task the first time and ensure the correct data is set
      firstFire = Q.defer()
      TaskRules.session.assert t
      TaskRules.session.match().then(() ->
        t.taskOp.should.equal TaskOpEnum.OWN_TASK.name
        t.entityOp.should.equal EntityOpEnum.COLLABORATE.name
        t.score.should.equal 99
        TaskRules.session.dispose()
        firstFire.resolve()
      , errorHandler)

      # Assert and fire the task again
      fetchExisting = Q.defer()
      firstFire.promise.done(->
        # Fetch all existing tasks, insert those and re-insert the original task, nothing should change.
        existingTasksPromise = TaskRules.getExistingTasks()
        existingTasksPromise.done((existingTasks) ->
          existingTasks.length.should.equal 1
          existingTasks[0]['entityOp'].should.equal EntityOpEnum.COLLABORATE.name
          fetchExisting.resolve existingTasks
        , errorHandler)
      , errorHandler)

      # Create the same/duplicate task but with an increased score, let's verify that the score is updated in the database
      x1 = TaskUtils.generateMockTask
        'case':
          'status': 'Waiting on Red Hat'
          'internalStatus': 'Waiting on Collaboration'
          'collaborationScore': 100
        'task':
          'type': TaskTypeEnum.CASE.name
          'taskOp': TaskOpEnum.NOOP.name
          'state': TaskStateEnum.UNASSIGNED.name
      t1 = new Task(x1)

      fetchExisting.promise.done((existingTasks) ->
        TaskRules.session.dispose()
        TaskRules.initSession(true)

        _.each existingTasks, (e) ->
          et = new Task e
          TaskRules.session.assert et

        # This situation will simulate when the case sync runs resulting in a new noop task but the tasks exists, however
        # the collab score is one point higher, the result should be the score is updated
        TaskRules.session.assert t1
        TaskRules.session.match().then(() ->
          logger.info "Done, assert calls: #{TaskRules.assertCalls}, fire calls: #{TaskRules.fireCalls}"

          # The taskOp should stay the same since no modification happens the fact is simply retracted
          t1.taskOp.should.equal TaskOpEnum.NOOP.name
          t1.entityOp.should.equal TaskOpEnum.NOOP.name

          # And still only 1 existing task
          existingTasksPromise = TaskRules.getExistingTasks()
          existingTasksPromise.done((existingTasks) ->
            existingTasks.length.should.equal 1
            existingTasks[0]['entityOp'].should.equal EntityOpEnum.COLLABORATE.name
            done()
          , errorHandler)
        , errorHandler)
      , errorHandler)
