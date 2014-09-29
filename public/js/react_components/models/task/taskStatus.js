(function() {
  var Component, MenuItem, React, SplitButton, TaskStateEnum, a, div, h1, i, img, li, ul, _ref;

  React = require('react');

  MenuItem = require('react-bootstrap/MenuItem');

  SplitButton = require('react-bootstrap/SplitButton');

  SplitButton = require('react-bootstrap/SplitButton');

  TaskStateEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');

  _ref = React.DOM, div = _ref.div, a = _ref.a, img = _ref.img, h1 = _ref.h1, ul = _ref.ul, li = _ref.li, i = _ref.i;

  Component = React.createClass({
    displayName: 'TaskStatus',
    render: function() {
      if (this.props.task.state === TaskStateEnum.UNASSIGNED.name) {
        return SplitButton({
          bsStyle: 'warning',
          title: 'Unassigned'
        }, [
          MenuItem({
            key: "takeOwnership",
            onClick: this.props.takeOwnership
          }, ['Take Ownership'])
        ]);
      } else {
        return null;
      }
    }
  });

  module.exports = Component;

}).call(this);
