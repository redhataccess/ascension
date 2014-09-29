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
    console.debug "entityOp on task: #{JSON.stringify(@props.task?.entityOp, null, ' ')}"
    console.debug JSON.stringify(EntityOpEnum, null, ' ')
    entityOp = EntityOpEnum[@props.task?.entityOp]
    console.log JSON.stringify entityOp
    (div {}, [
      (h4 {}, [
        (Label {bsStyle: 'primary', key: 'role'}, [entityOp.display])
      ])
    ])

module.exports = Component
