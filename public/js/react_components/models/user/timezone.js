(function() {
  var Component, Label, React;

  React = require('react');

  Label = require('react-bootstrap/Label');

  Component = React.createClass({
    render: function() {
      return Label({
        bsStyle: 'default'
      }, [this.props.timezone]);
    }
  });

  module.exports = Component;

}).call(this);
