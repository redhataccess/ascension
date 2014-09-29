React            = require 'react'
Label            = require 'react-bootstrap/Label'

Component = React.createClass
  render: ->
    (Label {bsStyle: 'info'}, [@props.geo])

module.exports = Component
