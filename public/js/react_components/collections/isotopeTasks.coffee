React       = require 'react'
Router      = require 'react-router/dist/react-router'
ActiveState = Router.ActiveState
Isotope     = require 'isotope/js/isotope'
#Isotope     = require 'isotope/dist/isotope.pkgd'
AjaxMixin   = require '../mixins/ajaxMixin.coffee'
cx          = React.addons.classSet
d3          = require 'd3/d3'
_           = require 'lodash'

Task              = require '../models/task/task.coffee'
TaskIconMapping   = require '../utils/taskIconMapping.coffee'
TaskTypeEnum      = require '../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'
TaskActionsEnum   = require '../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee'
TaskStateEnum     = require '../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'
Auth              = require '../auth/auth.coffee'
TaskAction        = require '../models/task/taskAction.coffee'
TaskMetaData      = require '../models/task/taskMetaData.coffee'
TaskState         = require '../models/task/taskState.coffee'
Spacer            = require '../utils/spacer.coffee'

{div, button, img, h1, h2, ul, li, span, br, p, i} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'Tasks'
  mixins: [AjaxMixin, ActiveState]

  # We want the boxes between 100px x 100px and 200px x 200px

  getInitialState: ->
    # For the flag for when an account is loading
    'loading': false
    'tasks': []
    'minScore': 0
    'maxScore': 0
    'layoutMode': @props.layoutMode || 'masonry'
    'sortBy': @props.sortBy || 'score'
    'query': @props.query
    'params': @props.params
    # Set to true to reload items and arrange iso
    'reloadIso': false

  # TODO these CRUD ops should be extracted into a mixin
  # TODO -- on the then, refetch the tasks so they can be re-rendered...that'll be interesting
  takeOwnership: (task, event) ->
    event.preventDefault()
    event.stopPropagation()
    console.log "#{Auth.get()['resource']['firstName']} is Taking ownership of #{task._id}"

    queryParams = [
      {name: 'action', value: TaskActionsEnum.ASSIGN.name},
      #{name: 'userInput', value: Auth.authedUser['externalModelId']}
      {name: 'userInput', value: Auth.get()['externalModelId']}
    ]

    # Make a post call to assign the current authenticated user to the task
    @post({path: "/task/#{task._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=> @get({path: "/task/#{task._id}"}))
    # The returned task will be the latest, update the state
    .then((task) => @queryTasks(@props) )
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  removeOwnership: (task, event) ->
    event.preventDefault()
    console.log "#{Auth.get()['resource']['firstName']} is removing ownership from #{task._id}"
    queryParams = [ {name: 'action', value: TaskActionsEnum.UNASSIGN.name} ]

    # Make a post call to remove the current owner
    @post({path: "/task/#{task._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=> @get({path: "/task/#{task._id}"}))
    # The returned task will be the latest, update the state
    .then((task) => @setState({'task': task}))
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  close: (task, event) ->
    event.preventDefault()
    console.log "#{Auth.get()['resource']['firstName']} is closing #{task._id}"
    queryParams = [ {name: 'action', value: TaskActionsEnum.CLOSE.name} ]

    # Make a post call to remove the current owner
    @post({path: "/task/#{task._id}", queryParams: queryParams})
    # Re-fetch the task after it has been assigned the user
    .then(=> @get({path: "/task/#{task._id}"}))
    # The returned task will be the latest, update the state
    .then((task) => @setState({'task': task}))
    .catch((err) -> console.error "Could not load task: #{err.stack}" )
    .done()

  genTaskClass: (t) ->
#    console.debug "owner.id: #{t['owner']?['id']} authed user id: #{Auth.get()?['resource']?['id']}"
#    console.debug "owner.id is authed id: #{t['owner']?['id'] is Auth.get()?['resource']?['id']}"
    classSet =
      'task': true
      'task100': true
      'task-own': Auth.get()? and (t['owner']?['id'] is Auth.get()?['externalModelId'])
#    This causes the screen to 'blip', it fubars things, don't use it
#      'task-grow': true # http://ianlunn.github.io/Hover/
      'case': t['type'] is 'case'
      'kcs': t['type'] is 'kcs'
    cx(classSet)

  # Sizes the element by the linear score scale based on the task score
  genTaskStyle: (t) ->
    #console.log "Task #{t['bid']} now has opacity score: " + @scoreOpacityScale(t.score)
    theStyle =
      opacity: @scoreOpacityScale(t.score)
      #width: @scoreScale(t.score)
      #height: @scoreScale(t.score)

  taskClick: (t, event) ->
    event.preventDefault()
    params =
      _id: t['_id']
    queryParams =
      ssoUsername: @props.query.ssoUsername
      admin: @props.query.admin
#    queryParams = {}
#    if @props.query.ssoUsername? and @props.query.ssoUsername isnt ''
#      queryParams['ssoUsername'] = @props.query.ssoUsername
#    Router.transitionTo("/task/#{t['_id']}")
#    Router.transitionTo("task", params, queryParams)
    Router.transitionTo("dashboard", params, queryParams)

  # Handles the meta data icon for the underlying entity.  So a case with WoRH has a specific icon
  genTaskIconClass: (t) ->
    tmp = undefined
    if t['type'] is TaskTypeEnum.CASE.name
      tmp = TaskIconMapping[t['case']['internalStatus']]?.icon || tmp
    tmp || 'fa-medkit'

  # Generates the task name based on the underlying entity
  genTaskBid: (t) ->
    # Default the task name to the business id
    t['bid']

  genTaskSymbol: (t) ->
    sym = undefined
    if t['type'] is TaskTypeEnum.CASE.name
      sym = "Case"
    else if t['type'] is TaskTypeEnum.KCS.name
      sym = "KCS"
    sym || 'Task'

  genTaskStateIcon: (t) ->
    TaskIconMapping[t['state']]?.icon || 'fa-medkit'

#  genTaskElements: () ->
#    tasks = _.map @state['tasks'], (t) =>
#      (div
#        id: t['_id']
#        className: @genTaskClass(t)
#        style: @genTaskStyle(t)
#        key: t['_id']
#        onClick: @taskClick.bind(@, t)
#      , [
#        (i {className: "task-state fa #{@genTaskStateIcon(t)}"}, [])
#        (p {className: "task-symbol"}, [@genTaskSymbol(t)])
#        (span {className: "task-icon"}, [
#          (i {className: "fa #{@genTaskIconClass(t)}"}, [])
#          nbsp
#          (span {}, [@genTaskBid(t)])
#        ])
#      ])
#    tasks
  genTaskElements: () ->
    tasks = _.map @state['tasks'], (t) =>
      (div
        id: t['_id']
        className: @genTaskClass(t)
        style: @genTaskStyle(t)
        key: t['_id']
        onClick: @taskClick.bind(@, t)
      , [
          (span {className: 'task-symbol'}, [ @genTaskSymbol(t) ])
          nbsp
          nbsp
          (span {className: 'task-bid'}, [ @genTaskBid(t) ])
          (Spacer {}, [])
          (TaskAction {task: t,  key: 'taskAction'}, [])
          ' '
          (TaskMetaData {task: t, key: 'taskMetaData'}, [])
          (span {className: 'task-state'}, [
            (TaskState
              task: t
              takeOwnership: @takeOwnership.bind(@, t)
              removeOwnership: @removeOwnership.bind(@, t)
              close: @close.bind(@, t)
              key: 'taskState'
            , [])
          ])
        ])
    tasks

  changeLayout: (layoutMode, event) ->
    event.preventDefault()
    @iso.arrange
      layoutMode: layoutMode

  changeSort: (sortByName, event) ->
    event.preventDefault()
    @iso.arrange
      sortBy: sortByName

  filterBySbr: (sbr, event) ->
    self = @
    event.preventDefault()
    @iso.arrange
      filter: (itemElem) ->
        _id = $(itemElem).attr('id')
        task = self.state['tasks'][_id]
        #task = self.tasksById[_id]
        _.contains(task['sbrs'], sbr)
  clearFilter: (event) ->
    event.preventDefault()
    @iso.arrange
      filter: (itemElem) -> true

  genBtnGroupClass: (opts) ->
    classSet =
      'btn': true
      'btn-default': true
      'active': @state[opts['stateVarName']] is opts['var']
    cx(classSet)

  genBtnGroupLayout: () ->
    #layoutModes = ['masonry', 'fitRows', 'cellsByRow', 'vertical', 'masonryHorizontal', 'fitColumns', 'cellsByColumn', 'horizontal']
    layoutModes = ['masonry', 'vertical']
    _.map layoutModes, (layoutMode) =>
      (button
        key: layoutMode
        type: 'button'
        className: @genBtnGroupClass({stateVarName: 'layoutMode', 'var': layoutMode})
        onClick: @changeLayout.bind(@, layoutMode)
      , [layoutMode])

  genBtnGroupSort: () ->
    #layoutModes = ['masonry', 'fitRows', 'cellsByRow', 'vertical', 'masonryHorizontal', 'fitColumns', 'cellsByColumn', 'horizontal']
    #sortBys = ['Score', 'Case Number']
    sortBys = ['score', 'sbt']
    _.map sortBys, (sortBy) =>
      (button
        key: sortBy
        type: 'button'
        className: @genBtnGroupClass({stateVarBy: 'sortBy', 'var': sortBy})
        onClick: @changeSort.bind(@, sortBy)
      , [sortBy])

  genBtnGroupSbrFilter: (sbrs) ->
    btns = _.map sbrs, (sbr) =>
      (button
        key: sbr
        type: 'button'
        className: @genBtnGroupClass({stateVarBy: 'sbr', 'var': sbr})
        onClick: @filterBySbr.bind(@, sbr)
      , [sbr])

    btns.unshift (button
      key: 'Show All'
      type: 'button'
      className: @genBtnGroupClass({stateVarBy: 'sbr', 'var': 'Show All'})
      onClick: @clearFilter.bind(@)
    , ['Show All'])

    btns

  # This is to be called after layout complete to re-apply the opacity settings for each element which is lost when
  # filtering.  This is because the hidden and show styles of hiding and showing elements by isotope uses the opacity
  # to do it's magic
  opacify: () ->
    #console.debug "Opacifying"
    $('.task').each (idx, itemElem) =>
      _id = $(itemElem).attr('id')
      task = @state['tasks'][_id]
      $(itemElem).css
        'opacity': @scoreOpacityScale(task['score'])
        '-webkit-transition': 'opacity 0.5s ease-in-out'
        '-moz-transition': 'opacity 0.5s ease-in-out'
        '-o-transition': 'opacity 0.5s ease-in-out'
        'transition': 'opacity 0.5s ease-in-out'

  # Given a list of _ids from tasks, remove the orphans, aka, the xor between the old tasks and the new tasks from
  # an ajax call
  removeOrphans: (_ids) ->
    tasksRemoved = 0
    $('.task').each (idx, itemElem) =>
      _id = $(itemElem).attr('id')
      # If the new old _id isn't in the new _ids, remove it from isotope
      if not _.contains(_ids, _id)
        @iso.remove itemElem
        tasksRemoved++
    tasksRemoved

  getTaskDomIds: () ->
    _ids = []
    $('.task').each (idx, itemElem) -> _ids.push $(itemElem).attr('id')
    _ids

  setScoreScale: (min, max) ->
    @scoreScale = d3.scale.quantize().domain([min, max]).range([100, 200, 300])
    @scoreOpacityScale = d3.scale.linear().domain([min, max]).range([.25, 1])

  idSelector: () -> '#' + @props.id
  createIsotopeContainer: () ->
    self = @
    if not @iso?
      @iso = new Isotope @refs['tasksContainer'].getDOMNode(),
        itemSelector: '.task'
        layoutMode: 'masonry'
        masonry:
          rowHeight: 100
        sortBy: 'score'
        sortAscending:
          score: false
        getSortData:
          score: (itemElem) ->
            _id = $(itemElem).attr('id')
            task = self.state['tasks'][_id]
            #task = self.tasksById[_id]
            task['score']
          bid: (itemElem) ->
            _id = $(itemElem).attr('id')
            task = self.state['tasks'][_id]
            #task = self.tasksById[_id]
            task['bid']
          sbt: (itemElem) ->
            _id = $(itemElem).attr('id')
            task = self.state['tasks'][_id]
            #task = self.tasksById[_id]
            sbt = task['case']?['sbt'] || -999999
            #if not task['case']?['sbt']?
            #  console.error JSON.stringify(task)
            sbt

      @iso.on 'layoutComplete', () =>
        # Whenever the layout completes, re-opacity the tasks
        @opacify()

  queryTasks: (props) ->
    # Build a query if there is a ssoUsername or if the user is smendenh, pull all limit 100
    opts =
      path: '/tasks'
      queryParams: [
        {
          name: 'ssoUsername'
          value: props.query['ssoUsername']
        }
        {
          name: 'admin'
          value: props.query['admin']
        }
        {
          name: 'limit'
          value: 7
        }
      ]

    @get(opts)
    .then((tasks) =>
      @tasksById = _.object(_.map(tasks, (t) -> [t['_id'], t]))
      min = _.chain(tasks).pluck('score').min().value()
      max = _.chain(tasks).pluck('score').max().value()

      stateHash =
        # Hash the tasks by _id so they can be quickly looked up elsewhere
        'tasks': _.object(_.map(tasks, (t) -> [t['_id'], t]))
        'minScore': min
        'maxScore': max

      existingIds = _.chain(@state.tasks).pluck('_id').value()
      restIds = _.chain(tasks).pluck('_id').value()
      diff = _.xor(existingIds, restIds)
      # There are REST tasks different than dom tasks, must re-init iso
      if diff.length > 0
        console.debug "Found new tasks"
        stateHash['reloadItems'] = true
      else
        stateHash['reloadItems'] = false

      @setScoreScale(min, max)
      @setState stateHash
    )
    .catch((err) ->
      console.error "Could not load tasks: #{err.stack}"
    ).done()

  componentDidMount: ->
    console.debug "componentDidMount"
    @createIsotopeContainer()
    @queryTasks(@props)

  #TODO -- considering setting a field updateLayout in the queryTasks, so the iso container can be updated on shouldComponentUpdate
  # or on componentDidUpdate, where it will then set the state to false

  shouldComponentUpdate: (nextProps, nextState) ->
    console.debug "state.tasks.length: #{@state.tasks?.length} nextState.tasks.length: #{nextState.tasks?.length}"
#    #console.debug "state: #{@state.query.ssoUsername} nextState: #{nextState.query.ssoUsername}"
#    if ((@state['tasks'].length isnt nextState['tasks'].length) or (@state.query.ssoUsername isnt nextState.query.ssoUsername))
#      console.debug "componentShouldUpdate: true"
#      return true
#    else
#      console.debug "componentShouldUpdate: false"
#      return false

    return true

  componentWillReceiveProps: (nextProps) ->
    #console.debug "componentWillReceiveProps:query: #{JSON.stringify(nextProps.query)}"
    #console.debug "componentWillReceiveProps:params: #{JSON.stringify(nextProps.params)}"

    if (not _.isEqual(nextProps.query.ssoUsername)) or (not _.isEqual(nextProps.params._id))
      @setState
        query: nextProps.query
        params: nextProps.params
      @queryTasks(nextProps)

  componentDidUpdate: ->
#    # _ids represented in these new tasks
#    _ids = _.chain(@state.tasks).pluck('_id').value()
#    #tasksRemoved = @removeOrphans(_ids)
#    domIds = @getTaskDomIds()
#    diff = _.xor(_ids, domIds)
#    # There are REST tasks different than dom tasks, must re-init iso
#    if diff.length > 0
#      console.debug "Found tasks to remove, updating the component"
#      @iso?.reloadItems()
#      @iso.layout()
#      @iso?.arrange()

    if @state.reloadItems is true
      console.debug "reloadItems is true, updating iso"
      @iso?.reloadItems()
      @iso.layout()
      @iso?.arrange()

    #@setState {reloadItems: false}

#  componentWillReceiveProps: (nextProps) ->
#    #console.debug "componentWillReceiveProps: #{JSON.stringify(nextProps.query)}"
#    @setState
#      query: nextProps.query
#      params: nextProps.params
#    @queryTasks(nextProps)

#  componentDidUpdate: ->
#    if @iso?
#      @iso.arrange
#        layoutMode: @state.layoutMode

  componentWillUnmount: ->
    @iso?.destroy?()

  # Adds layers of controls based on admin query param
  genIsotopeControls: () ->
    if (@state.query.admin is undefined) or (@state.query.admin is false)
      return null

    sbrs = _.chain(@state.tasks).values().pluck('sbrs').flatten().unique().sort().value()
    (div {key: 'isotopeControls'}, [
      (div {className: "btn-group", key: 'layout'}, @genBtnGroupLayout())
      (br {})
      (br {})
      (div {className: "btn-group", key: 'sbr'}, @genBtnGroupSbrFilter(sbrs))
      (br {})
      (br {})
      (div {className: "btn-group", key: 'sort'}, @genBtnGroupSort())
      (br {})
    ])

  render: ->
    (div {}, [
      @genIsotopeControls()
      (div {className: 'row'}, [
        (div {className: 'col-md-4'}, [
          (div {id: @props.id, className: 'tasksContainer', key: 'tasksContainer', ref: 'tasksContainer'}, @genTaskElements())
        ])
        (div {className: 'col-md-8'}, [
          (Task {params: @props.params}, [])
        ])
      ])
    ]);

module.exports = Component
