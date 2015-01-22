var React                   = require('react/addons');
if (typeof window !== 'undefined') {
    window.React = React;
}
var Router                  = require('react-router/dist/react-router');
var { Route, Redirect, RouteHandler, Link, NotFoundRoute, DefaultRoute} = Router;
//var ReactTransitionGroup    = React.addons.TransitionGroup;
//var About                   = require('./about.jsx');
var Admin                   = require('./admin/admin.coffee');
var Task                    = require('./models/task/task.jsx');
var Auth                    = require('./auth/auth.coffee');
var WebUtilsMixin           = require('./mixins/webUtilsMixin.coffee');
var AuthUtilsMixin          = require('./mixins/authUtilsMixin.coffee');
var TasksDashboard          = require('./dashboards/tasksDashboard.jsx');
var UserDashboard           = require('./dashboards/userDashboard.jsx');

var Alert                   = require('react-bootstrap/Alert');

// This will load inline in javascript however it appears while it works fine in the brower, Chrome doesn't render those
// In the chrome console making debugging hard
//require("style!css!less!../../stylesheets/main.less");
// Just load the less which we have bound to the extract-text plusin
require("../../stylesheets/main.less");


// This is a webpack thing where you can specify env vars to be substituted in the resulting js output.  The
// ENVIRONMENT is driven from the webpack configuration.
window.redHatUrlPrefix = '/etc/os1/ascension';
if (ENVIRONMENT == 'development') {
    window.redHatUrlPrefix = '';
} else {
    window.redHatUrlPrefix = '/etc/os1/ascension';
}

var NotFoundHandler = React.createClass({
    displayName: 'NotFoundHandler',
    render: function() {
        return <span>Page not found!</span>
    }
});

var App = React.createClass({
    displayName: 'App',
    mixins: [AuthUtilsMixin, WebUtilsMixin, Router.State, Router.Navigation],
    getInitialState: function() {
        return {
            'authedUser': Auth.authedUser,
            'authFailed': false
            //'scopedUser': Auth.scopedUser,
            //'scopedFailed': false
        };
    },
    componentDidMount: function() {
        var self, ssoUsername, userPromise, params;
        self = this;
        // For the moment, there is no use for a scoped user, the url params will just assume calls under that ssoUsername
        //ssoUsername = this.getRhUserCookie() || this.getQuery().ssoUsername;
        ssoUsername = this.getRhUserCookie();
        userPromise = this.queryUser(ssoUsername);
        userPromise.then(function(user) {
            Auth.setAuthedUser(user);
            self.setState({
                'authedUser': user,
                'authedFailed': false
            });
            params = {
                //userId: user.resource.sso[0]
                //userId: user.externalModelId
                taskId: self.getParams().taskId || 'list'
            };
            // If we are on any path but users, direct the user to his/her task list
            if (self.getPath() != "/users") {
                self.transitionTo("tasks", params, self.getQuery());
            }
        })
        .catch(function(err) {
            Auth.setAuthedUser(void 0);
            self.setState({
                'authedUser': void 0,
                'authFailed': true
            });
            console.error(err);
        })
        .done();
    },
    genAuthenticationElement: function() {
        if (Auth.getAuthedUser() != null) {
            return <p className='navbar-text' key='navbar-right'>
            {`Logged in as ${Auth.getAuthedUser()['resource']['firstName']} ${Auth.getAuthedUser()['resource']['lastName']}`}
            </p>
        } else {
            return <a target='_blank' href='https://gss.my.salesforce.com' key='sso'>
                {`https://gss.my.salesforce.com`}
            </a>;
        }
    },
    genMainContents: function() {
        if (this.state.authFailed === true) {
            return (
                <Alert bsStyle='warning' key='alert'>
                {`Not authenticated, please login @ `}
                <a target='_blank' href='https://gss.my.salesforce.com' key='sso'>{`https://gss.my.salesforce.com`}</a>
                {` and refresh.`}
                </Alert>
            )
        } else if (this.state.scopedFailed === true) {
            return (
                <Alert bsStyle='warning' key='alert'>
                {`Scoped User failed to load, make sure you typed in the rhn-support-<name> correctly`}
                </Alert>
            )
        } else {
            return <RouteHandler />;
        }
    },
    render: function() {
        return (
            <div>
                <div className='navbar navbar-default' role='navigation' key='navigation'>
                    <div className='navbar-header' key='navHeader'>
                        <button
                            type='button'
                            className='navbar-toggle collapsed'
                            dataToggle='collapse'
                            dataTarget="#bs-example-navbar-collapse-1"
                            key='navCollapse'>
                            <span className='sr-only' key='srNav'>Toggle Navigation</span>
                            <span className='icon-bar' key='srNavIcon1'></span>
                            <span className='icon-bar' key='srNavIcon2'></span>
                            <span className='icon-bar' key='srNavIcon3'></span>
                        </button>
                        <a className='navbar-brand' href='#' key='navBar'>Ascension</a>
                    </div>
                    <div
                        className='collapse navbar-collapse'
                        id='bs-example-navbar-collapse-1'
                        key='navCollapse'>
                        <ul className='nav navbar-nav' key='navbarNav'>
                            <li key='task'>
                             <Link
                                 to='tasks'
                                 key='linkTask'
                                 params={{'taskId': 'list'}}>Tasks</Link>
                            </li>
                            {/*<li>
                                <Link
                                    to='admin'
                                    key='linkAdmin'>Admin</Link>
                            </li>
                            */}
                            <li>
                                <Link
                                    to='users'
                                    key='linkUsers'>Users</Link>
                            </li>
                        </ul>
                        <ul className='nav navbar-nav navbar-right' key='authInfo'>
                            <li key='authLi'>{this.genAuthenticationElement()}</li>
                        </ul>
                    </div>
                </div>
                <div className='container-ascension' key='mainContainer'>
                {this.genMainContents()}
                </div>
            </div>
        )
    }
});

var routes = (
    <Route
        key='app'
        name='app'
        path='/'
        handler={App}>
            <Route
                key='tasks'
                name='tasks'
                path='/tasks/:taskId'
                handler={TasksDashboard}></Route>
        <Route
            key='admin'
            name='admin'
            handler={Admin}></Route>
        <Route
            key='users'
            name='users'
            handler={UserDashboard}></Route>
        <NotFoundRoute key='notFound' handler={NotFoundHandler}></NotFoundRoute>
        <DefaultRoute key='defaultRoute' handler={App}></DefaultRoute>
    </Route>
);

Router.run(routes, Router.HashLocation, (Handler) => {
   React.render(<Handler />, document.getElementById('ascension-view'))
});

module.exports = App;
