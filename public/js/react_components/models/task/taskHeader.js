(function() {
  var Component, React, TaskTypeEnum, a, div, h1, i, img, li, nbsp, span, ul, _ref;

  React = require('react');

  TaskTypeEnum = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');

  _ref = React.DOM, div = _ref.div, a = _ref.a, img = _ref.img, h1 = _ref.h1, ul = _ref.ul, li = _ref.li, i = _ref.i, span = _ref.span;

  nbsp = "\u00A0";

  Component = React.createClass({
    displayName: 'TaskStatus',
    render: function() {
      var taskType, _ref1, _ref2;
      if (this.props.task == null) {
        return null;
      }
      taskType = TaskTypeEnum[(_ref1 = this.props.task) != null ? (_ref2 = _ref1.type) != null ? _ref2.toUpperCase() : void 0 : void 0];
      return h1({}, [
        span({
          className: "" + taskType.name + "-text-color",
          key: 'task-header'
        }, [taskType.display]), nbsp, 'Task'
      ]);
    }
  });

  module.exports = Component;

}).call(this);
