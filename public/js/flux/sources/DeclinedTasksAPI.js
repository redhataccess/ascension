var Marty                   = require('marty');
var _                       = require('lodash');
var DeclinedTasksSourceActions    = require('../actions/DeclinedTasksSourceActions');

// TODO -- localStorage.js marty takes a namespace as an option, try that instead
var NAMESPACE = 'declinedTasks';
var API = Marty.createStateSource({
    type: 'localStorage',
    _isDefined: function(key) {
        var value = this.get(key);
        return !_.contains(["undefined", "null", null, void 0], value);
    },
    _set: function(key, value) {
      this.set(key, JSON.stringify(value))
    },
    _get: function(key) {
        if (this._isDefined(key)) {
            var value = this.get(key);
            return value && JSON.parse(value)
        }
        return null;
    },
    _constructItem: function (task) {
        var item = {};
        item[task.resource.caseNumber] = task.resource.lastModified;
        return item;
    },
    declineTask: function (task, key) {
        var locallyIgnoredTasks = (this._get(key) == null) ? [] : this._get(key);
        if (task != undefined) {
            locallyIgnoredTasks.push(task);
            this._set(key,_.uniq(locallyIgnoredTasks, 'taskID'));
        }
    },
    getAllDeclinedTasks: function (key) {
        //var declinedTasks = this._get(NAMESPACE);
        //DeclinedTasksSourceActions.addDeclinedTasks(declinedTasks)
        //return _.pluck(this._get(key), 'taskID');
    },
    removeDeclinedTasks: function (tasks,key) {
        var locallyIgnoredTasks = (this._get(key) == null) ? [] : this._get(key);
        var updatedLocalTasks =
            _.reject(locallyIgnoredTasks,function(t) {
                var flag = false;
                var i;
                for(i = 0; i<tasks.length && !flag; i++){
                    if (t.taskID == tasks[i].resource.caseNumber && t.lastModified != tasks[i].resource.lastModified){
                        flag = true;
                    }
                }
                if(flag) {
                    return t;
                }
            });
        this._set(key,updatedLocalTasks);
    }
});

module.exports = API;