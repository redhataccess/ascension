React             = require 'react'
Spacer            = require '../../utils/spacer.coffee'

# Bootstrap components
ProgressBar     = require 'react-bootstrap/ProgressBar'
Panel           = require 'react-bootstrap/Panel'

{ul, li, div, h4, span} = React.DOM

Component = React.createClass
  displayStyle: ->
    negative = @props.negative
    all = @props.all
    @ratio = Math.round((all - negative) * 100.0 / all)

    if @ratio >= 90
      'success'
    else if 80 < @ratio < 90
      'warning'
    else
      'danger'

  render: ->
    if @props.all?
      style = @displayStyle()
      (Panel {header: 'Comment SLA Attainment'}, [
        (ProgressBar {bsStyle: style, now: @ratio, label: "#{@ratio} %"})
      ])
    else
      null

module.exports = Component