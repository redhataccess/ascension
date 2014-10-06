React       = require 'react'
Router      = require 'react-router/dist/react-router'
Isotope     = require 'isotope/js/isotope'
#Isotope     = require 'isotope/dist/isotope.pkgd'
AjaxMixin   = require '../mixins/ajaxMixin.coffee'
cx          = React.addons.classSet
d3          = require 'd3/d3'
_           = require 'lodash'

TaskIconMapping   = require '../utils/taskIconMapping.coffee'
TaskTypeEnum      = require '../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'
TaskStateEnum     = require '../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'
Auth              = require '../auth/auth.coffee'

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

  genTaskClass: (t) ->
#    console.debug "owner.id: #{t['owner']?['id']} authed user id: #{Auth.get()?['resource']?['id']}"
#    console.debug "owner.id is authed id: #{t['owner']?['id'] is Auth.get()?['resource']?['id']}"
    classSet =
      'task': true
      'task100': true
      'task-own': Auth.get()? and (t['owner']?['id'] is Auth.get()?['externalModelId'])
#      'task100': @scoreScale(t['score']) is 100
#      'task200': @scoreScale(t['score']) is 200
#      'task300': @scoreScale(t['score']) is 300
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
    Router.transitionTo("task", params, queryParams)

  # Handles the meta data icon for the underlying entity.  So a case with WoRH has a specific icon
  genTaskIconClass: (t) ->
    tmp = undefined
    if t['type'] is TaskTypeEnum.CASE.name
      tmp = TaskIconMapping[t['case']['internalStatus']]?.icon || tmp
    tmp || 'fa-medkit'

  # Generates the task name based on the underlying entity
  genTaskName: (t) ->
    # Default the task name to the business id
    t['bid']
#    name = "Task #{t['bid']}"
#    if t['type'] is TaskTypeEnum.CASE.name
#      name = "Case #{t['bid']}"
#    name

  genTaskSymbol: (t) ->
    sym = undefined
    if t['type'] is TaskTypeEnum.CASE.name
      sym = "C"
    sym || 'T'

  genTaskStateIcon: (t) ->
    TaskIconMapping[t['state']]?.icon || 'fa-medkit'

  genTaskElements: () ->
    tasks = _.map @state['tasks'], (t) =>
      (div
        id: t['_id']
        className: @genTaskClass(t)
        style: @genTaskStyle(t)
        key: t['_id']
        onClick: @taskClick.bind(@, t)
      , [
        (i {className: "task-state fa #{@genTaskStateIcon(t)}"}, [])
        (p {className: "task-symbol"}, [@genTaskSymbol(t)])
        (span {className: "task-icon"}, [
          (i {className: "fa #{@genTaskIconClass(t)}"}, [])
          nbsp
          (span {}, [@genTaskName(t)])
        ])
      ])
    tasks

  # This is for creating the raw dom elements
#  makeDiv: (t) ->
#    id = t['_id']
#    $("<div id='#{id}' class='#{@genTaskClass(t)}'>#{t['bid']} - #{t['score']}<div/>")
#  genTaskElementsDom: (tasks) ->
#    $elems = undefined
#    tasks.forEach (t) =>
#      console.log "Adding #{t['_id']} to the $elems"
#      if not $elems?
#        $elems = @makeDiv(t)
#      else
#        $elems = $elems.add(@makeDiv(t))
#    $elems

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
    $('.task').each (idx, itemElem) =>
      _id = $(itemElem).attr('id')
      # If the new old _id isn't in the new _ids, remove it from isotope
      if not _.contains(_ids, _id)
        @iso.remove itemElem

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
        #console.debug 'layoutComplete'
        @opacify()
#      @iso.on 'removeComplete', () =>
#        # Whenever the layout completes, re-opacity the tasks
#        console.debug 'removeComplete'
#      @iso.on 'transitionEnd', () =>
#        # Whenever the layout completes, re-opacity the tasks
#        console.debug 'transitionEnd'

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
      ]

    @get(opts)
    .then((tasks) =>
      @tasksById = _.object(_.map(tasks, (t) -> [t['_id'], t]))
      min = _.chain(tasks).pluck('score').min().value()
      max = _.chain(tasks).pluck('score').max().value()
      #console.debug "Min score: #{min}, max score: #{max}"
      @setScoreScale(min, max)
      @setState
      # Hash the tasks by _id so they can be quickly looked up elsewhere
        'tasks': _.object(_.map(tasks, (t) -> [t['_id'], t]))
        'minScore': min
        'maxScore': max
      #$elems = @genTaskElementsDom(tasks)
      ##$(@refs['tasksContainer'].getDOMNode()).append($elems)
      #$('#tasksContainer').append($elems)
      #@iso.appended($elems)
      #@iso.arrange
      #  layoutMode: 'masonry'



    )
    .catch((err) ->
      console.error "Could not load tasks: #{err.stack}"
    ).done()

  componentDidMount: ->
    self = @
    @createIsotopeContainer()
    @queryTasks(@props)

#  shouldComponentUpdate: (nextProps, nextState) ->
#    # TODO -- do this more intelligently in the future
#    #if (@state['tasks'].length isnt nextState['tasks'].length) or (@props.query.ssoUsername isnt nextProps.query.ssoUsername)
#    #console.debug "state: #{@state.query.ssoUsername} nextState: #{nextState.query.ssoUsername}"
#    if ((@state['tasks'].length isnt nextState['tasks'].length) or (@state.query.ssoUsername isnt nextState.query.ssoUsername))
#      console.debug "componentShouldUpdate: true"
#      return true
#    else
#      console.debug "componentShouldUpdate: false"
#      return false

  componentDidUpdate: ->
    # _ids represented in these new tasks
    _ids = _.chain(@state.tasks).pluck('_id').value()
    @removeOrphans(_ids)
    @iso?.reloadItems()
    @iso.layout()
    @iso?.arrange()

  componentWillReceiveProps: (nextProps) ->
    #console.debug "componentWillReceiveProps: #{JSON.stringify(nextProps.query)}"
    @setState
      query: nextProps.query
    console.debug "Querying tasks"
    @queryTasks(nextProps)

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
      (div {id: @props.id, className: 'tasksContainer', key: 'tasksContainer', ref: 'tasksContainer'}, @genTaskElements())
    ])

module.exports = Component
