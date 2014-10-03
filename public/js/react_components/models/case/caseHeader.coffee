React             = require 'react'

# Bootstrap components
Accordion       = require 'react-bootstrap/Accordion'
Panel           = require 'react-bootstrap/Panel'
Well            = require 'react-bootstrap/Well'

# Case components
CaseProduct = require './caseProduct.coffee'

{span, pre, h2} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  render: ->
    description = (span {}, ['No description available.'])
    if @props.description?
      description = (pre {className: 'case description paneled'}, [@props.description])

    (Well {key: 'caseHeaderWell'}, [
      (h2 {key: 'header'}, ["Case #{@props.case.resource.caseNumber}"])
      (span {subject: @props.case.resource.subject, key: 'headerSubject'}),
      nbsp
      (CaseProduct {case: @props.case, key: 'headerProduct'}),
#      nbsp
#      (BooleanComponent {val: @state.resource.resource.isTAMCase, text: 'TAM Case'}),
#      nbsp
#      (BooleanComponent {val: @state.resource.resource.isFTSCase, text: 'FTS Case'}),
#      (div {}, [
#        (SBRsComponent {sbrs: @state.resource.resource.sbrs}),
#        (span {}, [' ']),
#        (TagsComponent {tags: @state.resource.resource.tags})
#      ])
    ])

module.exports = Component