React            = require 'react'

# Bootstrap imports
MenuItem         = require 'react-bootstrap/MenuItem'
OverlayTrigger   = require 'react-bootstrap/OverlayTrigger'
Popover          = require 'react-bootstrap/Popover'
Button           = require 'react-bootstrap/Button'
SplitButton      = require 'react-bootstrap/SplitButton'
Label            = require 'react-bootstrap/Label'


# Custom Components
Timezone         = require './timezone.coffee'
Geo              = require './geo.coffee'

{ul, li, div, h4, span, thead, tbody, td, tr, th, pre, a} = React.DOM

Component = React.createClass
  render: ->
    user = @props.user
    if not user?
      return null

    if !user.email?
      (span {}, [user.fullName])
    else
      popover = (Popover {title: user.fullName, key: 'popover'}, [
        (div {key: 'title'}, [user.title]),
        (Geo
          geo: user.superRegion
          key: 'userGeo'
        ),
        nbsp = "\u00A0"
        (Timezone
          timezone: user.timezone
          key: 'userTimezone'
        )
        nbsp = "\u00A0"
        _.map(user.roles, (role) ->
          (Label {bsStyle: 'danger', key: 'role'}, role.resource.description)
        )
      ])

      (OverlayTrigger {trigger: 'hover', placement: 'bottom', overlay: popover},
        (Label {className: 'task-meta-data', bsStyle: 'default', key: 'userLabel'}, [user.fullName])
        #(Button {bsStyle: 'default', bsSize: 'small'}, [user.fullName])
        # (BSplitButton {bsStyle: 'default', bsSize: 'small', title: user.fullName}, [
        # (BMenuItem {key: user.email, href: "mailto:#{user.email}"}, ['Send E-Mail'])
        # ])
      )

module.exports = Component
