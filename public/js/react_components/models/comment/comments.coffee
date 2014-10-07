React       = require 'react'
Router      = require 'react-router/dist/react-router'
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

  genCommentElements: () ->
    comments = _.map @state['comments'], (c) =>
      (Comment
        id: c['externalModelId']
        key: c['externalModelId']
        comment: c
      , [])
    comments

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
    @queryComments(@props)

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
      (div {id: @props.id, className: 'commentsContainer', key: 'commentsContainer', ref: 'commentsContainer'}, @genCommentElements())
    ])

module.exports = Component
