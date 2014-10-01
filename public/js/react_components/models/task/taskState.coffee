React           = require 'react'
MenuItem        = require 'react-bootstrap/MenuItem'
DropdownButton  = require 'react-bootstrap/DropdownButton'
SplitButton     = require 'react-bootstrap/SplitButton'

TaskStateEnum = require '../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'

{div, a, img, h1, ul, li, i} = React.DOM

Component = React.createClass
  displayName: 'TaskStatus'

  render: ->
    if @props.task.state is TaskStateEnum.UNASSIGNED.name
      return (DropdownButton {bsStyle: 'warning', title: 'Unassigned'}, [
        (MenuItem {key: "takeOwnership", onClick: @props.takeOwnership}, ['Take Ownership'])
      ]);
    else if @props.task.state is TaskStateEnum.ASSIGNED.name
      return (DropdownButton {bsStyle: 'warning', title: 'Assigned'}, [
        (MenuItem {key: "removeOwnership", onClick: @props.removeOwnership}, ['Remove Ownership'])
      ]);
    else
      return null


module.exports = Component
