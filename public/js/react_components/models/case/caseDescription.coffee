React             = require 'react'

# Bootstrap components
Accordion       = require 'react-bootstrap/Accordion'
Panel           = require 'react-bootstrap/Panel'

{span, pre} = React.DOM

Component = React.createClass
  render: ->
    description = (span {}, ['No description available.'])
    if @props.description?
      description = (pre {className: 'case description paneled'}, [@props.description])

    (Accordion {key: 'accordion'}, [
      (Panel
        key: 'caseDescription'
        header: 'Customer Description'
        collapsable: true
        defaultExpanded: false
      , [description])
    ])

module.exports = Component