React             = require 'react'
moment            = require 'moment'

# Bootstrap components
Label       = require 'react-bootstrap/Label'
{ul, li, div, h4, span} = React.DOM

Component = React.createClass
  getInitialState: ->
    timestamp: @props.timestamp

  componentWillReceiveProps: (nextProps) ->
    @setState
      timestamp: nextProps.timestamp

  render: ->
    ts = moment(@props.timestamp).format('lll')

    if @props.text?
      text = "#{@props.text}: #{ts}"
    else
      text = ts

    (Label {bsStyle: 'default'}, [text])

module.exports = Component