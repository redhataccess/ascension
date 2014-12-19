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
var Spacer                  = require('../utils/spacer.jsx');
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
    // CS FTW -- would just be one line -- 'task-own': Auth.getAuthedUser()? and (t['owner']?['id'] is Auth.getAuthedUser()?['externalModelId'])
    isOwner: (theTask) => {
        if (Auth.getAuthedUser() != null
            && theTask && theTask['owner'] && theTask['owner']['id'] == Auth.getAuthedUser()['externalModelId']) {
            return true;
        }
        return false;
    },
    genTaskClass: function(theTask) {
        var classSet = {
            'task': true,
            'task100': true,
            'task-own': this.isOwner(theTask),
            'case': theTask['type'] === 'CASE',
            'kcs': theTask['type'] === ''
        };
        return cx(classSet);
    },
    genTaskStyle: function(theTask) {
        return {
            opacity: this.scoreOpacityScale(theTask.score)
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
        this.transitionTo("dashboard", params, queryParams);
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
        return theCase.caseNumber;
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
    genTaskStateIcon: function(theTask) {
        var iconMapping = TaskIconMapping[theTask.status];
        return 'fa ' + (iconMapping != null ? iconMapping.icon : void 0) || 'fa-medkit';
    },
    genEntityDescription: function(theTask, theCase) {
        if ((theTask.type === 'CASE') || (theTask.type === 'KCS' && theTask.resourceOperation === ResourceOpEnum.CREATE_KCS.name)) {
            return S(theCase.subject).truncate(50).s;
        } else {
            return '';
        }
    },
    // TODO - ref theTask and theCase everywhere
    genTaskElements: function() {
        var elems,
            tasks,
            theCase,
            theTask,
            self = this;
        tasks = _.values(this.state['tasks']);
        tasks.sort((a, b) => b.resource.score - a.resource.score);
        //#(TaskMetaData {task: t, key: 'taskMetaData'}, [])
        elems = _.map(tasks, (t) => {
            theCase = t.resource.resource.resource;
            theTask = t.resource;
            return (
                <div
                    id={theTask.externalModelId}
                    className={self.genTaskClass(theTask)}
                    style={self.genTaskStyle(theTask)}
                    key={theTask.externalModelId}
                    score={theTask.score}
                    onClick={self.taskClick.bind(self, t)}>
                    <TaskAction task={t} key='taskAction' absolute={true}></TaskAction>
                    <span className='task-entity-state-icon'>
                        <IconWithTooltip
                            iconName={self.genEntityStateIcon(theTask, theCase)}
                            tooltipPrefix={theTask.type.toUpperCase()}
                            tooltipText={theCase.internalStatus || null}></IconWithTooltip>
                    </span>
                    <span className='task-entity-description'>{self.genEntityDescription(theTask, theCase)}</span>
                    <span className='task-bid'>{self.genTaskBid(theCase)}</span>
                    <span className='task-stat-icon'>
                        <IconWithTooltip
                            iconName={self.genTaskStateIcon(theTask)}
                            tooltipPrefix="Task"
                            tooltipText={TaskIconMapping[theTask.status] || '?'}></IconWithTooltip>
                    </span>
               </div>
           )
        });
        return elems;
    },
    genBtnGroupClass: function(opts) {
        var classSet = {
            'btn': true,
            'btn-default': true,
            'active': this.state[opts['stateVarName']] === opts['var']
        };
        return cx(classSet);
    },
    //genBtnGroupLayout: function() {
    //    var layoutModes = ['masonry', 'vertical'];
    //    var self = this;
    //    return _.map(layoutModes, (layoutMode) => {
    //        return <button
    //            key={layoutMode}
    //            type='button'
    //            className={self.genBtnGroupClass({stateVarName: 'layoutMode', 'var': layoutMode})}
    //            onClick={self.changeLayout.bind(self, layoutMode)}>{layoutMode}</button>
    //    });
    //},
    //genBtnGroupSort: function() {
    //    var sortBys;
    //    sortBys = ['score', 'sbt'];
    //    return _.map(sortBys, (function(_this) {
    //        return function(sortBy) {
    //            return button({
    //                key: sortBy,
    //                type: 'button',
    //                className: _this.genBtnGroupClass({
    //                    stateVarBy: 'sortBy',
    //                    'var': sortBy
    //                }),
    //                onClick: _this.changeSort.bind(_this, sortBy)
    //            }, [sortBy]);
    //        };
    //    })(this));
    //},
    //genBtnGroupSbrFilter: function(sbrs) {
    //    var btns;
    //    btns = _.map(sbrs, (function(_this) {
    //        return function(sbr) {
    //            return button({
    //                key: sbr,
    //                type: 'button',
    //                className: _this.genBtnGroupClass({
    //                    stateVarBy: 'sbr',
    //                    'var': sbr
    //                }),
    //                onClick: _this.filterBySbr.bind(_this, sbr)
    //            }, [sbr]);
    //        };
    //    })(this));
    //    btns.unshift(button({
    //        key: 'Show All',
    //        type: 'button',
    //        className: this.genBtnGroupClass({
    //            stateVarBy: 'sbr',
    //            'var': 'Show All'
    //        }),
    //        onClick: this.clearFilter.bind(this)
    //    }, ['Show All']));
    //    return btns;
    //},
    //opacify: function() {
    //    return $('.task').each((function(_this) {
    //        return function(idx, itemElem) {
    //            var task, _id;
    //            _id = $(itemElem).attr('id');
    //            task = _this.state['tasks'][_id];
    //            return $(itemElem).css({
    //                'opacity': _this.scoreOpacityScale(task['score']),
    //                '-webkit-transition': 'opacity 0.5s ease-in-out',
    //                '-moz-transition': 'opacity 0.5s ease-in-out',
    //                '-o-transition': 'opacity 0.5s ease-in-out',
    //                'transition': 'opacity 0.5s ease-in-out'
    //            });
    //        };
    //    })(this));
    //},
    setScoreScale: function(min, max) {
        this.scoreScale = d3.scale.quantize().domain([min, max]).range([100, 200, 300]);
        this.scoreOpacityScale = d3.scale.linear().domain([min, max]).range([.25, 1]);
    },
    queryTasks: function() {
        var opts, ssoUsername, _ref1, _ref2;
        var self = this;
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
            path: '/tasks',
            queryParams: [
                {
                    name: 'ssoUsername',
                    value: ssoUsername
                }, {
                    name: 'admin',
                    value: this.getQuery()['admin']
                }, {
                    name: 'limit',
                    value: 7
                }
            ]
        };
        this.get(opts)
            .then((tasks) => {
                var max, min, params, queryParams, stateHash;
                self.tasksById = _.zipObject(_.map(tasks, (t) => [t['resource']['resourceId'], t]));
                min = _.chain(tasks).pluck('resource').pluck('score').min().value();
                max = _.chain(tasks).pluck('resource').pluck('score').max().value();
                self.setScoreScale(min, max);
                stateHash = {
                    'tasks': _.object(_.map(tasks, (t) => [t['resource']['externalModelId'], t] )),
                    'minScore': min,
                    'maxScore': max
                };
                self.setState(stateHash);
                if ((self.getParams()['taskId'] === '' || (self.getParams()['taskId'] == null)) && tasks.length > 0) {
                    params = {
                        taskId: tasks[0]['resource']['externalModelId']
                    };
                    queryParams = {
                        ssoUsername: self.getQuery().ssoUsername,
                        admin: self.getQuery().admin
                    };
                    this.transitionTo("dashboard", params, queryParams);
                }
            })
            .catch((err) => console.error(`Could not load tasks: ${err.stack}`))
            .done();
    },
    componentDidMount: function() {
        this.queryTasks();
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
        return (
            <div className='row'>
                <div className='col-md-3'>{this.genTaskElements()}</div>
                <div className='col-md-9'>
                    <Task params={this.params} queryTasks={this.queryTasks.bind(this, this.props)}></Task>
                </div>
            </div>
        )
    }
});

module.exports = Component;
