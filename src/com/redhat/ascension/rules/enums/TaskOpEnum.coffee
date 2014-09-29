module.exports =
  # This is the default state so that the rules can assign further states
  NOOP:
    name: 'noop'
    display: 'No Operation'

  OWN_TASK:
    name: 'takeTaskOwnership'
    display: 'Take Ownership of Task'

  # When in this state, refer to the EntityOperationEnum for a list of actions
  REFER_TO_ENTITY_OP:
    name: 'referToEntityOp'
    display: ''
