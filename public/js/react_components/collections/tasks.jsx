var React                   = require('react/addons');
var Marty                   = require('marty');
var ObjectDiff              = require('objectdiff');
//var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
//var ReactTransitionGroup    = React.addons.TransitionGroup;
var Router                  = require('react-router/dist/react-router');
var AjaxMixin               = require('../mixins/ajaxMixin.coffee');
//var WebUtilsMixin           = require('../mixins/webUtilsMixin.coffee');
var cx                      = React.addons.classSet;
var d3                      = require('d3/d3');
var _                       = require('lodash');
var S                       = require('string');
var Task                    = require('../models/task/task.jsx');
var Spacer                  = require('react-redhat/Spacer');
var TaskIconMapping         = require('../utils/taskIconMapping.coffee');
var TaskTypeEnum            = require('../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');
var TaskActionsEnum         = require('../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');
var ResourceOpEnum            = require('../../../../src/com/redhat/ascension/rules/enums/ResourceOpEnum.coffee');
var TaskStateEnum           = require('../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');
var Auth                    = require('../auth/auth.coffee');
var TaskAction              = require('../models/task/taskAction.jsx');
//var TaskMetaData            = require('../models/task/taskMetaData.jsx');
var TaskState               = require('../models/task/taskState.jsx');
var TasksStats              = require('../models/task/tasksStats.jsx');
var RoutingRoles            = require('../models/task/routingRoles.jsx');
// TaskCase represents the virtual mapping of case -> task for sprint 1
var TaskCase                = require('../models/task/taskCase.jsx');
var Alert                   = require('react-bootstrap/Alert');
var Button                  = require('react-bootstrap/Button');
var AppConstants            = require('react-redhat/flux/constants/AppConstants');

var DeclinedTasksActions    = require('../../flux/actions/DeclinedTasksActions');
var TasksActions    = require('../../flux/actions/TasksActions');
var TasksStore      = require('../../flux/stores/TasksStore');
var State           = require('react-router/dist/react-router').State;

var TasksStateMixin = Marty.createStateMixin({
    mixins: [State],
    listenTo: TasksStore,
    getState: function () {
        var ssoUsername, _ref2;
        ssoUsername = this.getQuery()['ssoUsername'];
        if ((ssoUsername == null || ssoUsername == undefined) && ((_ref2 = Auth.getAuthedUser()) != null ? _ref2.resource : null) != null) {
            ssoUsername = Auth.getAuthedUser().resource.sso[0];
        }
        ssoUsername = S(ssoUsername).replaceAll('"', '').s;
        var opts = {
            ssoUsername: ssoUsername,
            roles: this.getQuery()['roles'],
            taskId: this.getParams()['taskId']
        };
        return {
            res:TasksStore.getTasks(opts)
        }
    }
});

var Component = React.createClass({
    displayName: 'Tasks',
    mixins: [AjaxMixin, TasksStateMixin, Router.Navigation],
    getInitialState: function() {
        return {
            // This will allow the cases pulled to be overridden from the Auth.getAuthedUser()
            'ssoUsername': null,
            // This will allow roles to be overridden from what is in the UDS user
            'roles': null,
            'loading': false,
            'minScore': 0,
            'maxScore': 0,
            'layoutMode': this.props.layoutMode || 'masonry',
            'sortBy': this.props.sortBy || 'score',
            'items': [{}, {}],

            // This is purely medata returned from the backend about user roles found
            'userRoles': null,
            // Metadata that indicates if the default roles were assigned if no user roles present
            'defaultRoles': false,
            // Metadata that indicates if url roles overrode user or default roles.
            'urlRoles': false
        };
    },

    // http://javascript.tutorialhorizon.com/2014/09/13/execution-sequence-of-a-react-components-lifecycle-methods/
    componentDidMount: function() {
        var stateHash;
        var roles="";
        if(this.getQuery()['roles'] != undefined && this.getQuery()['roles'] != null) {
            roles = S(this.getQuery()['roles']).replaceAll('"', '').s;
        }
        stateHash = {
            ssoUsername: this.getQuery()['ssoUsername'],
            roles: roles,
            taskId: this.getParams()['taskId']
        };
        this.setState(stateHash);
        TasksActions.invalidateTasks();
    },
    componentWillReceiveProps: function(nextProps) {
        var stateHash;
        if (this.getQuery()['ssoUsername'] != this.state.ssoUsername
            || this.getQuery()['roles'] != this.state.roles ) {
            // || this.getParams()['taskId'] != this.state.taskId) {
            stateHash = {
                ssoUsername: this.getQuery()['ssoUsername'],
                roles: this.getQuery()['roles'],
                taskId: this.getParams()['taskId'],
                res: null
            };
            this.setState(stateHash);
            TasksActions.invalidateTasks();
        }
        // Since tasks.jsx doesn't directly render the case, let's handle this separately and only update the state
        // so the child components can render it accordingly
        if (this.getParams()['taskId'] != this.state.taskId) {
            this.setState({taskId: this.getParams()['taskId']});
        }
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        if (this.getQuery()['ssoUsername'] != this.state.ssoUsername
            || this.getQuery()['roles'] != this.state.roles
            || this.getParams()['taskId'] != this.state.taskId
            || !_.isEqual(this.state, nextState)) {
            return true;
        }
        return false
    },

    getScoreScale: function(min, max) {
        return d3.scale.linear().domain([min, max]).range([.25, 1]);
    },
    receiveTasks: function(opts){
        TasksActions.invalidateTasks();
    },
    handleIgnoredTask: function(event) {
        var currentLocalTask;
        var currentCase = _.filter(this.state.res.result.tasks, (c) => c.resource.caseNumber == this.state.taskId);
        if(currentCase != undefined && currentCase.length > 0) {
            currentLocalTask = {taskID:this.state.taskId, lastModified:currentCase[0].resource.lastModified};
            DeclinedTasksActions.declineTask(currentLocalTask,this.state.ssoUsername);
        }
        var stateHash;
        stateHash = {
            ssoUsername: this.getQuery()['ssoUsername'],
            roles: this.getQuery()['roles'],
            taskId: 'list'
        };
        this.setState(stateHash);
        TasksActions.invalidateTasks();
    },
    renderTasks: function () {
        var taskCases,
            stateHash,
            self = this;
        return this.state.res.when({
            pending: function () {
                return <i className='fa fa-spinner fa-spin'></i>;
            },
            failed: function (err) {
                console.error(err.stack || err);
                return  <Alert bsStyle="warning"><strong>No cases found!</strong></Alert>
            },
            done: function (res) {
                var tasks = res.tasks;
                var scoreOpacityScale = self.getScoreScale(res.minScore, res.maxScore);
                if((tasks == undefined || tasks == null || tasks.length == 0)){
                    return (
                        <Alert bsStyle="warning"><strong>No cases found!</strong></Alert>
                    );
                }else{
                    var taskId = self.getParams()['taskId'];
                    if ((taskId == '' || (taskId == null) || (taskId == 'list')) && tasks.length > 0 || taskId != self.state.taskId) {
                        var params = {
                            taskId: tasks[0]['resource']['caseNumber']
                        };
                        self.transitionTo("tasks", params, self.getQuery());
                    }
                    taskCases = _.map(tasks, (c) => {
                        return <TaskCase case={c} ssoUsername= {self.state.ssoUsername} scoreOpacityScale={scoreOpacityScale} />
                    });
                    stateHash = {
                        ssoUsername: self.state.ssoUsername,
                        roles: self.state.roles
                    };
                    return (
                        <div className='row'>
                            <div className='col-md-3'>
                            {taskCases}
                                <Spacer />
                                <i className="fa fa-refresh cursor" style={{marginLeft: "6px"}}  onClick={self.receiveTasks.bind(self, stateHash)}></i>
                                <TasksStats tasks={tasks} totalCases={res.numberOfTotalCases} numberofOwnerCases={res.numberOfOwnerCases} numberOfOtherCases={res.numberOfOtherCases} />
                            </div>
                            <div className='col-md-9'>
                                <div>
                                    <div className='pull-left'>
                                        <RoutingRoles
                                            roles={res.userRoles}
                                            defaultRoles={res.defaultRoles}
                                            urlRoles={res.urlRoles}></RoutingRoles>
                                    </div>
                                    <div className='pull-right'>
                                        <Button bsSize="small" onClick={self.handleIgnoredTask.bind(self)} bsStyle='danger'>Defer for now</Button>
                                    </div>
                                </div>
                                <Task caseNumber={taskId}></Task>
                            </div>
                        </div>
                    )
                }
            }
        });
    },

    render: function() {
        var { taskId } = this.getParams();
        return (
            this.renderTasks()

        )
    }
});

module.exports = Component;
