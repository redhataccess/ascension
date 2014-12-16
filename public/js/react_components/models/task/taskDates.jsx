var React           = require('react/addons');
var moment          = require('moment/moment');
var TaskStateEnum   = require('../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');
var Label           = React.createFactory(require('react-bootstrap/Label'));
var format          = 'YYYY/MM/DD HH:mm:ss';

var Component = React.createClass({
    displayName: 'TaskDates',
    render: function() {
        var closed, created, createdClosedDur, createdClosedDurHuman, createdClosedElapsed, dur, durHuman, elapsed;
        if (this.props.task == null) {
            return null;
        }
        created = moment(this.props.task.created);
        elapsed = moment().diff(created);
        dur = moment.duration(elapsed);
        durHuman = dur.humanize();
        closed = this.props.task.closed != null ? moment(this.props.task.closed) : void 0;
        createdClosedDur = void 0;
        createdClosedDurHuman = void 0;
        if ((closed != null) && (created != null)) {
            createdClosedElapsed = closed.diff(created);
            createdClosedDur = moment.duration(createdClosedElapsed);
            createdClosedDurHuman = createdClosedDur.humanize();
        }
        if (this.props.task.state !== TaskStateEnum.CLOSED.name) {
            return (
                <div>
                    <span>Task Created on</span>
                    <Label className='task-meta-data' bsStyle='primary' key='created'>{created.format(format)}</Label>
                    <span> and opened for </span>
                    <Label className='task-meta-data' bsStyle='primary' key='duration'>{durHuman}</Label>
                </div>
            )
        } else if (this.props.task.state === TaskStateEnum.CLOSED.name) {
            return (
                <div>
                    <span>Task Created on</span>
                    <Label className='task-meta-data' bsStyle='primary' key='created'>{created.format(format)}</Label>
                    <span> and closed on </span>
                    <Label className='task-meta-data' bsStyle='primary' key='duration'>{closed.format(format)}</Label>
                    <span> a duration of </span>
                    <Label className='task-meta-data' bsStyle='primary' key='duration'>{createdClosedDurHuman}</Label>
                </div>
            )
        } else {
            return null;
        }
    }
});

module.exports = Component;
