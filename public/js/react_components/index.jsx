var React                   = require('react/addons');
var Marty                   = require('marty');
if (typeof window !== 'undefined') {
    window.React = React;
    window.Marty = Marty;
}

//var Router                  = require('react-router/dist/react-router');
var Router                  = require('./router.jsx');
//var { Route, Redirect, RouteHandler, Link, NotFoundRoute, DefaultRoute} = Router;

//var ReactTransitionGroup    = React.addons.TransitionGroup;
//var About                   = require('./about.jsx');

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

//var routes = (
//    <Route
//        key='app'
//        name='app'
//        path='/'
//        handler={App}>
//            <Route
//                key='tasks'
//                name='tasks'
//                path='/tasks/:taskId'
//                handler={TasksDashboard}></Route>
//        <Route
//            key='admin'
//            name='admin'
//            handler={Admin}></Route>
//        <Route
//            key='users'
//            name='users'
//            handler={UserDashboard}></Route>
//        <NotFoundRoute key='notFound' handler={NotFoundHandler}></NotFoundRoute>
//        <DefaultRoute key='defaultRoute' handler={App}></DefaultRoute>
//    </Route>
//);
//
//Router.run(routes, Router.HashLocation, (Handler) => {
//   React.render(<Handler />, document.getElementById('ascension-view'))
//});

Router.run(function (Handler, state) {
   React.render(<Handler {...state.params} />, document.getElementById('ascension-view'))
});

//module.exports = App;
