React             = require 'react'

# Bootstrap components
Accordion       = require 'react-bootstrap/Accordion'
Panel           = require 'react-bootstrap/Panel'

{span, pre} = React.DOM

Component = React.createClass
  render: ->
    summary = (span {}, ['No internal summary available.'])
    if @props.summary?
      summary = (pre {className: 'case description paneled'}, [@props.summary])

    (Accordion {}, [
      (Panel
        key: 'caseSummary'
        header: 'Internal Summary'
        collapsable: true
        defaultExpanded: false
      , [summary])
    ])

module.exports = Component