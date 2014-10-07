React           = require 'react'
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

DropdownButton = React.createClass(
  displayName: "DropdownButton"
  mixins: [
    BootstrapMixin
    DropdownStateMixin
  ]
  propTypes:
    pullRight: React.PropTypes.bool
    dropup: React.PropTypes.bool
    title: React.PropTypes.renderable
    href: React.PropTypes.string
    onClick: React.PropTypes.func
    onSelect: React.PropTypes.func
    navItem: React.PropTypes.bool

  render: ->
    className = "dropdown-toggle"
    renderMethod = (if @props.navItem then "renderNavItem" else "renderButtonGroup")
    @[renderMethod] [
      @transferPropsTo(Button(
        ref: "dropdownButton"
        className: className
        onClick: @handleDropdownClick
        key: 0
        navDropdown: @props.navItem
        navItem: null
        title: null
        pullRight: null
        dropup: null
      , @props.title, " ", React.DOM.span(className: "caret")))
      DropdownMenu(
        ref: "menu"
        "aria-labelledby": @props.id
        pullRight: @props.pullRight
        key: 1
      , ValidComponentChildren.map(@props.children, @renderMenuItem))
    ]

  renderButtonGroup: (children) ->
    groupClasses =
      open: @state.open
      dropup: @props.dropup

    ButtonGroup
      bsSize: @props.bsSize
      className: classSet(groupClasses)
    , children

  renderNavItem: (children) ->
    classes =
      dropdown: true
      open: @state.open
      dropup: @props.dropup

    React.DOM.li
      className: classSet(classes)
    , children

  renderMenuItem: (child) ->

    # Only handle the option selection if an onSelect prop has been set on the
    # component or it's child, this allows a user not to pass an onSelect
    # handler and have the browser preform the default action.
    handleOptionSelect = (if @props.onSelect or child.props.onSelect then @handleOptionSelect else null)
    cloneWithProps child,

      # Capture onSelect events
      onSelect: createChainedFunction(child.props.onSelect, handleOptionSelect)

    # Force special props to be transferred
      key: child.props.key
      ref: child.props.ref


  handleDropdownClick: (e) ->
    e.preventDefault()
    e.stopPropagation();
    @setDropdownState not @state.open

  handleOptionSelect: (key) ->
    @props.onSelect key  if @props.onSelect
    @setDropdownState false
)
module.exports = DropdownButton
