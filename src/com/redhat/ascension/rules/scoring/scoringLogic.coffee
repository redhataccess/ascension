nools             = require 'nools'
logger            = require('tracer').colorConsole()
prettyjson        = require 'prettyjson'
salesforce        = require '../../db/salesforce'
settings          = require '../../settings/settings'
Q                 = require 'q'
#DbOperations    = require '../db/dbOperations'
MongoOperations   = require '../../db/MongoOperations'
TaskRules         = require '../taskRules'
TaskStateEnum     = require '../enums/TaskStateEnum'
TaskTypeEnum      = require '../enums/TaskTypeEnum'
TaskOpEnum        = require '../enums/TaskOpEnum'
EntityOpEnum        = require '../enums/EntityOpEnum'
_                 = require 'lodash'
moment            = require 'moment'
mongoose          = require 'mongoose'
mongooseQ         = require('mongoose-q')(mongoose)
request           = require 'request'
d3                = require 'd3'
#MongoClient   = require('mongodb').MongoClient
#Server        = require('mongodb').Server

#http://stackoverflow.com/questions/8760570/how-to-provide-most-relevant-results-with-multiple-factor-weighted-sorting
M = {}

M.determinePotentialOwners = (opts) ->
  #############################
  # Function args
  #############################

  # Need sbrs and associated Users - this could be passed in to avoid a lookup for each individual task
  task = opts.task || new Error('The scoreTask method requires a task parameter')

  users = opts.users || []

  # A hash of user id -> task count mappings
  userTaskCounts = opts['userTaskCounts'] || {}

  #############################

  # Remove the users who are OOO and filter to only the users' who have intersecting sbrs with this particular task
  # There appears to be an issu here
  # TODO -- Just changed this to .length > 0, previously I think it was returning true always, need to verify this now
  availableUsers = _.filter users, (u) ->
    (u['outOfOffice'] is false) and (_.intersection(task.sbrs, u.sbrs).length > 0)

#    potentialOwners:
#      id: String
#      sso: String
#      fullName: String
#      score: Date

  # Weight the potential owners based on the # of currently owned non-closed tasis.
  # Ex. 5 users, one user owns 2 tasks.  That means min 0 max 2.  Weigh 0..1.  So linear scale between 0 and 1 where
  # the owner who owns 2 tasks will

  # Run an aggregate query to get the number of tasks owned/unclosed tasks for each particular user
  # Find the min and max and weight the score from min user tasks to max user tasks from min score to max score
  # or vice versa.  Basically reverse the weights based on current task load.

  #logger.debug "userTasks: #{prettyjson.render userTaskCounts}"
  taskCounts = []
  for userId, obj of userTaskCounts
    #logger.debug "userId: #{userId}: obj: #{obj}"
    taskCounts.push obj['taskCount']

  logger.debug "taskCounts: #{taskCounts}"

  minTaskCount = _.min(taskCounts)
  maxTaskCount = _.max(taskCounts)
#  scale = d3.scale.linear().domain([minTaskCount, maxTaskCount]).range([.25, 1])
  scale = d3.scale.linear().domain([minTaskCount, maxTaskCount]).range([1, .25])


  # Clear out the potential owners based on this run
  task.potentialOwners = []

  _.each availableUsers, (u) ->
    # ex. ['httpd', 'memory']
    userSkillNames = _.chain(u['skills']).pluck('resource').pluck('name').flatten().unique().value()

    # Overlapping SBRs
    sbrsMatched = _.intersection(u.sbrs, task.sbrs).length

    # Normalize the sbrWeight to between n and 1
    sbrWeight = 0
    if task.sbrs.length > 0
      sbrWeight += sbrsMatched / task.sbrs.length

    # Overlapping Tags
    skillsMatched = _.intersection(userSkillNames, task.tags).length

    skillWeight = 0
    if skillsMatched > 0
      _.intersection(userSkillNames, task.tags).forEach (tag) ->
        matchedSkill = _.find(u.skills, (s) -> s.resource.name is tag)
        # Normalize the skill level to between .25 - 1
        skillWeight += ((1 + matchedSkill.resource.level) / 4)

      # Now normalize the tag weight with the # of tags matched so the final result is between n and 1
      skillWeight = skillWeight / (skillsMatched)

    # This weight is a reverse weight, the more tasks you own the lower
    #tasksOwnedWeight = 0
    tasksOwnedWeight = scale(userTaskCounts[u.id].taskCount)

    # Now add the weights together to get the preliminary score
    # Remember that the more tasks owned by a user the smaller that tasksOwnedWeight will be
    score = sbrWeight + skillWeight + tasksOwnedWeight
    task.potentialOwners.push
      id: u.id
      sso: u.sso
      fullName: u.fullName
      score: score
      sbrWeight: sbrWeight
      skillWeight: skillWeight
      tasksOwned: userTaskCounts[u.id].taskCount
      tasksOwnedWeight: tasksOwnedWeight

  #logger.debug "min: #{minTaskCount}, max: #{maxTaskCount}, scale: #{scale(1)}"

  task

module.exports = M

if require.main is module
  Mocha = require 'mocha'
  path  = require('path')
  fs    = require('fs')

  mocha = new Mocha
    reporter: 'dot',
    ui: 'bdd',
    timeout: 999999

  f = "#{__dirname}/../../../../../../test/com/redhat/ascension/scoring/scoringTest.js"
  mocha.addFile f

  runner = mocha.run () ->
    console.log "finished"

  runner.on 'pass', (test) ->
    console.log "... #{test.title} passed"

  runner.on 'fail', (test) ->
    console.log "... #{test.title} failed"
