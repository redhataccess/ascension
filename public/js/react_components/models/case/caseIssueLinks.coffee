React             = require 'react'

# Bootstrap components
Accordion       = require 'react-bootstrap/Accordion'
Table           = require 'react-bootstrap/Table'

{span, pre} = React.DOM

Component = React.createClass
  render: ->
    issuesUI = (span {}, ['No solutions attached.'])

    if @props.issueLinks?
      issuesUI = (BTable {responsive: true}, [
        (thead {}, [
          (tr {}, [
            (th {}, ['#']),
            (th {}, ['Type']),
            (th {}, ['Title']),
            (th {}, ['Summary']),
          ])
        ])
        (tbody {}, [
          _.map(@props.issueLinks, (link) ->
            (tr {key: link.resource.issueNumber}, [
              (td {}, ["#{link.resource.issueNumber}"]),
              (td {}, ["#{link.resource.source}"]),
              (td {}, ["#{link.resource.title}"]),
              (td {}, ["#{link.resource.summary}"])
            ])
          )
        ])
      ])

    (Accordion {}, [
      (Panel
        key: 'caseDescription'
        header: 'Linked Bugs, Issues, or Feature Requests (Bugzilla, Jira, ...)'
        collapsable: true
        defaultExpanded: false
      , [issuesUI])
    ])

module.exports = Component