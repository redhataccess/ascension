React         = require 'react'
_             = require 'lodash'

# Bootstrap components
Label            = require 'react-bootstrap/Label'
Popover         = require 'react-bootstrap/Popover'
OverlayTrigger  = require 'react-bootstrap/OverlayTrigger'

{div, h5, a, img, h4, ul, li, i, span} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'TaskAction'

  render: ->

    if not @props.task?
      return null

    popover = (Popover {}, ['No declined users'])
    declinedUserCount = @props.task['declinedUsers']?.length || 0

    if @props.task['declinedUsers']?.length > 0
      lis = _.map @props.task['declinedUsers'], (u) ->
        (li {key: u['id']}, [u['fullName']])

      popover = (Popover {key: 'popover'}, [
        (ul {className: 'list-unstyled', key: 'users'}, lis)
      ])

    (OverlayTrigger {trigger: "hover", placement: "bottom", overlay: popover, key: 'overlay'},
      (Label {bsStyle: "default", key: 'label'}, ["#{declinedUserCount} Declined User(s)"])
    )

module.exports = Component
