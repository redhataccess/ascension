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

    popover = (Popover {}, ['No potential owners'])

    @props.task['potentialOwners'].sort (a, b) -> b.score - a.score

    potentialOwnerCount = @props.task['potentialOwners']?.length || 0

    if @props.task['potentialOwners']?.length > 0
      lis = _.map @props.task['potentialOwners'], (u) ->
        (li {key: u['id']}, [u['fullName']])

      popover = (Popover {key: 'popover'}, [
        (ul {className: 'list-unstyled', key: 'owner'}, lis)
      ])

    (OverlayTrigger {trigger: "hover", placement: "bottom", overlay: popover, key: 'overlay'},
      (Label {bsStyle: "default", key: 'label'}, ["#{potentialOwnerCount} Potential Owners(s)"])
    )

module.exports = Component
