var React           = require('react');
var TaskTypeEnum    = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');

var Component = React.createClass({
    displayName: 'TaskStatus',
    render: function() {
        var taskType;
        if (this.props.task == null) {
            return null;
        }
        //taskType = TaskTypeEnum[this.props.task.resource.type.toUpperCase()];
        taskType = TaskTypeEnum.CASE;
        return (
            <div>
                <h1>
                    <span key={taskType.name} className={`${taskType.name}-text-color`}> Priority Tasks</span>
                </h1>
                <hr />
            </div>
        )
    }
});

module.exports = Component;
