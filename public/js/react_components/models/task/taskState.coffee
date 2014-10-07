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

  # Adds another assignment element given the presense of a scoped user
  generateScopedOwnershipElem: () ->
    if not Auth.getScopedUser()?
      return null

    id = Auth.getScopedUser()['externalModelId']
    (MenuItem {key: "assign#{id}", onClick: @props.assignScopedOwnership}, [
      (i className: 'fa fa-user fw', [])
      nbsp
      "Assign to #{Auth.getScopedUser()['resource']['firstName']}"
    ])

  render: ->

    if not Auth.getAuthedUser()?
      return null

    id = Auth.getAuthedUser()['externalModelId']

    if @props.task.state is TaskStateEnum.UNASSIGNED.name
      return (DropdownButton {bsStyle: 'warning', bsSize: "xsmall", title: 'Unassigned'}, [
        (MenuItem {key: "assign#{id}", onClick: @props.takeOwnership}, [
          (i className: 'fa fa-user fw', [])
          nbsp
          'Take Ownership'
        ])
        @generateScopedOwnershipElem()
      ])
    else if @props.task.state is TaskStateEnum.ASSIGNED.name
      return (DropdownButton {bsStyle: 'primary', bsSize: "xsmall", title: 'Assigned'}, [
        (MenuItem {key: "unassign#{id}", onClick: @props.removeOwnership}, [
          (i className: 'fa fa-ban fw', [])
          nbsp
          'Remove Ownership'
        ])
        (MenuItem {key: "close#{id}", onClick: @props.close}, [
          'Close'
        ])
      ])
    else if @props.task.state is TaskStateEnum.CLOSED.name
      return (DropdownButton {bsStyle: 'success', bsSize: "xsmall", title: 'Closed'}, [
        (MenuItem {key: "assign#{id}", onClick: @props.takeOwnership}, [
          nbsp
          'Reopen and Take Ownership'
        ])
      ]);
    else
      return null


module.exports = Component
