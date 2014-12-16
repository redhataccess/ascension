var React                       = require('react/addons');
var Router                      = require('react-router/dist/react-router');
var ActiveState                 = Router.ActiveState;
var AjaxMixin                   = require('../../mixins/ajaxMixin.coffee');
var TaskState                   = require('./taskState.jsx');
var TaskHeader                  = require('./taskHeader.jsx');
var TaskAction                  = require('./taskAction.jsx');
var TaskMetaData                = require('./taskMetaData.jsx');
var TaskDates                   = require('./taskDates.jsx');
var Spacer                      = require('../../utils/spacer.coffee');
var Case                        = require('../case/case.jsx');
var User                        = require('../user/user.jsx');
var Auth                        = require('../../auth/auth.coffee');
var DeclinedUsers               = require('./declinedUsers.jsx');
var PotentialOwners             = require('./potentialOwners.jsx');
var TaskActionsEnum             = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');
var TaskTypeEnum                = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');
var Well                        = require('react-bootstrap/Well');
var Alert                       = require('react-bootstrap/Alert');

var Component = React.createClass({
    displayName: 'Task',
    mixins: [AjaxMixin, ActiveState],
    getInitialState: function() {
        return {
            'task': void 0
        };
    },
    assignOwnership: function(user, event) {
        var queryParams, self;
        self = this
        event.preventDefault();
        event.stopPropagation();
        console.log("" + user['resource']['firstName'] + " is Taking ownership of " + this.state.task._id);
        queryParams = [
            {
                name: 'action',
                value: TaskActionsEnum.ASSIGN.name
            }, {
                name: 'userInput',
                value: user['externalModelId']
            }
        ];
        // Make a post call to assign the current authenticated user to the task
        this.post({path: "/task/" + self.props.params._id, queryParams: queryParams})
            // Re-fetch the task after it has been assigned the user
            .then(() => self.get({path: "/task/" + this.props.params._id}))
            // The returned task will be the latest, update the state
            .then((task) => {
                self.setState({'task': task});
                self.props.queryTasks.call(null);
            })
            .catch((err) => console.error("Could not load task: #{err.stack}"))
            .done();
    },
    declineOwnership: function(user, event) {
        var queryParams;
        event.preventDefault();
        event.stopPropagation();
        console.log("" + user['resource']['firstName'] + " is declining ownership of " + this.state.task._id);
        queryParams = [
            {
                name: 'action',
                value: TaskActionsEnum.DECLINE.name
            }, {
                name: 'userInput',
                value: user['externalModelId']
            }
        ];
        this.post({path: "/task/" + self.props.params._id, queryParams: queryParams})
            // Re-fetch the task after it has been assigned the user
            .then(() => self.get({path: "/task/" + this.props.params._id}))
            // The returned task will be the latest, update the state
            .then((task) => {
                self.setState({'task': task});
                self.props.queryTasks.call(null);
            })
            .catch((err) => console.error(`Could not load task: ${err.stack}`))
            .done();
    },
    removeOwnership: function(event) {
        var queryParams;
        event.preventDefault();
        console.log("" + (Auth.getAuthedUser()['resource']['firstName']) + " is removing ownership from " + this.state.task._id);
        queryParams = [
            {
                name: 'action',
                value: TaskActionsEnum.UNASSIGN.name
            }
        ];
        this.post({path: "/task/" + self.props.params._id, queryParams: queryParams})
            // Re-fetch the task after it has been assigned the user
            .then(() => self.get({path: "/task/" + this.props.params._id}))
            // The returned task will be the latest, update the state
            .then((task) => {
                self.setState({'task': task});
                self.props.queryTasks.call(null);
            })
            .catch((err) => console.error(`Could not load task: ${err.stack}`))
            .done();
    },
    close: function(event) {
        var queryParams;
        event.preventDefault();
        console.log("" + (Auth.getAuthedUser()['resource']['firstName']) + " is closing " + this.state.task._id);
        queryParams = [
            {
                name: 'action',
                value: TaskActionsEnum.CLOSE.name
            }
        ];
        this.post({path: "/task/" + self.props.params._id, queryParams: queryParams})
            // Re-fetch the task after it has been assigned the user
            .then(() => self.get({path: "/task/" + this.props.params._id}))
            // The returned task will be the latest, update the state
            .then((task) => {
                self.setState({'task': task});
                self.props.queryTasks.call(null);
            })
            .catch((err) => console.error(`Could not load task: ${err.stack}`))
            .done();
    },
    genEntityContents: function() {
        if (this.state.task.type === TaskTypeEnum.CASE.name) {
            return <Case key='taskCase' caseNumber={this.state.task.bid}></Case>;
        }
        return null;
    },
    queryTask: function(props) {
        this.get({path: "/task/" + props.params._id})
            .then((task) => self.setState({'task': task}))
            .catch((err) => console.error(`Could not load task: ${err.stack}`))
            .done();
    },
    componentWillReceiveProps: function(nextProps) {
        if ((this.props.params._id !== nextProps.params._id) && (nextProps.params._id != null)) {
            return this.queryTask(nextProps);
        }
    },
    // Refactor this to the more elegant advanced form in scorecard
    componentDidMount: function() {
        var _ref1, _ref2;
        if (((_ref1 = this.props.params) != null ? _ref1._id : void 0) === 'tasks' || (((_ref2 = this.props.params) != null ? _ref2._id : void 0) === void 0)) {
            console.warn('/task/tasks received, not fetching task.');
            return;
        }
        return this.queryTask(this.props);
    },
    render: function() {
        var _ref1;
        var taskId = this.props.params == null ? void 0 : this.props.params._id;
        if (this.state.task === '') {
            return <Alert bsStyle='danger' key='alert'>`Error fetching task with id: ${taskId}`</Alert>
        }
        if (this.state['task'] == null) {
            return null;
        }
        return (
            <div key='mainContainer'>
                <div key='taskContainer' className='row'>
                    <div className='col-md-6' key='containerLeft'>
                        <TaskHeader task={this.state.task} key='header'></TaskHeader>
                        <span key='metaDataContainer'>
                            <TaskState
                                task={this.state.task}
                                takeOwnership={this.assignOwnership.bind(this, Auth.getAuthedUser())}
                                declineOwnership={this.declineOwnership.bind(this, Auth.getAuthedUser())}
                                assignScopedOwnership={this.assignOwnership.bind(this, Auth.getScopedUser())}
                                declineScopedOwnership={this.declineOwnership.bind(this, Auth.getScopedUser())}
                                removeOwnership={this.removeOwnership}
                                close={this.close}
                                key='taskStatus'>
                            </TaskState>
                            <TaskAction task={this.state.task} key='action'></TaskAction>
                            <User user={this.state.task.owner} key='user'></User>
                            <TaskMetaData task={this.state.task} key='metaData'></TaskMetaData>
                        </span>
                        <span className='clearfix'></span>
                        <Spacer />
                        <span key='datesContainer'>
                            <TaskDates task={this.state.task} key='dates'></TaskDates>
                        </span>
                        <span className='clearfix'></span>
                        <Spacer />
                        <DeclinedUsers task={this.state.task}></DeclinedUsers>
                        <PotentialOwners task={this.state.task}></PotentialOwners>
                    </div>
                    /////////////////////////////////////////////////////////////////////////////////
                    // Top Right
                    /////////////////////////////////////////////////////////////////////////////////
                    <div className='col-md-6' key='containerRight'>
                        <Well key='well'>
                            <h3>Case Links</h3>
                            <ul>
                                <li><a target='_blank' href={`https://unified.gsslab.rdu2.redhat.com/cli#Case/number/${this.state.task.bid}`}>{`https://unified.gsslab.rdu2.redhat.com/cli#Case/number/${this.state.task.bid}`}</a></li>
                                <li><a target='_blank' href={`https://c.na7.visual.force.com/apex/Case_View?sbstr=${this.state.task.bid}`}>{`https://c.na7.visual.force.com/apex/Case_View?sbstr=${this.state.task.bid}`}</a></li>
                            </ul>
                        </Well>
                    </div>
                </div>
                /////////////////////////////////////////////////////////////////////////////////
                // Entity Contents
                /////////////////////////////////////////////////////////////////////////////////
                <hr />
                <div key='entityContainerRow' className='row'>
                    <div className='col-md-12' key='entityContainerContents'>
                    {this.genEntityContents()}
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = Component;
