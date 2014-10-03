React         = require 'react'
TaskTypeEnum  = require '../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee'

{div, a, img, h1, ul, li, i, span} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'TaskStatus'

  render: ->

    if not @props.task?
      return null

    taskType = TaskTypeEnum[@props.task?.type?.toUpperCase()]
    (h1 {}, [
      (span {className: "#{taskType.name}-text-color", key: 'task-header'}, [
        #taskType.display
      ])
      nbsp
      'Task'
    ])

module.exports = Component
