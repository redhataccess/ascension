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
    declineTask: function (task) {
        var declinedTasks = (this._isDefined(NAMESPACE) && this._get(NAMESPACE)) || {};
        // Extend/overwrite what is currently in local storage
        _.extend(declinedTasks, this._constructItem(task));
        // now update the local storage
        this._set(NAMESPACE, declinedTasks);
        DeclinedTasksSourceActions.declineTask(task)
    },
    getAllDeclinedTasks: function () {
        return this._get(NAMESPACE);
    },
    removeDeclinedTask: function (task) {
        var declinedTasks = this.get(NAMESPACE) || {};
        delete declinedTasks[task.resource.caseNumber];
        this._set(NAMESPACE, declinedTasks);
        DeclinedTasksSourceActions.removeDeclinedTask(task)
    }
});

module.exports = API;