React       = require 'react'
Router      = require 'react-router/dist/react-router'
jQuery      = require 'jquery'
Isotope     = require 'isotope/js/isotope'
#Isotope     = require 'isotope/dist/isotope.pkgd'
AjaxMixin   = require '../mixins/ajaxMixin.coffee'
cx          = React.addons.classSet
d3          = require 'd3/d3'
_           = require 'lodash'


TaskIconMapping   = require '../utils/taskIconMapping.coffee'
TaskTypeEnum      = require '../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'
TaskStateEnum     = require '../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'

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

  genTaskClass: (t) ->
    classSet =
      'task': true
      'task100': true
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

  taskClick: (t) ->
    event.preventDefault()
    Router.transitionTo("/task/#{t['_id']}")

  # Handles the meta data icon for the underlying entity.  So a case with WoRH has a specific icon
  genTaskIconClass: (t) ->
    tmp = undefined
    if t['type'] is TaskTypeEnum.CASE.name
      tmp = TaskIconMapping[t['case']['Internal_Status__c']]?.icon || tmp
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
#            (span {}, [t['bid'] + " - " + t['score']])
#            (span {className: "task-name"}, [@genTaskName(t)])
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

  changeLayout: (layoutMode) ->
    event.preventDefault()
    console.debug "Changing layout to: #{layoutMode}"
    @iso.arrange
      layoutMode: layoutMode

  changeSort: (sortByName) ->
    event.preventDefault()
    console.debug "Changing sort to: #{sortByName}"
    @iso.arrange
      sortBy: sortByName

  filterBySbr: (sbr) ->
    self = @
    event.preventDefault()
    console.debug "Changing filter to: #{sbr}"
    @iso.arrange
      filter: (itemElem) ->
        _id = $(itemElem).attr('id')
        task = self.state['tasks'][_id]
        #task = self.tasksById[_id]
        _.contains(task['sbrs'], sbr)
  clearFilter: () ->
    event.preventDefault()
    @iso.arrange
      filter: (itemElem) ->
        true

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
    console.log "Opacifying"
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
            task['case']['SBT__c']
      @iso.on 'layoutComplete', () =>
        # Whenever the layout completes, re-opacity the tasks
        console.debug 'layoutComplete'
        @opacify()

  componentDidMount: ->
    self = @
    @createIsotopeContainer()
    @get({path: '/tasks'})
    .then((tasks) =>
      @tasksById = _.object(_.map(tasks, (t) -> [t['_id'], t]))
      min = _.chain(tasks).pluck('score').min().value()
      max = _.chain(tasks).pluck('score').max().value()
      @setScoreScale(min, max)
      @setState
        # Hash the tasks by _id so they can be quickly looked up elsewhere
        'tasks': _.object(_.map(tasks, (t) -> [t['_id'], t]))
        'minScore': min
        'maxScore': max
      #$elems = @genTaskElementsDom(tasks)
      console.debug "discovered: #{tasks.length} tasks"
      ##$(@refs['tasksContainer'].getDOMNode()).append($elems)
      #$('#tasksContainer').append($elems)
      #@iso.appended($elems)
      #@iso.arrange
      #  layoutMode: 'masonry'

      @iso?.reloadItems()
      @iso.layout()
      @iso?.arrange()

    )
    .catch((err) ->
      console.error "Could not load tasks: #{err.stack}"
    ).done()


  shouldComponentUpdate: (nextProps, nextState) ->
    # TODO -- do this more intelligently in the future
    if @state['tasks'].length isnt nextState['tasks'].length
      return true
    else
      return false

#  componentDidUpdate: ->
#    if @iso?
#      @iso.arrange
#        layoutMode: @state.layoutMode

  componentWillUnmount: ->
    @iso?.destroy?()

  render: ->
    sbrs = _.chain(@state.tasks).values().pluck('sbrs').flatten().unique().sort().value()

    (div {}, [
      #(h2 {}, ['Add'])
      #(button {id: 'addItem', className: "button is-checked"}, ['add Item'])
      #(br {})
      (div {className: "btn-group"}, @genBtnGroupLayout())
      (br {})
      (br {})
      (div {className: "btn-group"}, @genBtnGroupSbrFilter(sbrs))
      (br {})
      (br {})
      (div {className: "btn-group"}, @genBtnGroupSort())
      (br {})
#      (div {id: @props.id, className: 'tasksContainer', key: 'tasksContainer', ref: 'tasksContainer'}, [])
      (div {id: @props.id, className: 'tasksContainer', key: 'tasksContainer', ref: 'tasksContainer'}, @genTaskElements())
#      (div {id: @props.id, className: 'tasksContainer', key: 'tasksContainer', ref: 'iso'})
    ])

module.exports = Component
