var Marty                   = require('marty');
var _                       = require('lodash');
var Q                       = require('q');
Q.longStackSupport 			= true
var TasksSourceActions       = require('../actions/TasksSourceActions');
var AppConstants    		= require('../constants/AppConstants');

var API = Marty.createStateSource({
    type: 'http',
    getTasks: function (opts) {
        var data1 = {
            ssoUsername: opts.ssoUsername == null || opts.ssoUsername == undefined ? "":opts.ssoUsername,
            roles: opts.roles == null || opts.roles == undefined ? "":opts.roles,
            admin:opts.admin == null || opts.admin == undefined ? "":opts.admin,
            resourceProjection:opts.resourceProjection == null || opts.resourceProjection == undefined ? "":opts.resourceProjection
        };
        return Q($.ajax({url: `${AppConstants.getUrlPrefix()}/cases`, data: data1})
            .then((results) => {
                return TasksSourceActions.receiveTasks(opts,results)
            })
        )
    }
});

module.exports = API;