React             = require 'react'
AjaxMixin         = require '../../mixins/ajaxMixin.coffee'
TaskState         = require './taskState.coffee'
TaskHeader        = require './taskHeader.coffee'
TaskAction        = require './taskAction.coffee'
TaskMetaData        = require './taskAction.coffee'

User              = require '../user/user.coffee'
Auth              = require '../../auth/auth.coffee'

TaskActionsEnum   = require '../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee'

{div, a, img, h1, ul, li, i, span} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'Task'
  mixins: [AjaxMixin]

  getInitialState: ->
    'task': undefined

  takeOwnership: (event) ->
    event.preventDefault()
    console.log "#{Auth.get()['resource']['firstName']} is Taking ownership of #{@state.task._id}"

    queryParams = [
      {name: 'action', value: TaskActionsEnum.ASSIGN.name},
      {name: 'userInput', value: Auth.authedUser['externalModelId']}
    ]

    # Make a post call to assign the current authenticated user to the task
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=>
      @get({path: "/task/#{@props.params._id}"})
    )
    # The returned task will be the latest, update the state
    .then((task) =>
      @setState {'task': task}
    )
    .catch((err) ->
      console.error "Could not load task: #{err.stack}"
    )
    .done()

  removeOwnership: (event) ->
    event.preventDefault()
    console.log "#{Auth.get()['resource']['firstName']} is removing ownership from #{@state.task._id}"

    queryParams = [
      {name: 'action', value: TaskActionsEnum.UNASSIGN.name},
    ]

    # Make a post call to remove the current owner
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=>
      @get({path: "/task/#{@props.params._id}"})
    )
    # The returned task will be the latest, update the state
    .then((task) =>
      @setState {'task': task}
    )
    .catch((err) ->
      console.error "Could not load task: #{err.stack}"
    )
    .done()

  # span + font-size: 1em for all of the meta data components
  render: ->
    if not @state['task']?
      return null

    (div {key: 'task'}, [
      (TaskHeader
        task: @state.task
        key: 'taskHeader'
      , [])
      (span {key: 'taskMetaData'}, [
        (TaskState
          task: @state.task
          takeOwnership: @takeOwnership
          removeOwnership: @removeOwnership
          key: 'taskStatus'
        , [])
        nbsp
        nbsp
        (TaskAction
          task: @state.task
          key: 'taskAction'
        , [])
        nbsp
        nbsp
        (User
          user: @state.task.owner
          key: 'taskUser'
        , [])
        nbsp
        nbsp
        (TaskMetaData
          task: @state.task
          key: 'taskMetaData'
        , [])
      ])
    ])

  componentWillMount: ->
    @get({path: "/task/#{@props.params._id}"})
    .then((task) =>
      @setState {'task': task}
    )
    .catch((err) ->
      console.error "Could not load tasks: #{err.stack}"
    ).done()

module.exports = Component
