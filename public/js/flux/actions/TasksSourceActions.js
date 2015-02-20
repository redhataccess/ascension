var Marty           	= require('marty');
var TasksConstants   	= require('../constants/TasksConstants');

var Actions = Marty.createActionCreators({
    receiveTasks: TasksConstants['RECEIVE_TASKS'](function (opts,results) {
        this.dispatch(opts,results);
    })
});
module.exports = Actions;
