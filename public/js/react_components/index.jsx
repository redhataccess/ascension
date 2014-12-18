var React                   = require('react/addons');
if (typeof window !== 'undefined') {
    window.React = React;
}
var Router                  = require('react-router/dist/react-router');
var { Route, Redirect, RouteHandler, Link, NotFoundRoute, DefaultRoute } = Router;
//var ReactTransitionGroup    = React.addons.TransitionGroup;
//var About                   = require('./about.jsx');
var Admin                   = require('./admin/admin.coffee');
var Tasks                   = require('./collections/tasks.jsx');
var Task                    = require('./models/task/task.jsx');
var Auth                    = require('./auth/auth.coffee');
var WebUtilsMixin           = require('./mixins/webUtilsMixin.coffee');

var Alert                   = require('react-bootstrap/Alert');

// This will load inline in javascript however it appears while it works fine in the brower, Chrome doesn't render those
// In the chrome console making debugging hard
//require("style!css!less!../../stylesheets/main.less");
// Just load the less which we have bound to the extract-text plusin
require("../../stylesheets/main.less");

var Dashboard = React.createClass({
    displayName: 'Dashboard',
    mixins: [Router.State],
    //getInitialState: function() {
    //    return {
    //        query: this.props.query,
    //        params: this.props.params
    //    };
    //},
    //componentWillReceiveProps: function(nextProps) {
    //    this.setState({
    //        query: nextProps.query,
    //        params: nextProps.params
    //    });
    //},
    render: function() {
        var { taskId } = this.getParams();
        console.debug(`Rendering the dashboard with taskId: ${taskId}`);
        //<Task id='tasksContainer' key='tasks' query={this.state.query} params={this.state.params}></Task>
        return (
            <div key='mainDashboard'>
                <Tasks id='tasksContainer' key='tasks' params={{taskId: taskId}}></Tasks>
            </div>
        )
    }
});

var App = React.createClass({
    displayName: 'App',
    mixins: [WebUtilsMixin, Router.State],
    getInitialState: function() {
        return {
            'authedUser': Auth.authedUser,
            'scopedUser': Auth.scopedUser,
            'authFailed': false,
            'scopedFailed': false
        };
    },
    queryScopedUser: function(ssoUsername) {
        var self, userPromise;
        self = this;
        userPromise = this.getUser(ssoUsername);
        if (userPromise != null) {
            userPromise.done((user) => {
                if (_.isArray(user)) {
                    user = user[0];
                }
                if ((user != null ? user['externalModelId'] : void 0) != null) {
                    console.debug("Setting scoped user to: " + user['resource']['firstName']);
                    Auth.setScopedUser(user);
                    self.setState({
                        'scopedUser': user,
                        'scopedFailed': false
                    });
                } else {
                    Auth.setScopedUser(void 0);
                    self.setState({
                        'scopedUser': user,
                        'scopedFailed': true
                    });
                    console.error(`User ${JSON.stringify(user, null, ' ')} has no id`);
                }
            }, (err) => {
                Auth.setScopedUser(void 0);
                self.setState({
                    'scopedUser': void 0,
                    'scopedFailed': true
                });
            })
        }
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
        var self, ssoUsername, userPromise;
        self = this;
        ssoUsername = this.getRhUserCookie();
        if (ssoUsername != null) {
            userPromise = this.getUser(ssoUsername);
            if (userPromise != null) {
                userPromise.done(function(user) {
                    if (_.isArray(user)) {
                        user = user[0];
                    }
                    if ((user != null ? user['externalModelId'] : void 0) != null) {
                        console.debug("Setting authed user to: " + user['resource']['firstName']);
                        Auth.setAuthedUser(user);
                        self.setState({
                            'authedUser': user,
                            'authFailed': false
                        });
                    } else {
                        Auth.setAuthedUser(void 0);
                        self.setState({
                            'authedUser': void 0,
                            'authFailed': true
                        });
                        console.error("User: " + (JSON.stringify(user, null, ' ')) + " has no id");
                    }
                }, function(err) {
                    Auth.setAuthedUser(void 0);
                    self.setState({
                        'authedUser': void 0,
                        'authFailed': true
                    });
                    console.error(err);
                });
            }
        } else {
            Auth.setAuthedUser(void 0);
            self.setState({
                'authedUser': void 0,
                'authFailed': true
            });
        }
        if ((this.getQuery().ssoUsername != null) && this.getQuery().ssoUsername !== '') {
            this.queryScopedUser(this.props.query.ssoUsername);
        } else {
            Auth.setScopedUser(void 0);
            self.setState({
                'scopedUser': void 0,
                'scopedFailed': false
            });
        }
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
            return <RouteHandler />
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
                            <li key='dashboard'>
                                <Link
                                    to='dashboard'
                                    key='linkDashboard'
                                    params={{'taskId': 'tasks'}}>Dashboard</Link>
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

//<Route
//    key='task'
//    name='task'
//    path='task/:taskId'
//    handler={Task}></Route>
var routes = (
    <Route
        key='app'
        name='app'
        path='/'
        handler={App}>
        <Route
            key='dashboard'
            name='dashboard'
            path='support/:taskId'
            handler={Dashboard}></Route>
        <Route
            key='admin'
            name='admin'
            handler={Admin}></Route>
        <NotFoundRoute key='notFound' handler={Dashboard}></NotFoundRoute>
        <DefaultRoute key='defaultRoute' handler={Dashboard}></DefaultRoute>
    </Route>
);

Router.run(routes, Router.HashLocation, (Handler) => {
   React.render(<Handler />, document.getElementById('ascension-view'))
});

module.exports = App;
