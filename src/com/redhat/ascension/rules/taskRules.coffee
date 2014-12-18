nools = require 'nools'
logger = require('tracer').colorConsole()
prettyjson = require 'prettyjson'
salesforce = require '../db/salesforce'
Q = require 'q'
#DbOperations    = require '../db/dbOperations'
MongoOperations = require '../db/MongoOperations'
TaskStateEnum = require './enums/TaskStateEnum'
TaskTypeEnum = require './enums/TaskTypeEnum'
TaskOpEnum = require './enums/TaskOpEnum'
EntityOpEnum = require './enums/ResourceOpEnum'
_ = require 'lodash'
moment = require 'moment'
mongoose = require 'mongoose'
mongooseQ = require('mongoose-q')(mongoose)
#MongoClient   = require('mongodb').MongoClient
#Server        = require('mongodb').Server


# TODO remove -- This is deprecated, leaving it a bit for reference
TaskRules = {}


#OwnerId != '{spam_queue_id}'
#AND SBR_Group__c includes ({sbr_groups})

# Spam id = 00GA0000000XxxNMAS
#AND SBR_Group__c includes ('Kernel')
TaskRules.soql = """
SELECT
  AccountId,
  Account_Number__c,
  CaseNumber,
  Collaboration_Score__c,
  Comment_Count__c,
  CreatedDate,
  Created_By__c,
  FTS_Role__c,
  FTS__c,
  Last_Breach__c,
  PrivateCommentCount__c,
  PublicCommentCount__c,
  SBT__c,
  SBR_Group__c,
  Severity__c,
  Status,
  Internal_Status__c,
  Strategic__c,
  Tags__c
FROM
  Case
WHERE
  OwnerId != '00GA0000000XxxNMAS'
  #andStatusCondition#
  LIMIT 100
"""
#Status = 'Waiting on Red Hat'
#Status != 'Closed'

#define Case {
#  AccountId : null,
#  Account_Number__c : null,
#  CaseNumber : null,
#  Collaboration_Score__c : null,
#  Comment_Count__c : null,
#  CreatedDate : null,
#  Created_By__c : null,
#  FTS_Role__c : null,
#  FTS__c : null,
#  Last_Breach__c : null,
#  PrivateCommentCount__c : null,
#  PublicCommentCount__c : null,
#  SBT__c : null,
#  Severity__c : null,
#  Status : null,
#  Internal_status__c : null,
#  Strategic__c : null,
#  SBR_Group__c : null,
#  Tags__c : null
#}
TaskRules.noolsDefs = """
// The ExistingTask represents a minimal fetch of all existing tasks, this allows rules such as 'If no prior NNO task,
// create one'
//define ExistingTask {
//  bid: null,
//  taskOp: null,
//  resourceOp: null,
//  owner: null
//}

define Task {
  _id: null,
  bid: null,
  type: null,
  score: 0,
  locked: false,
  timeout: -1,
  sbrs: [],
  tags: [],
  owner: null,
  closed: null,
  type: null,
  taskOp: null,
  resourceOp: null,
  state: 'new',
  'case': {
    AccountId : null,
    Account_Number__c : null,
    CaseNumber : null,
    Collaboration_Score__c : null,
    Comment_Count__c : null,
    CreatedDate : null,
    Created_By__c : null,
    FTS_Role__c : null,
    FTS__c : null,
    Last_Breach__c : null,
    PrivateCommentCount__c : null,
    PublicCommentCount__c : null,
    SBT__c : null,
    Severity__c : null,
    Status : null,
    Internal_status__c : null,
    Strategic__c : null,
    SBR_Group__c : null,
    Tags__c : null
  },
  owner: {
    "fullName" : null,
    "email" : null,
    "sso" : null,
    "gss" : null,
    "superRegion" : null,
    "timezone" : null,
    "firstName" : null,
    "lastName" : null,
    "aliasName" : null,
    "kerberos" : null,
    "salesforce" : null,
    "isManager" : null,
    "active" : null,
    "created" : null,
    "lastLogin" : null,
    "lastModified" : null,
    "outOfOffice" : null,
    "id" : null
  }
}
"""
# INFO -- do not use prettyjson.render inside of the nools, it silently gives issues
TaskRules.nools = """

// This is the most basic of all rules, it says if there is no real task associated with an Unassigned case, create
// One and set the appropriate states -- In this one situation there is no question there is a single resulting task
// Thus we can retract that task once created.
rule "noop task/unassigned case" {
  when {
    t : Task t.taskOp == TaskOpEnum.NOOP.name && t.case.Internal_Status__c == 'Unassigned';
    // Make sure there is no prior existing task created already
    not(et: Task et.taskOp != TaskOpEnum.NOOP.name && et.bid == t.bid && et.case.Internal_Status__c == 'Unassigned');
  }
  then {
    logger.warn('Found unmanaged task: ' + t.bid + ', setting the task to NNO.');
    modify(t, function() {
      this.taskOp = TaskOpEnum.OWN_TASK.name;
      this.resourceOp = EntityOpEnum.OWN.name;
    });
    //logger.warn('Sending task to be saved: ' + t.bid);
    retract(t);
    return saveRuleTask(t);
  }
}

// New Waiting on Collab case without any prior associated Task
rule "noop task/collab case" {
  when {
    t : Task t.taskOp == TaskOpEnum.NOOP.name && t.case.Internal_Status__c == 'Waiting on Collaboration';
    // Make sure there is no prior task created for this Waiting on Collaboration task
    not(et: Task et.taskOp != TaskOpEnum.NOOP.name && et.bid == t.bid && et.resourceOp == EntityOpEnum.COLLAB.name);
  }
  then {
    modify(t, function(){
      this.taskOp = TaskOpEnum.OWN_TASK.name;
      this.resourceOp = EntityOpEnum.COLLAB.name;
    });
    retract(t);
    return saveRuleTask(t);
  }
}
// New Waiting on Collab case with an associated Task
rule "noop task/collab case w/exiting task" {
  when {
    t : Task t.taskOp == TaskOpEnum.NOOP.name && t.case.Internal_Status__c == 'Waiting on Collaboration';
    // If there is an existing task that matches this noop task, retract both
    et: Task et.taskOp != TaskOpEnum.NOOP.name && et.bid == t.bid && et.resourceOp == EntityOpEnum.COLLAB.name;
  }
  then {
    retract(t);
    retract(et);
  }
}
rule "noop task/default" {
  when {
    t : Task t.taskOp == TaskOpEnum.NOOP.name;
    // Make sure there is no prior existing task created already
    not(et: Task et.taskOp != TaskOpEnum.NOOP.name && et.bid == t.bid);
  }
  then {
    //logger.warn('DEFAULT: Found unmanaged task: ' + t.bid + ', setting the task to NNO.');
    //modify(t, function(){
    //  this.taskOp = TaskOpEnum.OWN_TASK.name;
    //  this.resourceOp = EntityOpEnum.OWN.name;
    //});
    retract(t);
    return saveRuleTask(t);
  }
}

""";


#TaskRules.saveRuleTaskCb = (t, cb) ->
#  logger.debug "saveRuleTask: Creating task [cb]: " + t.bid
#  model = new MongoOperations['models']['task'] t
#  model.save (err) ->
#    if err then cb(err) else cb(null)

TaskRules.generateSaveTasksPromises = (tasks) ->
  promises = []
  # Potentially consider https://groups.google.com/forum/#!topic/mongoose-orm/IkPmvcd0kds if this ever proves to be
  # too slow.  For 10-20k inserts, probably won't be too slow.  Anything more, might want to bulk insert
  _.each tasks, (t) ->
    #logger.debug "Made task: #{prettyjson.render t}"
    promises.push new MongoOperations['models']['task'](t).saveQ()

  promises

# This is for task discovery, to insert a minimal look at all existing tasks for the rules
TaskRules.getExistingTasks = () ->
  MongoOperations['models']['task']
  .find()
  .where('state').ne(TaskStateEnum.CLOSED)
  #.select('bid taskOp resourceOp owner')
  .execQ()

# Make Mongoose Schema Tasks out of regular js objects
TaskRules.getTasks = (tasks) ->
  _.map tasks, (t) ->
    new MongoOperations['models']['task'](t)

TaskRules.saveTasks = (tasks) ->
  deferred = Q.defer()
  Q.all(@generateSaveTasksPromises(tasks))
  .then(->
    deferred.resolve()
  , (err) ->
    deferred.reject(err)
  )
  deferred.promise


#TaskRules.makeTaskFromRule = (t) ->
#  _id: t['_id']
#  bid: t['bid']
#  score: t['score']
#  timeout: t['score']
#  sbrs: t['score']
#  tags: t['score']
#  owner: t['score']
#  completed: t['score']
#  type: t['score']
#  taskOp: t['score']
#  resourceOp: t['score']
#  state: t['score']
#  'case': t['case']


# A simple update to Mongo with the case meta data.  The input is the noop task which will have the very latest
# case data always
# TODO -- the decision here to make is should I always update all existing tasks prior to assert?  I would think so
# This would simplify things and make the rules less error prone
TaskRules.updateTasksWithCaseMetadata = (t) ->
  MongoOperations['models']['task'].where()
  .setOptions({multi: true})
  .update({'bid': c['CaseNumber']}, @taskFromCaseUpdateHash(t, t['case']))
  .exec()

TaskRules.divineTasks = (cases) ->
  deferred = Q.defer()

  # Remove these attributes from SF and do other transforms
  _.each cases, (c) ->
    delete c['attributes']
    c['SBR_Group__c'] = TaskRules.parseSfArray(c['SBR_Group__c'])
    c['Tags__c'] = TaskRules.parseSfArray(c['Tags__c'])

  # Output hash will contain the case and task
  #outputHash = _.object(_.map(cases, (x) -> [x['CaseNumber'], {'case': x, 'task': undefined}]))
  outputHash = _.object(_.map(cases, (x) ->
    [x['CaseNumber'], {'case': x, 'task': undefined}]))

  # grab a list of existing tasks in the db based on the fetched case numbers
  caseNumbers = _.chain(cases).pluck('CaseNumber').value()
  MongoOperations['models']['task']
  .find()
  .where('bid')
  .in(caseNumbers)
  #.select('bid')
  .execQ()
  .done((tasks) ->

    # TODO -- Ultimately here I want to convert anything seen to NOOP tasks, this will be much simpler to handle, then
    # just re-assert all existing un-closed tasks to the rules every time, This will give the ultimate flexibility I believe

    # These represent existing tasks
    existingCaseNumbers = _.chain(tasks).pluck('bid').unique().value()

    # Find all new cases that are not tasks by rejecting all the cases that overlap with existing tasks
    newCases = _.chain(cases).reject((c) ->
      _.contains(existingCaseNumbers, c['CaseNumber'])).value()

    # Make new tasks
    newTasks = _.map(newCases, (c) ->
      TaskRules.makeTaskFromCase(c))
    logger.debug "Discovered #{newTasks.length} new tasks"

    # Existing tasks
    existingTasks = _.chain(tasks).filter((t) ->
      _.contains(existingCaseNumbers, t['bid'])).value()
    logger.debug "Discovered #{existingTasks.length} existing tasks"

    # Update existing Tasks, the updates are only to case meta data at this point, nothing else
    taskPromises = []
    _.each existingTasks, (t) ->
      c = outputHash[t['bid']]['case']
      updateHash = TaskRules.taskFromCaseUpdateHash(t, c)
      # Update the in-memory task
      _.assign t, updateHash

      # TODO -- should also specify task state != closed/completed/abandoned
      #      taskPromises.push MongoOperations['models']['task'].where().setOptions({multi: true}).update({'bid': c['CaseNumber']}, updateHash).exec()
      # TODO -- make this change and haven't retested the rules yet
      taskPromises.push TaskRules.updateTaskFromCase(t, c)

    noopTasks = TaskRules.getTasks newTasks
    #deferred.resolve noopTasks

    # The below logic is for saving those new tasks, not sure this is really what we want -- let's just flatten out
    # the existing tasks for now

    # The taskPromises will be comprised of all task updates and task inserts
    #    taskPromises = _.chain([taskPromises, TaskRules.generateSaveTasksPromises(newTasks)]).flatten().value()
    taskPromises = _.chain(taskPromises).value()

    # In the chain the noopTasks are undefined, gotta figure out what's up
    Q.allSettled(taskPromises)
    .then(->
      d = Q.defer()
      logger.debug "Completed all task promises, re-fetching the tasks from mongo"
      # Now re-fetch all the tasks from Mongo so we know we absolutely have the latest consistent versions
      # TODO -- Attempt to promisify this again
      MongoOperations['models']['task']
      .where('bid')
      .in(existingCaseNumbers)
      .exec (err, results) ->
        logger.debug "re-fetched #{results.length} results"
        if err? then d.reject err else d.resolve results

      d.promise
    )
    .then((results) ->
      output = _.chain([results, noopTasks]).flatten().value()
      logger.debug "Resolving the main deferred with a total of #{results.length} existing tasks, and #{noopTasks.length} noop tasks"
      deferred.resolve output
    )
    .fail((err) ->
      logger.error err.stack)
    .done()

  , (err) ->
    deferred.reject err
  )
  deferred.promise


TaskRules.initFlow = () ->
  @beginFire = 0
  @endFire = 0

  @flow = nools.compile @noolsDefs + @nools,
    name: 'helloFlow'
    scope:
      logger: logger
      TaskOpEnum: TaskOpEnum
      EntityOpEnum: EntityOpEnum
      saveRuleTask: TaskRules.saveRuleTask
      saveRuleTaskCb: TaskRules.saveRuleTaskCb
    #updateTasksWithCaseMetadata: TaskRules.updateTasksWithCaseMetadata
      prettyjson: prettyjson

  @assertCalls = 0
  @fireCalls = 0

TaskRules.printSimple = (op, fact) ->
  logger.debug "#{op}: " + prettyjson.render
    bid: fact['bid']
    taskOp: fact['taskOp']
    resourceOp: fact['resourceOp']

TaskRules.initSession = (debug = false) ->
  @session = @flow.getSession()
  @session.on "assert", (fact) ->
    TaskRules.assertCalls += 1
    if debug is true then TaskRules.printSimple('assert', fact)
  @session.on "retract", (fact) ->
    if debug is true then TaskRules.printSimple('retract', fact)
  @session.on "modify", (fact) ->
    if debug is true then TaskRules.printSimple('modify', fact)
  @session.on "fire", (name, rule) ->
    if debug is true then logger.debug "fired: #{name}"
    TaskRules.fireCalls += 1


TaskRules.executeTest = () ->

  #Case = flow.getDefined("Case")
  Task = @flow.getDefined("Task")

  # TODO -- I do need to fetch != 'Closed' as well, for now though, testing with WoRH is sufficient
  #soql = soql.replace /#andStatusCondition#/, " AND Status != 'Closed'"
  soql = @soql.replace /#andStatusCondition#/, " AND Status = 'Waiting on Red Hat'"
  Q.nfcall(salesforce.querySf, {'soql': soql})
  .then((cases) ->
    TaskRules.divineTasks(cases)
  )
  .then((tasks) ->
    logger.debug "Completed persisting the tasks"

    #_.each obj['cases'], (x) ->
    #  delete x['attributes']
    #  c = new Case(x)
    #  session.assert c

    _.each tasks, (x) ->
      t = new Task(x)
      TaskRules.session.assert t

      beginFire = +moment()
      TaskRules.session.match().then(() ->
        logger.info "Done, assert calls: #{TaskRules.assertCalls}, fire calls: #{TaskRules.fireCalls}"
        endFire = +moment()
        dur = ((endFire - beginFire) / 1000).toFixed(0)
        logger.info "Completed firing rules in #{dur}s"
        TaskRules.session.dispose()
        process.exit(0)
      , (err) ->
        logger.error err.stack
      )
  )
  .done()

module.exports = TaskRules

if require.main is module
  MongoOperations.init({mongoDebug: true})
  db = mongoose['connection']
  db.on 'error', logger.error.bind(logger, 'connection error:')
  db.once 'open', () ->
    MongoOperations.defineCollections()
    TaskRules.initFlow()
    TaskRules.initSession(false)

    MongoOperations.reset().done(->
      TaskRules.executeTest()
    , (err) ->
      logger.error err.stack
    )
#TaskRules.executeTest()
