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
var RoutingRoles            = require('../models/task/routingRoles.jsx');
// TaskCase represents the virtual mapping of case -> task for sprint 1
var TaskCase                = require('../models/task/taskCase.jsx');
var Alert                   = require('react-bootstrap/Alert');

var DeclinedTasksStore      = require('../stores/DeclinedTasksStore');
var DeclinedTasksActions    = require('../actions/DeclinedTasksActions');

// var DeclinedTasksState = Marty.createStateMixin({
//     declinedTasks: DeclinedTasksStore
// });

var Component = React.createClass({
    displayName: 'Tasks',
    mixins: [AjaxMixin, Router.State, Router.Navigation],
    getInitialState: function() {
        return {
            // This will allow the cases pulled to be overridden from the Auth.getAuthedUser()
            'ssoUsername': null,
            // This will allow roles to be overridden from what is in the UDS user
            'roles': null,
            'loading': false,
            'tasks': [],
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
    genTaskElements: function() {
        var taskCases,
            stateHash,
            self = this;
        if (this.state.loading == true) {
            return <i className='fa fa-spinner fa-spin'></i>;
        } else if (this.state.loading == false && (this.state.tasks == null || this.state.tasks.length == 0)) {
            return (
                <Alert bsStyle="warning">
                    <strong>No cases found!</strong>
                </Alert>
            );
        } else {
            taskCases = _.map(this.state.tasks, (c) => {
                return <TaskCase case={c} scoreOpacityScale={self.scoreOpacityScale} />
            });
            stateHash = {
                ssoUsername: this.state.ssoUsername,
                roles: this.state.roles
            };
            return (
                <div>
                    {taskCases}
                    <Spacer />
                    <i className="fa fa-refresh cursor" style={{marginLeft: "6px"}} onClick={this.queryCases.bind(this, stateHash)}></i>
                </div>
            )
        }
    },
    genBtnGroupClass: function(opts) {
        var classSet = {
            'btn': true,
            'btn-default': true,
            'active': this.state[opts['stateVarName']] === opts['var']
        };
        return cx(classSet);
    },
    setScoreScale: function(min, max) {
        //this.scoreScale = d3.scale.quantize().domain([min, max]).range([100, 200, 300]);
        //this.scoreOpacityScale = d3.scale.quantize().domain([min, max]).range([.25, 1]);
        this.scoreOpacityScale = d3.scale.linear().domain([min, max]).range([.25, 1]);
    },
    queryCases: function(args) {
        var opts, ssoUsername, _ref2;
        var self = this;
        // For loading cases and simulating tasks, taskId is really just the caseNumber for now
        var {taskId} = self.getParams();
        ssoUsername = args.ssoUsername;
        if ((ssoUsername == null) && ((_ref2 = Auth.getAuthedUser()) != null ? _ref2.resource : null) != null) {
            ssoUsername = Auth.getAuthedUser().resource.sso[0];
        }
        if (ssoUsername == null) {
            return;
        }
        ssoUsername = S(ssoUsername).replaceAll('"', '').s;
        opts = {
            path: '/cases',
            queryParams: [
                { name: 'ssoUsername', value: ssoUsername },
                { name: 'roles', value: args.roles },
                { name: 'admin', value: this.getQuery()['admin'] },
                { name: 'resourceProjection', value: "Minimal" }
            ]
        };
        this.setState({loading: true});
        this.get(opts)
            .then((results) => {
                var max, min, params, stateHash, topSevenCases, cases = results.cases, closedCases;
                _.each(cases, (c) => {
                    if(c.resource == null) {
                        console.error(JSON.stringify(c, null, ' '));
                    }
                });
                //self.casesById = _.zipObject(_.map(cases, (c) => [c['resource']['resourceId'], c]));

                cases.sort((a, b) => b.resource.collaborationScore - a.resource.collaborationScore);
                // Remove all the Closed cases and append them to the end of the array
                closedCases = _.filter(cases, (c) => c.resource.status == "Closed");
                cases = _.filter(cases, (c) => c.resource.status != "Closed");
                cases = _.chain([cases, closedCases]).flatten().value();

                topSevenCases = cases.slice(0, 7);
                min = _.chain(topSevenCases).pluck('resource').pluck('collaborationScore').without(null).min().value();
                max = _.chain(topSevenCases).pluck('resource').pluck('collaborationScore').without(null).max().value();
                self.setScoreScale(min, max);
                stateHash = {
                    //'tasks': _.object(_.map(cases, (c) => [c['resource']['externalModelId'], c] )),
                    'tasks': cases.slice(0, 7),
                    'userRoles': results.userRoles,
                    'defaultRoles': results.defaultRoles,
                    'urlRoles': results.urlRoles,
                    'uql': results.uql,
                    'minScore': min,
                    'maxScore': max
                };
                self.setState(stateHash);

                // INFO -- Remember taskId is the caseNumber here
                if ((taskId == '' || (taskId == null) || (taskId == 'list')) && cases.length > 0) {
                    params = {
                        //taskId: cases[0]['resource']['externalModelId']
                        taskId: cases[0]['resource']['caseNumber']
                    };
                    this.transitionTo("tasks", params, self.getQuery());
                }
            })
            .catch((err) => console.error(`Could not load cases: ${err.stack}`))
            .done(() => self.setState({loading: false}));
    },
    // http://javascript.tutorialhorizon.com/2014/09/13/execution-sequence-of-a-react-components-lifecycle-methods/
    componentDidMount: function() {
        var stateHash;
        stateHash = {
            ssoUsername: this.getQuery()['ssoUsername'],
            roles: this.getQuery()['roles'],
            taskId: this.getParams()['taskId']
        };
        this.setState(stateHash);
        this.queryCases(stateHash);
    },
    componentWillReceiveProps: function(nextProps) {
        var stateHash;
        if (this.getQuery()['ssoUsername'] != this.state.ssoUsername
            || this.getQuery()['roles'] != this.state.roles ) {
            // || this.getParams()['taskId'] != this.state.taskId) {
            stateHash = {
                ssoUsername: this.getQuery()['ssoUsername'],
                roles: this.getQuery()['roles'],
                taskId: this.getParams()['taskId']
            };
            this.setState(stateHash);
            this.queryCases(stateHash);
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
    render: function() {
        //this.state.declinedTasks.when({
        //   pending: function() {
        //       console.debug("pending");
        //   },
        //   failed: function(error) {
        //       console.debug("error");
        //   },
        //   done: function(results) {
        //       console.debug("declinedTasks: " + JSON.stringify(results));
        //   }
        //});
        var { taskId } = this.getParams();
        return (
            <div className='row'>
                <div className='col-md-3'>{this.genTaskElements()}</div>
                <div className='col-md-9'>
                    <RoutingRoles
                        roles={this.state.userRoles}
                        defaultRoles={this.state.defaultRoles}
                        urlRoles={this.state.urlRoles}></RoutingRoles>
                    <Spacer />
                    <Task caseNumber={taskId} queryTasks={this.queryCases.bind(this, this.props)}></Task>
                </div>
            </div>
        )
    }
});

module.exports = Component;
