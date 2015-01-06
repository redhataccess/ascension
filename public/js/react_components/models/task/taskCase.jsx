var React                       = require('react/addons');
var cx                          = React.addons.classSet;
var Router                      = require('react-router/dist/react-router');
var AjaxMixin                   = require('../../mixins/ajaxMixin.coffee');
var WebUtilsMixin               = require('../../mixins/webUtilsMixin.coffee');
var TaskState                   = require('./taskState.jsx');
var TaskHeader                  = require('./taskHeader.jsx');
var TaskAction                  = require('./taskAction.jsx');
var TaskMetaData                = require('./taskMetaData.jsx');
var TaskTypeEnum                = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');
var TaskActionsEnum             = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');
var ResourceOpEnum              = require('../../../../../src/com/redhat/ascension/rules/enums/ResourceOpEnum.coffee');
var TaskStateEnum               = require('../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');
var TaskDates                   = require('./taskDates.jsx');
var Case                        = require('../case/case.jsx');
var User                        = require('react-redhat/user/User');
var Auth                        = require('../../auth/auth.coffee');
var DeclinedUsers               = require('./declinedUsers.jsx');
var PotentialOwners             = require('./potentialOwners.jsx');
var TaskIconMapping             = require('../../utils/taskIconMapping.coffee');
var S                           = require('string');
var IconWithTooltip             = require('react-redhat/IconWithTooltip');
var Spacer                      = require('react-redhat/Spacer');

var Well                        = require('react-bootstrap/Well');
var Alert                       = require('react-bootstrap/Alert');

// The TaskCase represents a UDS case resource as a virtual task.
var Component = React.createClass({
    displayName: 'TaskCase',
    mixins: [AjaxMixin, WebUtilsMixin, Router.State],
    getInitialState: function() {
        // task and case are part of the same object, but due to the nested natureG of UDS, I am defining both and setting
        // both as it makes for referring to the case much easier
        return {
            'task': void 0,
            'theCase': void 0
        };
    },
    genEntityContents: function() {
        if (this.state.task.resource.type === TaskTypeEnum.CASE.name) {
            return <Case key='taskCase' caseNumber={this.state.theCase.caseNumber}></Case>;
        }
        return null;
    },
    // CS FTW -- would just be one line -- 'task-own': Auth.getAuthedUser()? and (t['owner']?['id'] is Auth.getAuthedUser()?['externalModelId'])
    isOwner: (theCase) => {
        if (Auth.getAuthedUser() != null
            && theCase && theCase['resource'] && theCase['resource']['owner'] && theCase['resource']['owner']['externalModelId']
            && theCase['resource']['owner']['owner.externalModelId'] == Auth.getAuthedUser()['externalModelId']) {
            return true;
        }
        return false;
    },
    genTaskClass: function(theCase) {
        var classSet = {
            'task': true,
            'task100': true,
            'task-own': this.isOwner(theCase),
            'case': true,
            'kcs': false
        };
        return cx(classSet);
    },
    genTaskStyle: function(theCase) {
        return {
            opacity: this.props.scoreOpacityScale(theCase.resource.collaborationScore)
        };
    },
    taskClick: function(t, event) {
        var params, queryParams;
        event.preventDefault();
        params = {
            taskId: t.resource.externalModelId
        };
        queryParams = {
            ssoUsername: this.getParams().ssoUsername,
            admin: this.getQuery().admin
        };
        this.transitionTo("tasks", params, queryParams);
    },
    genTaskIconClass: function(t) {
        var tmp, _ref1;
        tmp = void 0;
        if (t['type'] === TaskTypeEnum.CASE.name) {
            tmp = ((_ref1 = TaskIconMapping[t['case']['internalStatus']]) != null ? `fa ${_ref1.icon}` : void 0) || tmp;
        }
        return tmp || 'fa fa-medkit';
    },
    genTaskBid: function(theCase) {
        return theCase.resource.caseNumber;
    },
    genEntityStateIcon: function(theTask, theCase) {
        var _ref1;
        if (theTask.type === TaskTypeEnum.CASE.name) {
            return ((_ref1 = TaskIconMapping[theCase.internalStatus]) != null ? `fa ${_ref1.icon}` : void 0) || 'fa fa-medkit';
        } else {
            return null;
        }
    },
    genTaskSymbol: function(t) {
        var sym;
        sym = void 0;
        if (t['type'] === TaskTypeEnum.CASE.name) {
            sym = "Case";
        } else if (t['type'] === TaskTypeEnum.KCS.name) {
            sym = "KCS";
        }
        return sym || 'Task';
    },
    genTaskStateIcon: function(theCase) {
        var iconMapping = TaskIconMapping[theCase.resource.status];
        return 'fa ' + (iconMapping != null ? iconMapping.icon : void 0) || 'fa-medkit';
    },
    genEntityDescription: function(theCase) {
        return S(theCase.resource.subject).truncate(50).s;
    },
    queryTask: function () {
        var taskId = this.getParams()['taskId'],
            self = this;
        this.get({path: `/task/${taskId}`})
            .then((task) => self.setState({'task': task, 'theCase': task.resource.resource.resource}))
            .catch((err) => console.error(`Could not load task: ${taskId}, ${err.stack}`))
            .done();
    },
    componentWillReceiveProps: function(nextProps) {
        var newTaskId = this.getParams()['taskId'],
            currentTaskId = WebUtilsMixin.getDefined(this, 'state.task.resource.externalModelId');
        if (newTaskId != currentTaskId && newTaskId != 'tasks') {
            this.queryTask();
        }
    },
    // Refactor this to the more elegant advanced form in scorecard
    componentDidMount: function() {
        if (this.getParams()['taskId'] == 'list') {
            console.warn('/tasks/list received, not fetching task.');
            return;
        }
        this.queryTask();
    },
    render: function() {
        var { taskId } = this.getParams();
        if (this.state.task === '') {
            return <Alert bsStyle='danger' key='alert'>`Error fetching task with id: ${taskId}`</Alert>
        }
        if (this.state['task'] == null) {
            return null;
        }
 //       {/*
 //<IconWithTooltip
 //iconName={self.genEntityStateIcon(theTask, theCase)}
 //tooltipPrefix={theTask.type.toUpperCase()}
 //tooltipText={theCase.internalStatus || null}></IconWithTooltip>
 ///*}
        return (
            <div
                id={this.props.case.resource.caseNumber}
                className={this.genTaskClass(this.props.case)}
                style={this.genTaskStyle(this.props.case)}
                key={this.props.case.resource.caseNumber}
                score={this.props.case.resource.collaborationScore}
                onClick={this.taskClick.bind(this, this.props.case)}>
                <TaskAction case={this.props.case} key='taskAction' absolute={true}></TaskAction>
                <span className='task-entity-state-icon'>
                </span>
                <span className='task-entity-description'>{this.genEntityDescription(this.props.case)}</span>
                <span className='task-bid'>{this.genTaskBid(this.props.case)}</span>
                <span className='task-stat-icon'>
                    <IconWithTooltip
                        iconName={this.genTaskStateIcon(this.props.case)}
                        tooltipPrefix="Task"
                        tooltipText={TaskIconMapping[this.props.case.resource.status] || '?'}></IconWithTooltip>
                </span>
            </div>
        )
    }
});

module.exports = Component;
