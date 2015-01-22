var React                   = require('react/addons');
var Router                  = require('react-router/dist/react-router');
var WebUtilsMixin           = require('../mixins/webUtilsMixin.coffee');
var AuthUtilsMixin          = require('../mixins/authUtilsMixin.coffee');
var UserSearch              = require('react-redhat/usersearch/UserSearch');
var UdsMixin                = require('react-redhat/utils/UdsMixin');

var { Route, Redirect, RouteHandler, Link, NotFoundRoute, DefaultRoute } = Router;

require('../../vendor/chosen_v1.3.0/chosen.jquery');
require('typeahead.js/dist/typeahead.bundle');

var Component = React.createClass({
    displayName: 'UserDashboard',
    mixins: [AuthUtilsMixin, WebUtilsMixin, Router.State, Router.Navigation],
    //getInitialState: function() {
    //    return {
    //        'sbrs': [],
    //        'loading': false
    //    };
    //},
    openUser: function (user) {
        var query, params, self = this;
        params = { taskId: self.getParams().taskId || 'list' };
        // We may already have some query params in the navigation, so let's extend with the user to overwrite
        // what may be there and keep what may already be there
        query = _.extend(this.getQuery(), {ssoUsername: user.resource.sso[0]});
        this.transitionTo("tasks", params, query);
    },

    render: function() {
        return (
            <UserSearch openUser={this.openUser}></UserSearch>
        )
    }
});

module.exports = Component;
