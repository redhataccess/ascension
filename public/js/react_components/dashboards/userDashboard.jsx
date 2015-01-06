var React                   = require('react/addons');
var Router                  = require('react-router/dist/react-router');
var Auth                    = require('../auth/auth.coffee');
var WebUtilsMixin           = require('../mixins/webUtilsMixin.coffee');
var AuthUtilsMixin          = require('../mixins/authUtilsMixin.coffee');
var { Route, Redirect, RouteHandler, Link, NotFoundRoute, DefaultRoute } = Router;

var Component = React.createClass({
    displayName: 'UserDashboard',
    mixins: [AuthUtilsMixin, WebUtilsMixin, Router.State, Router.Navigation],
    render: function() {
        var { userId } = this.getParams();
        return (
            <div>{`Welcome ${userId} view your `}
                <Link
                    to='tasks'
                    key='tasks'
                    params={{'userId': userId}}>Tasks</Link>
            </div>
        )
    }
});

module.exports = Component;
