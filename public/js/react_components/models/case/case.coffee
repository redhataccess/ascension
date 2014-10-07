React             = require 'react'
AjaxMixin         = require '../../mixins/ajaxMixin.coffee'
Spacer            = require '../../utils/spacer.coffee'

User              = require '../user/user.coffee'
Auth              = require '../../auth/auth.coffee'

TaskActionsEnum   = require '../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee'
TaskTypeEnum      = require '../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'

# Bootstrap components
Well            = require 'react-bootstrap/Well'
Alert           = require 'react-bootstrap/Alert'
Accordion       = require 'react-bootstrap/Accordion'
Grid            = require 'react-bootstrap/Grid'
Row             = require 'react-bootstrap/Row'
Col             = require 'react-bootstrap/Col'

# Case components
CaseHeader        = require './caseHeader.coffee'
CaseDescription   = require './caseDescription.coffee'
CaseSummary       = require './caseSummary.coffee'
CaseAssociates    = require './caseAssociates.coffee'
CaseIssueLinks    = require './caseIssueLinks.coffee'
CaseResourceLinks = require './caseResourceLinks.coffee'

Comments          = require '../comment/comments.coffee'

{div, a, img, h1, ul, li, i, span, h3, hr} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'Case'
  mixins: [AjaxMixin]

  getInitialState: ->
    'case': undefined
    'loading': false

  queryCase: (props) ->
    @setState {'loading': true}
    @get({path: "/case/#{props.caseNumber}"})
    .then((c) =>
      console.debug "Discovered case: #{c['resource']['caseNumber']}"
      @setState
        'case': c
        'loading': false
    )
    .catch((err) =>
      console.error "Could not load case #{props.caseNumber}: #{err.stack}"
    )
    .done(=>
      @setState {'loading': false}
    )

  # Initially query for the case
  componentWillMount: ->
    if @props.caseNumber?
      @queryCase(@props)

  # Any subsequent updates to this component will cause a re-query
  componentWillReceiveProps: (nextProps) ->
    if @props.caseNumber isnt nextProps.caseNumber
      @queryCase(nextProps)

  render: ->
    if @state.loading is true
      return (i {className: "fa fa-spinner fa-spin"}, [])

    if not @state.case?
      (Alert {bsStyle: "warning", key: 'alert'}, [
        "No case found with case number #{@props.caseNumber}"
      ])
      return

    (div {}, [
      (CaseHeader {case: @state.case, key: 'caseHeader'}, [])

      (div {key: 'caseMetaData'}, [
        (CaseDescription {description: @state.case.resource.description, key: 'caseDescription'}, [])
        (CaseSummary {summary: @state.case.resource.summary, key: 'caseSummary'}, [])
        (CaseAssociates {owner: @state.case.resource.owner, associates: @state.case.resource.caseAssociates, key: 'caseAssociates'}, [])
        (CaseResourceLinks {resourceLinks: @state.case.resource.resourceLinks, key: 'caseResourceLinks'})
#        (Grid {fluid: true}, [
#          #(Row {}, [
#          #  (Col {xm: 12, xs: 12}, [
#          #    (CaseIssueLinks {issueLinks: @state.case.resource.issueLinks})
#          #  ]),
#          #]),
#          (Row {}, [
#            (Col {xm: 12, xs: 12}, [
#              (CaseResourceLinks {resourceLinks: @state.case.resource.resourceLinks})
#            ])
#          ])
#        ]),
      ])
      (hr {})
      (Comments {caseNumber: @state.case.resource.caseNumber, key: 'comments'}, [])
    ])

module.exports = Component
