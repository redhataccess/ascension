(function() {
  var Component, Label, React;

  React = require('react');

  Label = require('react-bootstrap/Label');

  Component = React.createClass({
    render: function() {
      return Label({
        bsStyle: 'info'
      }, [this.props.geo]);
    }
  });

  module.exports = Component;

}).call(this);
