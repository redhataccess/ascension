var Marty                   = require('marty');
var CaseConstants   		= require('../constants/CaseConstants');
var CaseAPI        			= require('../sources/CaseAPI');


var Actions = Marty.createActionCreators({
    refreshCase: CaseConstants['REFRESH_CASE'](function (caseNumber) {
        this.dispatch(caseNumber);
    }),
    // removeDeclinedTask: DeclinedTaskConstants['REMOVE_DECLINED_TASK'](function (task) {
    //     DeclinedTasksAPI.removeDeclinedTask(task);
    // }),
    // invalidateTasks: DeclinedTaskConstants['INVALIDATE_TASKS'](function (tasks) {
    //     this.dispatch(tasks);
    // })
});
module.exports = Actions;
