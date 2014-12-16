var React            = require('react/addons');
var Label            = React.createFactory(require('react-bootstrap/Label'));

var Component = React.createClass({
  render: () => {
    return (<Label bsStyle='default'>{this.props.timezone}</Label>)
  }
});

module.exports = Component;
