var React            = require('react/addons');

var Label            = require('react-bootstrap/Label');

var Component = React.createClass({
  render: function () {
    return <Label bsStyle='default'>{this.props.timezone}</Label>
  }
});

module.exports = Component;
