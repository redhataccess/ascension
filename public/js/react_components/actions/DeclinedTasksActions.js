var Marty                   = require('marty');
var DeclinedTaskConstants   = require('../constants/DeclinedTasksConstants');
var DeclinedTasksAPI        = require('../sources/DeclinedTasksAPI');


var Actions = Marty.createActionCreators({
    declineTask: DeclinedTaskConstants['DECLINE_TASK_CLICK'](function (task) {
        DeclinedTasksAPI.declineTask(task);
    }),
    removeDeclinedTask: DeclinedTaskConstants['REMOVE_DECLINED_TASK'](function (task) {
        DeclinedTasksAPI.removeDeclinedTask(task);
    }),
    invalidateTasks: DeclinedTaskConstants['INVALIDATE_TASKS'](function (tasks) {
        this.dispatch(tasks);
    })
});
module.exports = Actions;
