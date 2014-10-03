React     = require 'react'
moment    = require 'moment/moment'

TaskStateEnum    = require '../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'

# Bootstrap components
Label            = require 'react-bootstrap/Label'

{div, a, img, h4, ul, li, i, span} = React.DOM
nbsp = "\u00A0"

format = 'YYYY/MM/DD HH:mm:ss'

Component = React.createClass
  displayName: 'TaskDates'

  render: ->

    if not @props.task?
      return null

    created = moment(@props.task.created)
    elapsed = moment().diff(created)
    dur = moment.duration(elapsed)
    durHuman = dur.humanize()

    closed = if @props.task.closed? then moment(@props.task.closed) else undefined
    createdClosedDur = undefined
    createdClosedDurHuman = undefined
    if closed? and created?
      createdClosedElapsed = closed.diff(created)
      createdClosedDur = moment.duration(createdClosedElapsed)
      createdClosedDurHuman = createdClosedDur.humanize()

    # Non-closed cases
    if @props.task.state isnt TaskStateEnum.CLOSED.name
      return (div {}, [
        (span {}, ['Task created on '])
        (Label {className: 'task-meta-data', bsStyle: 'primary', key: 'created'}, [
          created.format(format)
        ])
        (span {}, [' and opened for '])
        (Label {className: 'task-meta-data', bsStyle: 'primary', key: 'duration'}, [
          durHuman
        ])
      ])
    # Closed cases
    else if @props.task.state is TaskStateEnum.CLOSED.name
      return (div {}, [
        (span {}, ['Task created on '])
        (Label {className: 'task-meta-data', bsStyle: 'primary', key: 'created'}, [
          created.format(format)
        ])
        (span {}, [' and closed on '])
        (Label {className: 'task-meta-data', bsStyle: 'primary', key: 'closed'}, [
          closed.format(format)
        ])
        (span {}, [' a duration of '])
        (Label {className: 'task-meta-data', bsStyle: 'primary', key: 'duration'}, [
          createdClosedDurHuman
        ])
      ])

    else
      return null


module.exports = Component
