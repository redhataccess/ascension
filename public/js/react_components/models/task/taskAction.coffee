React         = require 'react'
cx            = React.addons.classSet
TaskOpEnum    = require '../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum.coffee'
EntityOpEnum  = require '../../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum.coffee'

# Bootstrap components
Label            = require 'react-bootstrap/Label'

{div, a, img, h4, ul, li, i, span} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'TaskAction'

  genClasses: () ->
    classSet =
      'task-meta-data': if @props.absolute is true then false else true
      'task-meta-data-absolute': if @props.absolute is true then true else false
    cx(classSet)

  render: ->

    if not @props.task?
      return null

#    taskOp = TaskOpEnum[@props.task?.taskOp?.toUpperCase()]
    entityOp = EntityOpEnum[@props.task?.entityOp]
    (Label {className: @genClasses(), bsStyle: 'primary', key: 'role'}, [entityOp.display])

module.exports = Component
