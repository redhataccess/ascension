React       = require 'react'
Router      = require 'react-router/dist/react-router'
Isotope     = require 'isotope/js/isotope'
#Isotope     = require 'isotope/dist/isotope.pkgd'
AjaxMixin   = require '../../mixins/ajaxMixin.coffee'
cx          = React.addons.classSet
d3          = require 'd3/d3'
_           = require 'lodash'
moment      = require 'moment'

# Custom components
Auth          = require '../../auth/auth.coffee'
Comment       = require '../comment/comment.coffee'
SlaAttainment = require '../comment/slaAttainment.coffee'


{div, button, img, h1, h2, ul, li, span, br, p, i} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'Comments'
  mixins: [AjaxMixin]

  # We want the boxes between 100px x 100px and 200px x 200px

  getInitialState: ->
    # For the flag for when an account is loading
    'loading': false
    'comments': []
    'minScore': 0
    'maxScore': 0
    'layoutMode': @props.layoutMode || 'masonry'
    'sortBy': @props.sortBy || 'score'
    'query': @props.query

  # TODO - create the comment class in main.less
  genCommentClass: (t) ->
    classSet =
      'comment': true
    cx(classSet)

  # Handles the meta data icon for the underlying entity.  So a case with WoRH has a specific icon
  genCommentIconClass: (t) ->
    tmp = undefined
    if t['type'] is CommentTypeEnum.CASE.name
      tmp = CommentIconMapping[t['case']['internalStatus']]?.icon || tmp
    tmp || 'fa-medkit'

  # Generates the task name based on the underlying entity
  genCommentName: (t) ->
    # Default the task name to the business id
    t['bid']

  genCommentSymbol: (t) ->
    sym = undefined
    if t['type'] is CommentTypeEnum.CASE.name
      sym = "C"
    sym || 'T'

  genCommentElements: () ->
    comments = _.map @state['comments'], (c) =>
      #(div {id: c['externalModelId'], key: c['externalModelId']}, [
      #  (Comment
      #    comment: c
      #  , [])
      #])
      (Comment
        id: c['externalModelId']
        key: c['externalModelId']
        comment: c
      , [])
    comments

  changeLayout: (layoutMode, event) ->
    event.preventDefault()
    @iso.arrange
      layoutMode: layoutMode

  changeSort: (sortBy, event) ->
    event.preventDefault()
    sortObj =
      'sortBy': sortBy.name
      sortAscending: sortBy.ascending
    @iso.arrange(sortObj)

  filterBySbr: (sbr, event) ->
    self = @
    event.preventDefault()
    @iso.arrange
      filter: (itemElem) ->
        _id = $(itemElem).attr('id')
        task = self.state['comments'][_id]
        #task = self.commentsById[_id]
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
    sortBys = [
      {
        name: 'created'
        ascending: false
        display: 'Created \u25BC'
      }
      {
        name: 'created'
        ascending: true
        display: 'Created \u25B2'
      }
    ]
    _.map sortBys, (sortBy) =>
      (button
        key: sortBy.name
        type: 'button'
        className: @genBtnGroupClass({stateVarBy: 'sortBy', 'var': sortBy.name})
        onClick: @changeSort.bind(@, sortBy)
      , [sortBy.display])

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

  # Given a list of _ids from comments, remove the orphans, aka, the xor between the old comments and the new comments from
  # an ajax call
  removeOrphans: (_ids) ->
    $('.task').each (idx, itemElem) =>
      _id = $(itemElem).attr('id')
      # If the new old _id isn't in the new _ids, remove it from isotope
      if not _.contains(_ids, _id)
        @iso.remove itemElem

  idSelector: () -> '#' + @props.id
  createIsotopeContainer: () ->
    self = @
    if not @iso?
      @iso = new Isotope @refs['commentsContainer'].getDOMNode(),
        itemSelector: '.comment'
        layoutMode: 'fitRows'
        # CSS styles that are applied to the container element. To disable Masonry from setting any CSS to the container element, set containerStyle: null.
        # This should cause the position: absolute not to be set, but that isn't the case, keeping it for posterity though
        #containerStyle: null
        #masonry:
        #  rowHeight: 100
        sortBy: 'created'
        sortAscending:
          score: false
        getSortData:
          created: (itemElem) ->
            id = $(itemElem).attr('id')
            comment = self.state['comments'][id]
            #task = self.commentsById[_id]

            if comment?['resource']?['created']?
              return +moment(comment['resource']['created'])
            else
              return 0

      #@iso.on 'layoutComplete', () =>
      #  # Whenever the layout completes, re-opacity the comments
      #  #console.debug 'layoutComplete'
      #  @opacify()

  queryComments: (props) ->
    @setState {'loading': true}
    # Build a query if there is a ssoUsername or if the user is smendenh, pull all limit 100
    opts =
      path: "/case/#{props.caseNumber}/comments"

    @get(opts)
    .then((comments) =>
      #@commentsById = _.object(_.map(comments, (c) -> [c['externalModelId'], c]))
      @setState
        'comments': _.object(_.map(comments, (c) -> [c['externalModelId'], c]))
        'loading': false
    )
    .catch((err) ->
      console.error "Could not load comments: #{err.stack}"
    )
    .done(=>
      @setState {'loading': false}
    )

  componentDidMount: ->
#    @createIsotopeContainer()
    @queryComments(@props)

#  componentDidUpdate: ->
#    @iso?.reloadItems()
#    @iso.layout()
#    @iso?.arrange()

  componentWillReceiveProps: (nextProps) ->
    #console.debug "componentWillReceiveProps: #{JSON.stringify(nextProps.query)}"
    @setState
      query: nextProps.query
    @queryComments(nextProps)

#  componentDidUpdate: ->
#    if @iso?
#      @iso.arrange
#        layoutMode: @state.layoutMode

  componentWillUnmount: ->
    @iso?.destroy?()

  render: ->
    if @state.loading is true
      return (i {className: "fa fa-spinner fa-spin"}, [])

    if not @state.comments?
      (Alert {bsStyle: "warning", key: 'alert'}, [
        "No case comments found for this case"
      ])

    (div {}, [
      (SlaAttainment {
        negative: _.filter(_.values(@state.comments), (comment) -> comment.resource.public and comment.resource.sbt? and comment.resource.sbt < 0).length,
        all: _.filter(_.values(@state.comments), (comment) -> comment.resource.sbt? and comment.resource.public).length
      })
#      (div {className: "btn-group"}, @genBtnGroupLayout())
#      (br {})
#      (br {})
#      (div {className: "btn-group"}, @genBtnGroupSbrFilter(sbrs))
#      (br {})
#      (br {})
#      (div {className: "btn-group"}, @genBtnGroupSort())
#      (br {})
#      (br {})
      (div {id: @props.id, className: 'commentsContainer', key: 'commentsContainer', ref: 'commentsContainer'}, @genCommentElements())
    ])

module.exports = Component
