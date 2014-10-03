React             = require 'react'

# Bootstrap components
Label       = require 'react-bootstrap/Label'

{span, pre} = React.DOM

Component = React.createClass
  render: ->
    if not @props.case?.resource?.product?.resource?
      return null

    product = @props.case.resource.product.resource
    version = product?.version || ""
    (Label {bsStyle: 'default', key: 'caseProduct'}, ["#{product['productName']} #{version}"])

module.exports = Component