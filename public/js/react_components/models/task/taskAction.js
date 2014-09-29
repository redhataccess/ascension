(function() {
  var Component, EntityOpEnum, Label, React, TaskOpEnum, a, div, h4, i, img, li, nbsp, span, ul, _ref;

  React = require('react');

  TaskOpEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum.coffee');

  EntityOpEnum = require('../../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum.coffee');

  Label = require('react-bootstrap/Label');

  _ref = React.DOM, div = _ref.div, a = _ref.a, img = _ref.img, h4 = _ref.h4, ul = _ref.ul, li = _ref.li, i = _ref.i, span = _ref.span;

  nbsp = "\u00A0";

  Component = React.createClass({
    displayName: 'TaskAction',
    render: function() {
      var entityOp, _ref1;
      if (this.props.task == null) {
        return null;
      }
      entityOp = EntityOpEnum[(_ref1 = this.props.task) != null ? _ref1.entityOp : void 0];
      return div({}, [
        h4({}, [
          Label({
            bsStyle: 'primary',
            key: 'role'
          }, [entityOp.display])
        ])
      ]);
    }
  });

  module.exports = Component;

}).call(this);
