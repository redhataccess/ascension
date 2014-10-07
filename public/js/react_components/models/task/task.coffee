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

TaskActionsEnum   = require '../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee'
TaskTypeEnum      = require '../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'

# Bootstrap components
Well            = require 'react-bootstrap/Well'

{div, a, img, h1, ul, li, i, span, h3, hr} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'Task'
  mixins: [AjaxMixin, ActiveState]

  getInitialState: ->
    'task': undefined

  takeOwnership: (event) ->
    event.preventDefault()
    event.stopPropagation()
    console.log "#{Auth.get()['resource']['firstName']} is Taking ownership of #{@state.task._id}"

    queryParams = [
      {name: 'action', value: TaskActionsEnum.ASSIGN.name},
      #{name: 'userInput', value: Auth.authedUser['externalModelId']}
      {name: 'userInput', value: Auth.get()['externalModelId']}
    ]

    # Make a post call to assign the current authenticated user to the task
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=> @get({path: "/task/#{@props.params._id}"}))
    # The returned task will be the latest, update the state
    .then((task) => @setState({'task': task}) )
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  removeOwnership: (event) ->
    event.preventDefault()
    console.log "#{Auth.get()['resource']['firstName']} is removing ownership from #{@state.task._id}"
    queryParams = [ {name: 'action', value: TaskActionsEnum.UNASSIGN.name} ]

    # Make a post call to remove the current owner
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=> @get({path: "/task/#{@props.params._id}"}))
    # The returned task will be the latest, update the state
    .then((task) => @setState({'task': task}))
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  close: (event) ->
    event.preventDefault()
    console.log "#{Auth.get()['resource']['firstName']} is closing #{@state.task._id}"
    queryParams = [ {name: 'action', value: TaskActionsEnum.CLOSE.name} ]

    # Make a post call to remove the current owner
    @post({path: "/task/#{@props.params._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=> @get({path: "/task/#{@props.params._id}"}))
    # The returned task will be the latest, update the state
    .then((task) => @setState({'task': task}))
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  # Generates the contents based on the task type, like case or kcs or user defined
  genEntityContents: () ->
    if @state.task.type is TaskTypeEnum.CASE.name
      return (Case {key: 'taskCase', caseNumber: @state.task.bid}, [])

    null


#  componentWillMount: ->
#    @get({path: "/task/#{@props.params._id}"})
#    .then((task) =>
#      @setState {'task': task}
#
#      # If this is a case, return a promise to fetch the case
#      if task.type is TaskTypeEnum.CASE.name
#        return @get({path: "/case/#{task.bid}"})
#    )
#    .then((c) =>
#      console.debug "Discovered case: #{c['resource']['caseNumber']}"
#      @setState
#        'case': c
#        'kcs': undefined
#    )
#    .catch((err) ->
#      console.error "Could not load tasks: #{err.stack}"
#    ).done()

  queryTask: (props) ->
    @get({path: "/task/#{props.params._id}"})
    .then((task) =>
      @setState {'task': task}
    )
    .catch((err) ->
      console.error "Could not load tasks: #{err.stack}"
    ).done()

  componentWillReceiveProps: (nextProps) ->
    console.debug "Task:componentWillReceiveProps"
    if (@props.params._id isnt nextProps.params._id) and nextProps.params._id?
      @queryTask(nextProps)

  componentDidMount: ->
    console.debug "Task:componentDidMount"
    if @props.params?._id is 'tasks' or (@props.params?._id is undefined)
      console.warn '/task/tasks received, not fetching task.'
      return
    @queryTask(@props)


  # span + font-size: 1em for all of the meta data components
  render: ->
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
              takeOwnership: @takeOwnership
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
          (Spacer {}, [])
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
