React             = require 'react'
cx                = React.addons.classSet

# Bootstrap components
Accordion       = require 'react-bootstrap/Accordion'
Panel           = require 'react-bootstrap/Panel'

# Custom components
Timestamp       = require '../case/timestamp.coffee'
User            = require '../user/user.coffee'

{ul, li, div, h4, span, thead, tbody, td, tr, th, pre, h3} = React.DOM
nbsp = "\u00A0"

Component = React.createClass

  genCommentClasses: (c) ->
    classSet =
      'comment': true
      'private': c.public is false
      'public': c.public is true
    cx(classSet)

  genPanelBodyClasses: (c) ->
    classSet =
      'panel-body': true
      'private': c.public is false
      'public': c.public is true
    cx(classSet)

  genPreClasses: (c) ->
    classSet =
      'private': c.public is false
      'public': c.public is true
      'paneled': true
    cx(classSet)

  render: ->
    commentResource = @props.comment
    comment = commentResource.resource

    if comment.created == comment.lastModified
      timestamp = (Timestamp {text: 'Created', timestamp: comment.created})
    else
      timestamp = (span {}, [
        (Timestamp {text: 'Created', timestamp: comment.created})
        nbsp
        (Timestamp {text: 'Last modified', timestamp: comment.lastModified})
      ])


    header = (span {}, [
      (div {className: 'pull-left'}, [
        (User {user: comment?['createdBy']?['resource']}),
      ])
      (div {className: 'pull-right'}, [
        timestamp,
        nbsp
        #(SBTComponent {sbt: comment.sbt}),
        #nbsp
        #(CommentTypeComponent {resource: comment}),
        #(span {}, [" ##{comment.commentNumber}"])
      ])
    ])

#    (Accordion {}, [
#      (Panel
#        key: 'caseSummary'
#        header: 'Internal Summary'
#        collapsable: true
#        defaultExpanded: false
#      , [summary])
#    ])
#    (Panel
#      id: @props.id,
#      key: @props.key
#      header: header
##      bsStyle: style
#      #className: 'comment'
#      className: @genCommentClasses(comment)
#    , [
#    ])

    (div {className: "panel panel-default"}, [
      (div {className: "panel-heading"}, [
        (h3 {className: "panel-title"}, [
          nbsp
          header
        ])

      ])
      (div {className: @genPanelBodyClasses(comment)}, [
        (pre {className: @genPreClasses(comment)}, [comment.text])
      ])
    ])

module.exports = Component