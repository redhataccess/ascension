var Marty                   = require('marty');
var DeclinedTaskConstants   = require('../constants/DeclinedTasksConstants');
var DeclinedTasksAPI        = require('../sources/DeclinedTasksAPI');


var Actions = Marty.createActionCreators({
    declineTask: DeclinedTaskConstants['DECLINE_TASK_CLICK'](function (task) {
        this.dispatch(task)
    }),
    removeDeclinedTask: DeclinedTaskConstants['REMOVE_DECLINED_TASK'](function (task) {
        this.dispatch(task)
    })
});
module.exports = Actions;
