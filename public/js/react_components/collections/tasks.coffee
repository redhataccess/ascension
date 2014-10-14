React       = require 'react'
ReactCSSTransitionGroup = React.addons.CSSTransitionGroup
ReactTransitionGroup = React.addons.TransitionGroup
Router      = require 'react-router/dist/react-router'
ActiveState = Router.ActiveState
AjaxMixin   = require '../mixins/ajaxMixin.coffee'
cx          = React.addons.classSet
d3          = require 'd3/d3'
_           = require 'lodash'
S           = require 'string'


Task              = require '../models/task/task.coffee'
TaskIconMapping   = require '../utils/taskIconMapping.coffee'
TaskTypeEnum      = require '../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'
TaskActionsEnum   = require '../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee'
EntityOpEnum      = require '../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum.coffee'
TaskStateEnum     = require '../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'
Auth              = require '../auth/auth.coffee'
TaskAction        = require '../models/task/taskAction.coffee'
TaskMetaData      = require '../models/task/taskMetaData.coffee'
TaskState         = require '../models/task/taskState.coffee'
Spacer            = require '../utils/spacer.coffee'
IconWithTooltip   = require '../utils/iconWithTooltip.coffee'

{div, button, img, h1, h2, ul, li, span, br, p, i} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'Tasks'
  mixins: [AjaxMixin]

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
    'items': [{}, {}]

  genTaskClass: (t) ->
    classSet =
      'task': true
      'task100': true
      'task-own': Auth.getAuthedUser()? and (t['owner']?['id'] is Auth.getAuthedUser()?['externalModelId'])
      'case': t['type'] is 'case'
      'kcs': t['type'] is 'kcs'
    cx(classSet)

  # Sizes the element by the linear score scale based on the task score
  genTaskStyle: (t) ->
    theStyle =
      opacity: @scoreOpacityScale(t.score)

  taskClick: (t, event) ->
    event.preventDefault()
    params =
      _id: t['_id']
    queryParams =
      ssoUsername: @props.query.ssoUsername
      admin: @props.query.admin
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

  genEntityStateIcon: (t) ->
    if t['type'] is TaskTypeEnum.CASE.name
      return TaskIconMapping[t['case']['internalStatus']]?.icon || 'fa-medkit'
    else
      return null

  genTaskSymbol: (t) ->
    sym = undefined
    if t['type'] is TaskTypeEnum.CASE.name
      sym = "Case"
    else if t['type'] is TaskTypeEnum.KCS.name
      sym = "KCS"
    sym || 'Task'

  genTaskStateIcon: (t) ->
    TaskIconMapping[t['state']]?.icon || 'fa-medkit'
    #(i className: "fa #{icon} fw", [])

  genEntityDescription: (t) ->
    if (t['type'] is 'case') or (t['type'] is 'kcs' and t['entityOp'] is EntityOpEnum.CREATE_KCS.name)
      return S(t['case']['subject']).truncate(50).s
    else
      return ''

  genTaskElements: () ->
    tasks = _.values(@state['tasks'])
    tasks.sort (a, b) -> b.score - a.score
    elems = _.map tasks, (t) =>
    #tasks = _.chain(@state['tasks'].values()).sort((a, b) -> b.score - a.score).value().map (t, idx) =>
      (div
        id: t['_id']
        className: @genTaskClass(t)
        style: @genTaskStyle(t)
        key: t['_id']
        score: t['score']
        onClick: @taskClick.bind(@, t)
      , [
          #(span {className: 'task-symbol'}, [ @genTaskSymbol(t) ])
          #nbsp
          #nbsp
          #(Spacer {}, [])
          (TaskAction {task: t,  key: 'taskAction', absolute: true}, [])
          # Case number
          (span {className: 'task-entity-state-icon'}, [
            (IconWithTooltip
              iconName: @genEntityStateIcon(t)
              tooltipPrefix: t['type'].toUpperCase()
              tooltipText: t['case']?['internalStatus'] || undefined
            , [])
          ])
          (span {className: 'task-entity-description'}, [
            @genEntityDescription(t)
          ])
          (span {className: 'task-bid'}, [ @genTaskBid(t) ])
          # Metadata represents the sbrs/tags of the task
          #' '
          #(TaskMetaData {task: t, key: 'taskMetaData'}, [])
          (span {className: 'task-state-icon'}, [
            (IconWithTooltip
              iconName: @genTaskStateIcon(t)
              tooltipPrefix: 'Task'
              tooltipText: TaskIconMapping[t['state']]?.display || '?'
            , [])
          ])
        ])
    elems

  genBtnGroupClass: (opts) ->
    classSet =
      'btn': true
      'btn-default': true
      'active': @state[opts['stateVarName']] is opts['var']
    cx(classSet)

  genBtnGroupLayout: () ->
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
    $('.task').each (idx, itemElem) =>
      _id = $(itemElem).attr('id')
      task = @state['tasks'][_id]
      $(itemElem).css
        'opacity': @scoreOpacityScale(task['score'])
        '-webkit-transition': 'opacity 0.5s ease-in-out'
        '-moz-transition': 'opacity 0.5s ease-in-out'
        '-o-transition': 'opacity 0.5s ease-in-out'
        'transition': 'opacity 0.5s ease-in-out'


  setScoreScale: (min, max) ->
    @scoreScale = d3.scale.quantize().domain([min, max]).range([100, 200, 300])
    @scoreOpacityScale = d3.scale.linear().domain([min, max]).range([.25, 1])

  queryTasks: (props) ->
    # Build a query if there is a ssoUsername

    ssoUsername = undefined
    if props.query.ssoUsername?
      ssoUsername = props.query.ssoUsername
    else if Auth.getScopedUser()?.resource?
      ssoUsername = Auth.getScopedUser().resource.sso[0]
    else if Auth.getAuthedUser()?.resource?
      ssoUsername = Auth.getAuthedUser().resource.sso[0]

    opts =
      path: '/tasks'
      queryParams: [
        {
          name: 'ssoUsername'
          value: ssoUsername
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
      @setScoreScale(min, max)

      stateHash =
        # Hash the tasks by _id so they can be quickly looked up elsewhere
        'tasks': _.object(_.map(tasks, (t) -> [t['_id'], t]))
        'minScore': min
        'maxScore': max

      @setState stateHash

      if (props.params._id is '' or (not props.params._id?)) and tasks.length > 0
        params =
          _id: tasks[0]['_id']
        queryParams =
          ssoUsername: @props.query.ssoUsername
          admin: @props.query.admin
        Router.transitionTo("dashboard", params, queryParams)

    )
    .catch((err) ->
      console.error "Could not load tasks: #{err.stack}"
    ).done()

  componentDidMount: ->
    @queryTasks(@props)

#  componentDidUpdate: ->
#    @opacify()

  componentWillReceiveProps: (nextProps) ->
    if (not _.isEqual(@props.query.ssoUsername, nextProps.query.ssoUsername)) or (not _.isEqual(@props.params._id, nextProps.params._id))
      @setState
        query: nextProps.query
        params: nextProps.params
      @queryTasks(nextProps)

  handleAdd: () ->
    items = @state.items
    items.push {}
    @setState
      items: items
    console.debug "State now has: #{@state.items.length} items"
    return


  render: ->
    #items = @state.items.map (item, i) => (div {key: i}, ['Item: ' + i])
    tasks = @genTaskElements()
    (div {}, [
      (div {className: 'row'}, [
        # https://github.com/facebook/react/issues/669 ?
        # http://jsfiddle.net/k9gy7/3/
        # https://groups.google.com/forum/#!topic/reactjs/2-RhZTHxNdc
        # http://jsfiddle.net/k9gy7/2/
        # http://codepen.io/makenosound/pen/rstvx  Low level api example
#        (div {className: 'col-md-3'}, [
#          #(button {onClick: @handleAdd.bind(@)}, ['Add Item'])
#          #(ReactCSSTransitionGroup {transitionName: "fade"}, items)
#          (ReactCSSTransitionGroup {transitionName: "fade"}, tasks)
#        ])
        (div {className: 'col-md-3'}, tasks)
        (div {className: 'col-md-9'}, [
          (Task {params: @props.params, queryTasks: @queryTasks.bind(@, @props)}, [])
        ])
      ])
    ])

module.exports = Component
