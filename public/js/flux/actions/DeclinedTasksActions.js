var Marty                   = require('marty');
var DeclinedTaskConstants   = require('../constants/DeclinedTasksConstants');
var DeclinedTasksAPI        = require('../sources/DeclinedTasksAPI');


var Actions = Marty.createActionCreators({
    declineTask: DeclinedTaskConstants['DECLINE_TASK_CLICK'](function (task,key) {
        DeclinedTasksAPI.declineTask(task,key);
    }),
    removeDeclinedTasks: DeclinedTaskConstants['REMOVE_DECLINED_TASKS'](function (tasks) {
        DeclinedTasksAPI.removeDeclinedTasks(tasks);
    }),
    invalidateTasks: DeclinedTaskConstants['INVALIDATE_TASKS'](function (tasks) {
        this.dispatch(tasks);
    })
});
module.exports = Actions;
