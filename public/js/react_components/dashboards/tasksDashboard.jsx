var React                   = require('react/addons');
var Router                  = require('react-router/dist/react-router');
var { Route, Redirect, RouteHandler, Link, NotFoundRoute, DefaultRoute } = Router;
var Tasks                   = require('../collections/tasks.jsx');

var TasksDashboard = React.createClass({
    displayName: 'TasksDashboard',
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
        var { userId } = this.getQuery();
        console.debug(`Rendering the tasksDashboard.jsx with userId: ${userId} and taskId: ${taskId}`);
        //<Task id='tasksContainer' key='tasks' query={this.state.query} params={this.state.params}></Task>
        return (
            <div key='tasksDashboard'>
                <Tasks id='tasksContainer' key='tasks' params={{userId: userId, taskId: taskId}}></Tasks>
            </div>
        )
    }
});

module.exports = TasksDashboard;
