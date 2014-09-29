(function() {
  var AjaxMixin, Auth, Component, React, TaskAction, TaskActionsEnum, TaskHeader, TaskStatus, User, a, div, h1, i, img, li, nbsp, ul, _ref;

  React = require('react');

  AjaxMixin = require('../../mixins/ajaxMixin.coffee');

  TaskStatus = require('./taskStatus.coffee');

  TaskHeader = require('./taskHeader.coffee');

  TaskAction = require('./taskAction.coffee');

  User = require('../user/user.coffee');

  Auth = require('../../auth/auth.coffee');

  TaskActionsEnum = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');

  _ref = React.DOM, div = _ref.div, a = _ref.a, img = _ref.img, h1 = _ref.h1, ul = _ref.ul, li = _ref.li, i = _ref.i;

  nbsp = "\u00A0";

  Component = React.createClass({
    displayName: 'Task',
    mixins: [AjaxMixin],
    getInitialState: function() {
      return {
        'task': void 0
      };
    },
    takeOwnership: function() {
      var queryParams;
      event.preventDefault();
      console.log("" + Auth.authedUser['resource']['firstName'] + " is Taking ownership of " + this.state.task._id);
      queryParams = [
        {
          name: 'action',
          value: TaskActionsEnum.ASSIGN
        }, {
          name: 'userInput',
          value: Auth.authedUser['externalModelId']
        }
      ];
      return this.post({
        path: "/task/" + this.props.params._id,
        queryParams: queryParams
      }).then((function(_this) {
        return function() {
          return _this.get({
            path: "/task/" + _this.props.params._id
          });
        };
      })(this)).then((function(_this) {
        return function(task) {
          return _this.setState({
            'task': task
          });
        };
      })(this))["catch"](function(err) {
        return console.error("Could not load tasks: " + err.stack);
      }).done();
    },
    render: function() {
      if (this.state['task'] == null) {
        return null;
      }
      return div({
        key: 'task'
      }, [
        TaskHeader({
          task: this.state.task,
          key: 'taskHeader'
        }, []), TaskStatus({
          task: this.state.task,
          takeOwnership: this.takeOwnership,
          key: 'taskStatus'
        }, []), nbsp, nbsp, User({
          user: this.state.task.owner,
          key: 'taskUser'
        }, []), TaskAction({
          task: this.state.task,
          key: 'taskAction'
        }, [])
      ]);
    },
    componentWillMount: function() {
      return this.get({
        path: "/task/" + this.props.params._id
      }).then((function(_this) {
        return function(task) {
          return _this.setState({
            'task': task
          });
        };
      })(this))["catch"](function(err) {
        return console.error("Could not load tasks: " + err.stack);
      }).done();
    }
  });

  module.exports = Component;

}).call(this);
