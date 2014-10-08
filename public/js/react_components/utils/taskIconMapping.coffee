TaskStateEnum = require '../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee'

Mapping =
  # Relating to case internal status
  'Unassigned':
    icon: 'fa-medkit'
  'Waiting on Customer':
    icon: 'fa-smile-o'
  'Waiting on Collaboration':
    icon: 'fa-users'
  'Waiting on Contributor':
    icon: 'fa-users'
  'Waiting on Engineering':
    icon: 'fa-wrench'
  'Waiting on Product Management':
    icon: 'fa-wrench'
  'Waiting on Sales':
    icon: 'fa-dollar'
  'Waiting on QA':
    icon: 'fa-wheelchair'
  'Waiting on Owner':
    icon: 'fa-user'
  'default':
    icon: 'fa-medkit'

# Relating to task state
Mapping[TaskStateEnum.UNASSIGNED.name] =
  icon: 'fa-medkit'
  display: 'Unassigned'
Mapping[TaskStateEnum.CLOSED.name] =
  icon: 'fa-check'
  display: 'Closed'
Mapping[TaskStateEnum.ASSIGNED.name] =
  icon: 'fa-user'
  display: 'assigned'
Mapping[TaskStateEnum.ABANDONED.name] =
  icon: 'fa-exclamation'
  display: 'Abandoned'


module.exports = Mapping