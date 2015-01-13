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
    mixins: [AjaxMixin, WebUtilsMixin, Router.State, Router.Navigation],
    genEntityContents: function() {
        return <Case key='taskCase' caseNumber={this.props.case.resource.caseNumber}></Case>;
    },
    // CS FTW -- would just be one line -- 'task-own': Auth.getAuthedUser()? and (t['owner']?['id'] is Auth.getAuthedUser()?['externalModelId'])
    isOwner: (c) => {
        if (Auth.getAuthedUser() != null
            && c && c['resource'] && c['resource']['owner'] && c['resource']['owner']['externalModelId']
            && c['resource']['owner']['owner.externalModelId'] == Auth.getAuthedUser()['externalModelId']) {
            return true;
        }
        return false;
    },
    genTaskClass: function(c) {
        var classSet = {
            'task': true,
            'task100': true,
            'task-own': this.isOwner(c),
            'case': true,
            'kcs': false
        };
        return cx(classSet);
    },
    genTaskStyle: function(c) {
        return {
            opacity: this.props.scoreOpacityScale(c.resource.collaborationScore)
        };
    },
    taskClick: function(c, event) {
        var params, queryParams;
        event.preventDefault();
        params = {
            taskId: c.resource.caseNumber
        };
        this.transitionTo("tasks", params, this.getQuery());
    },
    genTaskIconClass: function(t) {
        var tmp, _ref1;
        tmp = void 0;
        tmp = ((_ref1 = TaskIconMapping[t.resource.internalStatus]) != null ? `fa ${_ref1.icon}` : void 0) || tmp;
        return tmp || 'fa fa-medkit';
    },
    genTaskBid: function(theCase) {
        return theCase.resource.caseNumber;
    },
    genEntityStateIcon: function(theCase) {
        var _ref1;
        return ((_ref1 = TaskIconMapping[theCase.resource.internalStatus]) != null ? `fa ${_ref1.icon}` : void 0) || 'fa fa-medkit';
    },
    genTaskSymbol: function(t) {
        return "Case";
    },
    genTaskStateIcon: function(theCase) {
        var iconMapping = TaskIconMapping[theCase.resource.status];
        return 'fa ' + (iconMapping != null ? iconMapping.icon : void 0) || 'fa-medkit';
    },
    genEntityDescription: function(theCase) {
        return S(theCase.resource.subject).truncate(40).s;
    },
    render: function() {
        var { taskId } = this.getParams();
        if (this.props.case === '') {
            return <Alert bsStyle='danger' key='alert'>`Error fetching case with id: ${taskId}`</Alert>
        }
        if (this.props.case == null) {
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
                {/*<span className='task-entity-state-icon'></span>*/}
                <span className='task-entity-description'>{this.genEntityDescription(this.props.case)}</span>
                <span className='task-bid'>{this.genTaskBid(this.props.case)}</span>
                {/*
                <span className='task-state-icon'>
                    <IconWithTooltip
                        iconName={this.genTaskStateIcon(this.props.case)}
                        tooltipPrefix="Task"
                        tooltipText={TaskIconMapping[this.props.case.resource.status] || '?'}></IconWithTooltip>
                </span>
                */}
            </div>
        )
    }
});

module.exports = Component;
