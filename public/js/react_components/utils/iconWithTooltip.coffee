#http://jsfiddle.net/leoasis/RH2vm/
React   = require 'react'
S       = require 'string'

# Bootstrap imports
OverlayTrigger   = require 'react-bootstrap/OverlayTrigger'
Popover          = require 'react-bootstrap/Popover'
Tooltip          = require 'react-bootstrap/Tooltip'
Button           = require 'react-bootstrap/Button'

{div, strong, a, div, i, h1, h2, h3, h4} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'IconWithTooltip'

  genTooltipPrefix: () ->
    if not @props.tooltipPrefix? or @props.tooltipPrefix is ''
      return ''
    S(@props.tooltipPrefix).capitalize().s + ' '

  render: ->

    if not @props.iconName?
      return null

    tooltip = (Tooltip {}, [@genTooltipPrefix() + @props.tooltipText])
    (OverlayTrigger {trigger: 'hover', placement: "right", overlay: tooltip},
      (i
        #key: 'icon-with-tooltip'
        className: "fa #{@props.iconName} icon-with-tooltip"
        title: @props.tooltipText
      , [])
    )

module.exports = Component
