(function() {
  var Mapping, TaskStateEnum;

  TaskStateEnum = require('../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');

  Mapping = {
    'Unassigned': {
      icon: 'fa-medkit'
    },
    'Waiting on Customer': {
      icon: 'fa-smile-o'
    },
    'Waiting on Collaboration': {
      icon: 'fa-users'
    },
    'Waiting on Contributor': {
      icon: 'fa-users'
    },
    'Waiting on Engineering': {
      icon: 'fa-wrench'
    },
    'Waiting on Product Management': {
      icon: 'fa-wrench'
    },
    'Waiting on Sales': {
      icon: 'fa-dollar'
    },
    'Waiting on QA': {
      icon: 'fa-wheelchair'
    },
    'Waiting on Owner': {
      icon: 'fa-user'
    },
    'default': {
      icon: 'fa-medkit'
    }
  };

  Mapping[TaskStateEnum.UNASSIGNED.name] = {
    icon: 'fa-medkit'
  };

  Mapping[TaskStateEnum.CLOSED.name] = {
    icon: 'fa-check'
  };

  Mapping[TaskStateEnum.ASSIGNED.name] = {
    icon: 'fa-user'
  };

  Mapping[TaskStateEnum.ABANDONED.name] = {
    icon: 'fa-exclamation'
  };

  module.exports = Mapping;

}).call(this);
