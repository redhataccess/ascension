React             = require 'react'
Router            = require 'react-router/dist/react-router'
ActiveState       = Router.ActiveState
AjaxMixin         = require '../../mixins/ajaxMixin.coffee'
TaskState         = require './taskState.coffee'
TaskHeader        = require './taskHeader.coffee'
TaskAction        = require './taskAction.coffee'
TaskMetaData      = require './taskMetaData.coffee'
TaskDates         = require './taskDates.coffee'
Spacer            = require '../../utils/spacer.coffee'

Case              = require '../case/case.coffee'
User              = require '../user/user.coffee'
Auth              = require '../../auth/auth.coffee'
DeclinedUsers     = require './declinedUsers.coffee'
PotentialOwners   = require './potentialOwners.coffee'

TaskActionsEnum   = require '../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee'
TaskTypeEnum      = require '../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'

# Bootstrap components
Well            = require 'react-bootstrap/Well'
Alert           = require 'react-bootstrap/Alert'

{div, strong, a, img, h1, ul, li, i, span, h3, hr} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'Task'
  mixins: [AjaxMixin, ActiveState]

  getInitialState: ->
    'task': undefined

  assignOwnership: (user, event) ->
    event.preventDefault()
    event.stopPropagation()
    console.log "#{user['resource']['firstName']} is Taking ownership of #{@state.task._id}"

    queryParams = [
      {name: 'action', value: TaskActionsEnum.ASSIGN.name},
      {name: 'userInput', value: user['externalModelId']}
    ]

    # Make a post call to assign the current authenticated user to the task
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=> @get({path: "/task/#{@props.params._id}"}))
    # The returned task will be the latest, update the state
    .then((task) =>
      @setState({'task': task})
      @props.queryTasks.call(null)
    )
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  # When declining ownership user is added to the declineOwners field and subsequent tasks pulls will exclude tasks
  # that this owner has declined
  declineOwnership: (user, event) ->
    event.preventDefault()
    event.stopPropagation()
    console.log "#{user['resource']['firstName']} is declining ownership of #{@state.task._id}"

    queryParams = [
      {name: 'action', value: TaskActionsEnum.DECLINE.name},
      {name: 'userInput', value: user['externalModelId']}
    ]

    # Make a post call to assign the current authenticated user to the task
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=> @get({path: "/task/#{@props.params._id}"}))
    # The returned task will be the latest, update the state
    .then((task) =>
      @setState({'task': task})
      @props.queryTasks.call(null)
    )
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  removeOwnership: (event) ->
    event.preventDefault()
    console.log "#{Auth.getAuthedUser()['resource']['firstName']} is removing ownership from #{@state.task._id}"
    queryParams = [ {name: 'action', value: TaskActionsEnum.UNASSIGN.name} ]

    # Make a post call to remove the current owner
    # Re-fetch the task after it has been assigned the user
    # The returned task will be the latest, update the state
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    .then(=> @get({path: "/task/#{@props.params._id}"}))
    .then((task) =>
      @setState({'task': task})
      @props.queryTasks.call(null)
    )
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  close: (event) ->
    event.preventDefault()
    console.log "#{Auth.getAuthedUser()['resource']['firstName']} is closing #{@state.task._id}"
    queryParams = [ {name: 'action', value: TaskActionsEnum.CLOSE.name} ]

    # Make a post call to remove the current owner
    # Re-fetch the task after it has been assigned the user
    # The returned task will be the latest, update the state
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    .then(=> @get({path: "/task/#{@props.params._id}"}))
    .then((task) =>
      @setState({'task': task})
      @props.queryTasks.call(null)
    )
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  # Generates the contents based on the task type, like case or kcs or user defined
  genEntityContents: () ->
    if @state.task.type is TaskTypeEnum.CASE.name
      return (Case {key: 'taskCase', caseNumber: @state.task.bid}, [])
    null

  queryTask: (props) ->
    @get({path: "/task/#{props.params._id}"})
    .then((task) =>
      @setState {'task': task}
    )
    .catch((err) ->
      console.error "Could not load tasks: #{err.stack}"
    ).done()

  componentWillReceiveProps: (nextProps) ->
    if (@props.params._id isnt nextProps.params._id) and nextProps.params._id?
      @queryTask(nextProps)

  componentDidMount: ->
    if @props.params?._id is 'tasks' or (@props.params?._id is undefined)
      console.warn '/task/tasks received, not fetching task.'
      return
    @queryTask(@props)


  # span + font-size: 1em for all of the meta data components
  render: ->
    if @state.task is ''
      return (Alert {bsStyle: "danger", key: 'alert'}, [
        "Error fetching task with id: #{@props.params?._id}"
      ])
    if not @state['task']?
      return null

    (div {key: 'mainContainer'}, [
      (div {key: 'taskContainer', className: 'row'}, [

        ############################################################
        # Top left
        ############################################################
        (div {className: 'col-md-6', key: 'taskContainerLeft'}, [
          (TaskHeader {task: @state.task, key: 'taskHeader'}, [])
          (span {key: 'taskMetaDataContainer'}, [
            # Assigned, unassigned, closed, abandoned
            (TaskState
              task: @state.task
              takeOwnership: @assignOwnership.bind(@, Auth.getAuthedUser())
              declineOwnership: @declineOwnership.bind(@, Auth.getAuthedUser())
              assignScopedOwnership: @assignOwnership.bind(@, Auth.getScopedUser())
              declineScopedOwnership: @declineOwnership.bind(@, Auth.getScopedUser())
              removeOwnership: @removeOwnership
              close: @close
              key: 'taskStatus'
            , [])
            nbsp
            nbsp
            # For REST calls, assign, unassign, delete
            (TaskAction {task: @state.task,  key: 'taskAction'}, [])
            nbsp
            nbsp
            (User {user: @state.task.owner, key: 'taskUser'}, [])
            nbsp
            nbsp
            # Entity operation for the case
            (TaskMetaData {task: @state.task, key: 'taskMetaData'}, [])
          ])
          (span {className: 'clearfix'}, [])
          (Spacer {}, [])
          (span {key: 'taskDatesContainer'}, [
            # Assigned, unassigned, closed, abandoned
            (TaskDates
              task: @state.task
              key: 'taskDates'
            , [])
          ])
          (span {className: 'clearfix'}, [])
          (Spacer {}, [])
          (DeclinedUsers {task: @state.task})
          nbsp
          nbsp
          (PotentialOwners {task: @state.task})

        ])
        ############################################################
        # Top Right
        ############################################################
        (div {className: 'col-md-6', key: 'taskContainerRight'}, [
          (Well {key: 'well'}, [
            (h3 {}, ['Case Links'])
            (ul {}, [
              (li {}, [
                (a {target: '_blank', href: "https://unified.gsslab.rdu2.redhat.com/cli#Case/number/#{@state.task.bid}"}, ["https://unified.gsslab.rdu2.redhat.com/cli#Case/number/#{@state.task.bid}"])
              ])
              (li {}, [
                (a {target: '_blank', href: "https://c.na7.visual.force.com/apex/Case_View?sbstr=#{@state.task.bid}"}, ["https://c.na7.visual.force.com/apex/Case_View?sbstr=#{@state.task.bid}"])
              ])
            ])
          ])
        ])
      ])
      ############################################################
      # Entity Contents
      ############################################################
      (hr {}, [])
      (div {key: 'entityContainerRow', className: 'row'}, [
        (div {className: 'col-md-12', key: 'entityContainerContents'}, [
          @genEntityContents()
        ])
      ])
    ])

module.exports = Component
