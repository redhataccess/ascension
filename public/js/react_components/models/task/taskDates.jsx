var React           = require('react/addons');
var moment          = require('moment/moment');
var TaskStateEnum   = require('../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');
var format          = 'YYYY/MM/DD HH:mm:ss';

//var Label           = React.createFactory(require('react-bootstrap/Label'));
var Label           = require('react-bootstrap/Label');

var Component = React.createClass({
    displayName: 'TaskDates',
    render: function() {
        var closed, created, createdClosedDur, createdClosedDurHuman, createdClosedElapsed, dur, durHuman, elapsed;
        if (this.props.task == null) {
            return null;
        }
        created = moment(this.props.task.resource.created);
        elapsed = moment().diff(created);
        dur = moment.duration(elapsed);
        durHuman = dur.humanize();
        closed = this.props.task.resource.closed != null ? moment(this.props.task.resource.closed) : void 0;
        createdClosedDur = void 0;
        createdClosedDurHuman = void 0;
        if ((closed != null) && (created != null)) {
            createdClosedElapsed = closed.diff(created);
            createdClosedDur = moment.duration(createdClosedElapsed);
            createdClosedDurHuman = createdClosedDur.humanize();
        }
        if (this.props.task.resource.state !== TaskStateEnum.CLOSED.name) {
            return (
                <div>
                    <span>Created: {created.format(format)}</span>
                    &nbsp;  &nbsp;
                    <span>Opened {durHuman}</span>
                </div>
            )
        } else if (this.props.task.resource.state === TaskStateEnum.CLOSED.name) {
            return (
                <div>
                    <span>Created: {created.format(format)}</span>
                    <span> Closed: {closed.format(format)} </span>
                    <span> Opened {createdClosedDurHuman}</span>
                </div>
            )
        } else {
            return null;
        }
    }
});

module.exports = Component;
