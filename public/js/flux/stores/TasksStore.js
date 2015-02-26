var Marty                   = require('marty');
var _                       = require('lodash');
var TasksConstants           = require('../constants/TasksConstants');
var TaskAPI                 = require('../sources/TasksAPI');
var DeclinedTasksActions    = require('../../flux/actions/DeclinedTasksActions');
var DeclinedTasksAPI    = require('../../flux/sources/DeclinedTasksAPI');

var Store = Marty.createStore({
    name: 'Tasks Store',
    handlers: {
        receiveTasks: TasksConstants.RECEIVE_TASKS,
        invalidateTasks: TasksConstants.INVALIDATE_TASKS
    },
    getInitialState: function () {
        return {};
    },
    getTasks: function (opts) {
        var id = opts.ssoUsername + opts.taskId + opts.roles+ "";
        return this.fetch({
            id: id,
            locally: function () {
                return this.state.res;
            },
            remotely: function () {
                return TaskAPI.getTasks(opts);
            }
        });
    },


    receiveTasks: function (opts,results) {
        if(results != null) {
            var taskId = opts.taskId;
            var max, min, params, stateHash, topSevenCases, cases = results.cases, closedCases;
            _.each(cases, (c) => {
                if(c.resource == null) {
                    console.error(JSON.stringify(c, null, ' '));
                }
            });
            cases.sort((a, b) => b.resource.collaborationScore - a.resource.collaborationScore);

            //filtering 'Needs New Owner(NNO)' cases
            cases = _.filter(cases, (c) => !c.resource.escalateToGeo);

            //remove recently updated cases from local storage
            DeclinedTasksAPI.removeDeclinedTasks(cases,opts.ssoUsername);

            //ignore all the locally deferred cases
            var restCases = _.pluck(DeclinedTasksAPI._get(opts.ssoUsername), 'taskID');
            cases = _.filter(cases, (c) => !_.contains(restCases, c.resource.caseNumber));

            topSevenCases = cases.slice(0, 7);
            min = _.chain(topSevenCases).pluck('resource').pluck('collaborationScore').without(null).min().value();
            max = _.chain(topSevenCases).pluck('resource').pluck('collaborationScore').without(null).max().value();

            stateHash = {
                'tasks': topSevenCases,
                'userRoles': results.userRoles,
                'defaultRoles': results.defaultRoles,
                'urlRoles': results.urlRoles,
                'uql': results.uql,
                'minScore': min,
                'maxScore': max
            };
            this.state['res'] = stateHash;
            this.hasChanged();

        }
    },
    invalidateTasks: function () {
        delete this.state['res'];
        this.hasChanged();
    }

});
module.exports = Store;