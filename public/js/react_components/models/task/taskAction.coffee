React         = require 'react'
TaskOpEnum    = require '../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum.coffee'
EntityOpEnum  = require '../../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum.coffee'

# Bootstrap components
Label            = require 'react-bootstrap/Label'

{div, a, img, h4, ul, li, i, span} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'TaskAction'

  render: ->

    if not @props.task?
      return null

#    taskOp = TaskOpEnum[@props.task?.taskOp?.toUpperCase()]
    entityOp = EntityOpEnum[@props.task?.entityOp]
    (Label {className: 'task-meta-data', bsStyle: 'primary', key: 'role'}, [entityOp.display])

module.exports = Component
