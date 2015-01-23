var Marty                   = require('marty');
var _                       = require('lodash');
var DeclinedTasksConstants  = require('../constants/DeclinedTasksConstants');
var DeclinedTasksAPI        = require('../sources/DeclinedTasksAPI');

var Store = Marty.createStore({
    name: 'Decline Tasks',
    handlers: {
        declineTask: DeclinedTasksConstants.DECLINE_TASK_CLICK,
        addDeclinedTasks: DeclinedTasksConstants.ADD_DECLINED_TASKS,
        removeDeclinedTask: DeclinedTasksConstants.REMOVE_DECLINED_TASK,
        invalidateTasks: DeclinedTasksConstants.INVALIDATE_TASKS
    },
    getInitialState: function () {
        return DeclinedTasksAPI.getAllDeclinedTasks() || {};
    },
    declineTask: function (task) {
        this.state[task.resource.caseNumber] = task;
        DeclinedTasksAPI.declineTask(task);
        this.hasChanged();
    },
    removeDeclinedTask: function (task) {
        delete this.state[task.resource.caseNumber];
        DeclinedTasksAPI.removeDeclinedTask(task);
        this.hasChanged();
    },
    getAll: function () {
        return this.fetch({
            id: 'all-declined-tasks',
            locally: function () {
                if (this.hasAlreadyFetched('all-declined-tasks')) {
                    return this.state;
                }
            },
            remotely: function () {
                return DeclinedTasksAPI.getAllDeclinedTasks();
            }
        });
    },
    addDeclinedTasks: function (tasks) {
        this.state = _.object(_.map(tasks, function (t) { return [t.resource.caseNumber, t]; }));
        this.hasChanged();
    },
    invalidateTasks: function(tasks) {
        var mutated = false,
            taskMap, overlappingTasks, overlappingTaskMap;
        //var taskIds = _.chain(tasks).pluck('externalModelId').value();
        // Map the incoming tasks
        //taskMap = _.object(_.map(tasks, (t) => [t.resource.caseNumber, t] ));
        // Filter the incoming tasks against the declined tasks to get an overlapping set
        overlappingTasks = _.chain(tasks).filter(function(t) { return _.contains(_.keys(this.state), t.resource.caseNumber);}).value();

        if (overlappingTasks.length > 0) {

            // Map that set for an easy lookup
            //overlappingTaskMap = _.object(_.map(overlappingTasks, function(t) {return [t.resource.caseNumber, t];} ));

            _.each(overlappingTasks, function(t) {
               if (this.state[t.resource.caseNumber].lastModified != t.resource.lastModified) {
                   delete this.state[t.resource.caseNumber];
                   DeclinedTasksAPI.removeDeclinedTask(t);
                   mutated = true;
               }
            });
            if (mutated == true) this.hasChanged();
        }


    }
});
module.exports = Store;

//var listener = UsersStore.addChangeListener(function () {
//    console.log('Users store changed');
//    listener.dispose();
//});