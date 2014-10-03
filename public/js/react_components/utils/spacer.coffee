React = require 'react'

{div} = React.DOM
Component = React.createClass
  displayName: 'Spacer'
  render: -> (div {className: 'spacer', key: 'spacer'}, [])

module.exports = Component
