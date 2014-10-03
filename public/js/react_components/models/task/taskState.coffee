React           = require 'react'
MenuItem        = require 'react-bootstrap/MenuItem'
DropdownButton  = require 'react-bootstrap/DropdownButton'
SplitButton     = require 'react-bootstrap/SplitButton'

Auth            = require '../../auth/auth.coffee'
TaskStateEnum = require '../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'

{div, a, img, h1, ul, li, i} = React.DOM

Component = React.createClass
  displayName: 'TaskStatus'

  render: ->

    if not Auth.get()?
      return null

    if @props.task.state is TaskStateEnum.UNASSIGNED.name
      return (DropdownButton {bsStyle: 'warning', bsSize: "small", title: 'Unassigned'}, [
        (MenuItem {key: "assign", onClick: @props.takeOwnership}, ['Take Ownership'])
      ]);
    else if @props.task.state is TaskStateEnum.ASSIGNED.name
      return (DropdownButton {bsStyle: 'primary', bsSize: "small", title: 'Assigned'}, [
        (MenuItem {key: "unassign", onClick: @props.removeOwnership}, ['Remove Ownership'])
        (MenuItem {key: "close", onClick: @props.close}, ['Close'])
      ]);
    else
      return null


module.exports = Component
