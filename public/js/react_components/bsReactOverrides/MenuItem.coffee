React           = require 'react/addons'
MenuItem        = require 'react-bootstrap/MenuItem'
DropdownButton  = require 'react-bootstrap/DropdownButton'
SplitButton     = require 'react-bootstrap/SplitButton'
ButtonToolbar   = require 'react-bootstrap/ButtonToolbar'

classSet                = require("react-bootstrap/utils/classSet")
ValidComponentChildren  = require("react-bootstrap/utils/ValidComponentChildren")
cloneWithProps          = require("react-bootstrap/utils/cloneWithProps")
createChainedFunction   = require("react-bootstrap/utils/createChainedFunction")
BootstrapMixin          = require("react-bootstrap/BootstrapMixin")
DropdownStateMixin      = require("react-bootstrap/DropdownStateMixin")
Button                  = require 'react-bootstrap/Button'
ButtonGroup             = require 'react-bootstrap/ButtonGroup'
DropdownMenu            = require 'react-bootstrap/DropdownMenu'

MenuItem = React.createClass(
  displayName: "MenuItem"
  propTypes:
    header: React.PropTypes.bool
    divider: React.PropTypes.bool
    href: React.PropTypes.string
    title: React.PropTypes.string
    onSelect: React.PropTypes.func

  getDefaultProps: ->
    href: "#"

  handleClick: (e) ->
    if @props.onSelect
      e.preventDefault()
      e.stopPropagation()
      @props.onSelect @props.key

  renderAnchor: ->
    React.DOM.a
      onClick: @handleClick
      href: @props.href
      title: @props.title
      tabIndex: "-1"
    , @props.children

  render: ->
    classes =
      "dropdown-header": @props.header
      divider: @props.divider

    children = null
    if @props.header
      children = @props.children
    else children = @renderAnchor()  unless @props.divider
    @transferPropsTo React.DOM.li(
      role: "presentation"
      title: null
      href: null
      className: classSet(classes)
    , children)
)
module.exports = MenuItem
