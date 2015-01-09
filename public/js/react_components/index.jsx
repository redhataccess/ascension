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
            'scopedUser': Auth.scopedUser,
            'authFailed': false,
            'scopedFailed': false
        };
    },
    //componentWillReceiveProps: function(nextProps) {
    //    if (!_.isEqual(this.props.query.ssoUsername, nextProps.query.ssoUsername)) {
    //        this.queryScopedUser(nextProps.query.ssoUsername);
    //    } else if (nextProps.query.ssoUsername === '' || (nextProps.query.ssoUsername == null)) {
    //        Auth.setScopedUser(void 0);
    //        this.setState({
    //            'scopedUser': void 0,
    //            'scopedFailed': false
    //        });
    //    }
    //},
    componentDidMount: function() {
        var self, ssoUsername, userPromise, params, queryParams;
        self = this;
        ssoUsername = this.getRhUserCookie() || this.props.query.ssoUsername;
        userPromise = this.queryUser(ssoUsername);
        userPromise.then(function(user) {
            Auth.setAuthedUser(user);
            self.setState({
                'scopedUser': user,
                'scopedFailed': false
            });
            params = {
                //userId: user.resource.sso[0]
                //userId: user.externalModelId
                taskId: self.getParams().taskId || 'list'
            };
            self.transitionTo("tasks", params, self.getQuery());
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
                            <li>
                                <Link
                                    to='admin'
                                    key='linkAdmin'>Admin</Link>
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
        <NotFoundRoute key='notFound' handler={NotFoundHandler}></NotFoundRoute>
        <DefaultRoute key='defaultRoute' handler={App}></DefaultRoute>
    </Route>
);

Router.run(routes, Router.HashLocation, (Handler) => {
   React.render(<Handler />, document.getElementById('ascension-view'))
});

module.exports = App;
