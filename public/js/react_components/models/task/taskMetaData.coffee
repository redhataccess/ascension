React         = require 'react'
_             = require 'lodash'

# Bootstrap components
Label            = require 'react-bootstrap/Label'

{div, a, img, h4, ul, li, i, span} = React.DOM
nbsp = "\u00A0"

Component = React.createClass
  displayName: 'TaskAction'

  render: ->

    if not @props.task?
      return null

    # Pertaining to Webservers and httpd
    sbrsExist = (@props.task.sbrs?.length > 0)
    tagsExist = (@props.task.tags?.length > 0)

    output = []

    if sbrsExist
      output.push "Pertaining to"
      output.push @props.task.sbrs.join(',')

    if tagsExist
      if sbrsExist then output.push 'and'
      output.push @props.task.tags.join(',')

    (Label {className: 'task-meta-data', bsStyle: 'primary', key: 'role'}, [output.join(' ')])

module.exports = Component
