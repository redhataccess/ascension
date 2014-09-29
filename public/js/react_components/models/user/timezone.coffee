React            = require 'react'
Label            = require 'react-bootstrap/Label'

Component = React.createClass
  render: ->
    (Label {bsStyle: 'default'}, [@props.timezone])

module.exports = Component
