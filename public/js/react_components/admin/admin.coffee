React     = require 'react'

{div, img, h1, ul, li} = React.DOM

Component = React.createClass
  render: ->
    (h1 {}, ['Admin'])

module.exports = Component
