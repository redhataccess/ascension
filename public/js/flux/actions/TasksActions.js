var Marty                   = require('marty');
var TasksConstants   = require('../constants/TasksConstants');
var TasksAPI        = require('../sources/TasksAPI');


var Actions = Marty.createActionCreators({
    receiveTasks: TasksConstants['RECEIVE_TASKS'](function (opts) {
        TasksAPI.getTasks(opts);
    }),
    invalidateTasks: TasksConstants['INVALIDATE_TASKS'](function () {
        this.dispatch();
    })
});
module.exports = Actions;