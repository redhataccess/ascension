var React                   = require('react/addons');
var Router                  = require('react-router/dist/react-router');
var WebUtilsMixin           = require('../mixins/webUtilsMixin.coffee');
var AuthUtilsMixin          = require('../mixins/authUtilsMixin.coffee');
var UserSearch              = require('react-redhat/usersearch/UserSearch');
var NavigationActions       = require('../actions/NavigationActions');

require('../../vendor/chosen_v1.3.0/chosen.jquery');
require('typeahead.js/dist/typeahead.bundle');

var Component = React.createClass({
    displayName: 'UserDashboard',
    mixins: [AuthUtilsMixin, WebUtilsMixin, Router.State],
    openUser: function(user) {
        var params = this.getParams(),
            query = this.getQuery();
        NavigationActions.navigateToTasks(user, params, query);
    },

    render: function() {
        return (
            <UserSearch openUser={this.openUser}></UserSearch>
        )
    }
});

module.exports = Component;
