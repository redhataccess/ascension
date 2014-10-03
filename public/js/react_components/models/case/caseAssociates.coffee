React             = require 'react'
AjaxMixin         = require '../../mixins/ajaxMixin.coffee'
Spacer            = require '../../utils/spacer.coffee'

User              = require '../user/user.coffee'
Auth              = require '../../auth/auth.coffee'

TaskActionsEnum   = require '../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee'
TaskTypeEnum      = require '../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'

# Bootstrap components
PanelGroup      = require 'react-bootstrap/PanelGroup'
Accordion      = require 'react-bootstrap/Accordion'
Panel           = require 'react-bootstrap/Panel'
Table           = require 'react-bootstrap/Table'

{ul, li, div, h4, span, thead, tbody, td, tr, th} = React.DOM

Component = React.createClass
  displayName: 'Case Associates'
  displayOwner: (owner) ->
    if not owner?
      ['danger', (span {})]
    else
      ['default', (tr {key: owner.resource.externalModelId}, [
        (td {}, ["Owner"]),
        (td {}, [User {user: owner.resource}])
      ])
      ]

  render: ->
    owner = @props.owner
    associates = @props.associates

    [ownerStyle, ownerElement] = @displayOwner(owner)

    associatesUI = (span {}, ['No Red Hat Associates are assigned to this Case.'])
    if associates? || ownerElement?
      associatesUI = (Table {responsive: true}, [
        (thead {}, [
          (tr {}, [
            (th {}, ['Role']),
            (th {}, ['Associate'])
          ])
        ])
        (tbody {}, [
          ownerElement,
          _.map(associates, (associate) ->
            (tr {key: associate.externalModelId}, [
              (td {}, ["#{associate.resource.role}"]),
              (td {}, [(User {user: associate.resource})])
            ])
          )
        ])
      ])
#    (Accordion {}, [
#      (Panel
#        key: 'caseSummary'
#        header: 'Internal Summary'
#        collapsable: true
#        defaultExpanded: false
#      , [summary])
#    ])
    (Accordion {}, [
      (Panel
        key: 'caseSupportAssociates'
        header: 'Support Associates'
        bsStyle: ownerStyle
        collapsable: true
        defaultExpanded: false
      , [associatesUI])
    ])

module.exports = Component
