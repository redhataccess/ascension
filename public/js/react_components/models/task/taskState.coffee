React           = require 'react'
MenuItem        = require 'react-bootstrap/MenuItem'
#DropdownButton  = require 'react-bootstrap/DropdownButton'
DropdownButton  = require '../../bsReactOverrides/DropdownButton.coffee'
SplitButton     = require 'react-bootstrap/SplitButton'
ButtonToolbar   = require 'react-bootstrap/ButtonToolbar'

Auth            = require '../../auth/auth.coffee'
TaskStateEnum = require '../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'

{span, div, a, img, h1, ul, li, i} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'TaskState'

  render: ->

    if not Auth.get()?
      return null

    if @props.task.state is TaskStateEnum.UNASSIGNED.name
      return (DropdownButton {bsStyle: 'warning', bsSize: "xsmall", title: 'Unassigned'}, [
        (MenuItem {key: "assign", onClick: @props.takeOwnership}, [
          (i className: 'fa fa-user fw', [])
          nbsp
          'Take Ownership'
        ])
      ])
    else if @props.task.state is TaskStateEnum.ASSIGNED.name
      return (DropdownButton {bsStyle: 'primary', bsSize: "xsmall", title: 'Assigned'}, [
        (MenuItem {key: "unassign", onClick: @props.removeOwnership}, [
          (i className: 'fa fa-ban fw', [])
          nbsp
          'Remove Ownership'
        ])
        (MenuItem {key: "close", onClick: @props.close}, [
          'Close'
        ])
      ])
    else if @props.task.state is TaskStateEnum.CLOSED.name
      return (DropdownButton {bsStyle: 'success', bsSize: "xsmall", title: 'Closed'}, [
        (MenuItem {key: "assign", onClick: @props.takeOwnership}, [
          nbsp
          'Reopen and Take Ownership'
        ])
      ]);
    else
      return null


module.exports = Component
