React             = require 'react'

# Bootstrap components
Accordion       = require 'react-bootstrap/Accordion'
Panel           = require 'react-bootstrap/Panel'
Table           = require 'react-bootstrap/Table'

# Case Components
Timestamp       = require './timestamp.coffee'


{span, pre, table, thead, tbody, tr, th, a, td} = React.DOM

Component = React.createClass
  render: ->
    self = @
    linkedResources = _.filter(@props.resourceLinks, (link) ->
      link.resource.resourceStatus == 'Linked')

    resourcesUI = (span {}, ['No external resources attached.'])

    if linkedResources.length > 0
      resourcesUI = (Table {responsive: true}, [
        (thead {}, [
          (tr {}, [
            (th {}, ['#']),
            (th {}, ['Type']),
            (th {}, ['Title']),
            (th {}, ['Status']),
            (th {}, [''])
          ])
        ]),
        (tbody {}, [
          _.map(linkedResources, (link) ->
            if link.resource.resourceType == 'KnowledgeBaseSolution'
              resourceNumber = (a {target: "_blank", href: "https://access.redhat.com/solutions/#{link.resource.resourceId}"}, [link.resource.resourceId])
            else
              resourceNumber = (span {}, [link.resource.resourceId])

            (tr {key: link.resource.resourceId}, [
              (td {}, [resourceNumber]),
              (td {}, ["#{link.resource.resourceType}"]),
              (td {}, ["#{link.resource.title}"]),
              (td {}, ["#{link.resource.resourceStatus}"]),
              (td {}, [(Timestamp {text: 'Attached', timestamp: link.resource.attached})])
            ])
          )
        ])
      ])

    (Accordion {}, [
      (Panel
        key: 'caseDescription'
        header: 'Linked Resources (KnowledgeBase, Documentation, Support Cases, ...)'
        collapsable: true
        defaultExpanded: false
      , [resourcesUI])
    ])

module.exports = Component