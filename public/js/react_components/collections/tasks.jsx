var React                   = require('react/addons');
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
var TaskIconMapping         = require('../utils/taskIconMapping.coffee');
var TaskTypeEnum            = require('../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');
var TaskActionsEnum         = require('../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');
var ResourceOpEnum            = require('../../../../src/com/redhat/ascension/rules/enums/ResourceOpEnum.coffee');
var TaskStateEnum           = require('../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');
var Auth                    = require('../auth/auth.coffee');
var TaskAction              = require('../models/task/taskAction.jsx');
//var TaskMetaData            = require('../models/task/taskMetaData.jsx');
var TaskState               = require('../models/task/taskState.jsx');
// TaskCase represents the virtual mapping of case -> task for sprint 1
var TaskCase                = require('../models/task/taskCase.jsx');
var Spacer                  = require('react-redhat/Spacer');
//var IconWithTooltip         = require('../utils/iconWithTooltip.jsx');
var IconWithTooltip         = require('react-redhat/IconWithTooltip');


var Component = React.createClass({
    displayName: 'Tasks',
    mixins: [AjaxMixin, Router.State, Router.Navigation],
    getInitialState: function() {
        return {
            'loading': false,
            'tasks': [],
            'minScore': 0,
            'maxScore': 0,
            'layoutMode': this.props.layoutMode || 'masonry',
            'sortBy': this.props.sortBy || 'score',
            'items': [{}, {}]
        };
    },
    // TODO - ref theTask and theCase everywhere
    genTaskElements: function() {
        var tasks = _.values(this.state['tasks']);
        var self = this;
        tasks.sort((a, b) => b.resource.score - a.resource.score);
        return _.map(tasks, (c) => {
            return <TaskCase case={c} scoreOpacityScale={self.scoreOpacityScale} />
        });
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
        this.scoreScale = d3.scale.quantize().domain([min, max]).range([100, 200, 300]);
        this.scoreOpacityScale = d3.scale.linear().domain([min, max]).range([.25, 1]);
    },
    //queryTasks: function() {
    //    var opts, ssoUsername, _ref1, _ref2;
    //    var self = this;
    //    ssoUsername = void 0;
    //    if (this.getQuery().ssoUsername != null) {
    //        ssoUsername = this.getQuery().ssoUsername;
    //    } else if (((_ref1 = Auth.getScopedUser()) != null ? _ref1.resource : void 0) != null) {
    //        ssoUsername = Auth.getScopedUser().resource.sso[0];
    //    } else if (((_ref2 = Auth.getAuthedUser()) != null ? _ref2.resource : void 0) != null) {
    //        ssoUsername = Auth.getAuthedUser().resource.sso[0];
    //    }
    //    if (ssoUsername === void 0) {
    //        return;
    //    }
    //    ssoUsername = S(ssoUsername).replaceAll('"', '').s;
    //    opts = {
    //        path: '/tasks',
    //        queryParams: [
    //            {
    //                name: 'ssoUsername',
    //                value: ssoUsername
    //            }, {
    //                name: 'admin',
    //                value: this.getQuery()['admin']
    //            }, {
    //                name: 'limit',
    //                value: 7
    //            }
    //        ]
    //    };
    //    this.get(opts)
    //        .then((tasks) => {
    //            var max, min, params, queryParams, stateHash;
    //            var {taskId} = self.getParams();
    //            self.tasksById = _.zipObject(_.map(tasks, (t) => [t['resource']['resourceId'], t]));
    //            min = _.chain(tasks).pluck('resource').pluck('score').min().value();
    //            max = _.chain(tasks).pluck('resource').pluck('score').max().value();
    //            self.setScoreScale(min, max);
    //            stateHash = {
    //                'tasks': _.object(_.map(tasks, (t) => [t['resource']['externalModelId'], t] )),
    //                'minScore': min,
    //                'maxScore': max
    //            };
    //            self.setState(stateHash);
    //
    //            if ((taskId == '' || (taskId == null) || (taskId == 'list')) && tasks.length > 0) {
    //                params = {
    //                    taskId: tasks[0]['resource']['externalModelId']
    //                };
    //                queryParams = {
    //                    ssoUsername: self.getQuery().ssoUsername,
    //                    admin: self.getQuery().admin
    //                };
    //                console.debug(`transitioning to task with params: ${JSON.stringify(params)}`);
    //                this.transitionTo("tasks", params, queryParams);
    //            }
    //        })
    //        .catch((err) => console.error(`Could not load tasks: ${err.stack}`))
    //        .done();
    //},
    queryCases: function() {
        var opts, ssoUsername, _ref1, _ref2;
        var self = this;
        // For loading cases and simulating tasks, taskId is really just the caseNumber for now
        var {taskId} = self.getParams();
        ssoUsername = void 0;
        if (this.getQuery().ssoUsername != null) {
            ssoUsername = this.getQuery().ssoUsername;
        } else if (((_ref1 = Auth.getScopedUser()) != null ? _ref1.resource : void 0) != null) {
            ssoUsername = Auth.getScopedUser().resource.sso[0];
        } else if (((_ref2 = Auth.getAuthedUser()) != null ? _ref2.resource : void 0) != null) {
            ssoUsername = Auth.getAuthedUser().resource.sso[0];
        }
        if (ssoUsername === void 0) {
            return;
        }
        ssoUsername = S(ssoUsername).replaceAll('"', '').s;
        opts = {
            path: '/cases',
            queryParams: [
                {
                    name: 'ssoUsername',
                    value: ssoUsername
                },
                {
                    name: 'admin',
                    value: this.getQuery()['admin']
                },
                {
                    name: 'limit',
                    value: 7
                }
            ]
        };
        this.get(opts)
            .then((cases) => {
                var max, min, params, queryParams, stateHash;
                self.casesById = _.zipObject(_.map(cases, (c) => [c['resource']['resourceId'], c]));
                min = _.chain(cases).pluck('resource').pluck('collaborationScore').min().value();
                max = _.chain(cases).pluck('resource').pluck('collaborationScore').max().value();
                self.setScoreScale(min, max);
                stateHash = {
                    'tasks': _.object(_.map(cases, (c) => [c['resource']['externalModelId'], c] )),
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
                    queryParams = {
                        ssoUsername: self.getQuery().ssoUsername,
                        admin: self.getQuery().admin
                    };
                    console.debug(`transitioning to case with params: ${JSON.stringify(params)}`);
                    this.transitionTo("tasks", params, queryParams);
                }
            })
            .catch((err) => console.error(`Could not load cases: ${err.stack}`))
            .done();
    },
    componentDidMount: function() {
        this.queryCases();
    },
    //componentWillReceiveProps: function(nextProps) {
    //    if ((!_.isEqual(this.props.query.ssoUsername, nextProps.query.ssoUsername))
    //        || (!_.isEqual(this.props.params._id, nextProps.params._id))) {
    //        this.setState({
    //            query: nextProps.query,
    //            params: nextProps.params
    //        });
    //        return this.queryTasks(nextProps);
    //    }
    //},
    //handleAdd: function() {
    //    var items;
    //    items = this.state.items;
    //    items.push({});
    //    this.setState({
    //        items: items
    //    });
    //    console.debug("State now has: " + this.state.items.length + " items");
    //},
    render: function() {
        var { taskId } = this.getParams();
        var { userId } = this.getQuery();
        console.debug(`Rendering the tasks.jsx with userId: ${userId} and taskId: ${taskId}`);
        return (
            <div className='row'>
                <div className='col-md-3'>{this.genTaskElements()}</div>
                <div className='col-md-9'>
                    <Task params={this.params} queryTasks={this.queryCases.bind(this, this.props)}></Task>
                </div>
            </div>
        )
    }
});

module.exports = Component;
