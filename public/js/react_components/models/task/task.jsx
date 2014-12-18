var React                       = require('react/addons');
var Router                      = require('react-router/dist/react-router');
var AjaxMixin                   = require('../../mixins/ajaxMixin.coffee');
var WebUtilsMixin               = require('../../mixins/webUtilsMixin.coffee');
var TaskState                   = require('./taskState.jsx');
var TaskHeader                  = require('./taskHeader.jsx');
var TaskAction                  = require('./taskAction.jsx');
var TaskMetaData                = require('./taskMetaData.jsx');
var TaskDates                   = require('./taskDates.jsx');
var Spacer                      = require('../../utils/spacer.jsx');
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
    mixins: [AjaxMixin, Router.State, WebUtilsMixin],
    getInitialState: function() {
        // task and case are part of the same object, but due to the nested nature of UDS, I am defining both and setting
        // both as it makes for referring to the case much easier
        return {
            'task': void 0,
            'case': void 0
        };
    },
    assignOwnership: function(user, event) {
        var queryParams,
            self = this;
        event.preventDefault();
        event.stopPropagation();
        console.log(`${user['resource']['firstName']} is Taking ownership of ${this.state.task.resource.externalModelId}`);
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
        this.post({path: `/task/${self.getParams()['taskId']}`, queryParams: queryParams})
            // Re-fetch the task after it has been assigned the user
            .then(() => self.get({path: `/task/${self.getParams()['taskId']}`}))
            // The returned task will be the latest, update the state
            .then((task) => {
                self.setState({'task': task, 'case': task.resource.resource.resource});
                self.props.queryTasks.call(null);
            })
            .catch((err) => console.error("Could not load task: #{err.stack}"))
            .done();
    },
    declineOwnership: function(user, event) {
        var queryParams,
            self = this;
        event.preventDefault();
        event.stopPropagation();
        console.log(`${user['resource']['firstName']} is declining ownership of ${this.state.task.resource.externalModelId}`);
        queryParams = [
            {
                name: 'action',
                value: TaskActionsEnum.DECLINE.name
            }, {
                name: 'userInput',
                value: user['externalModelId']
            }
        ];
        this.post({path: `/task/${self.getParams()['taskId']}`, queryParams: queryParams})
            // Re-fetch the task after it has been assigned the user
            .then(() => self.get({path: `/task/${self.getParams()['taskId']}`}))
            // The returned task will be the latest, update the state
            .then((task) => {
                self.setState({'task': task, 'case': task.resource.resource.resource});
                self.props.queryTasks.call(null);
            })
            .catch((err) => console.error(`Could not load task: ${err.stack}`))
            .done();
    },
    removeOwnership: function(event) {
        var queryParams,
            self = this;
        event.preventDefault();
        console.log(`${Auth.getAuthedUser()['resource']['firstName']} is removing ownership from ${this.state.task.resource.externalModelId}`);
        queryParams = [
            {
                name: 'action',
                value: TaskActionsEnum.UNASSIGN.name
            }
        ];
        this.post({path: `/task/${self.getParams()['taskId']}`, queryParams: queryParams})
            // Re-fetch the task after it has been assigned the user
            .then(() => self.get({path: `/task/${self.getParams()['taskId']}`}))
            // The returned task will be the latest, update the state
            .then((task) => {
                self.setState({'task': task, 'case': task.resource.resource.resource});
                self.props.queryTasks.call(null);
            })
            .catch((err) => console.error(`Could not load task: ${err.stack}`))
            .done();
    },
    close: function(event) {
        var queryParams,
            self = this;
        event.preventDefault();
        console.log(`${Auth.getAuthedUser()['resource']['firstName']} is closing ${this.state.task.resource.externalModelId}`);
        queryParams = [
            {
                name: 'action',
                value: TaskActionsEnum.CLOSE.name
            }
        ];
        this.post({path: `/task/${self.getParams()['taskId']}`, queryParams: queryParams})
            // Re-fetch the task after it has been assigned the user
            .then(() => self.get({path: `/task/${self.getParams()['taskId']}`}))
            // The returned task will be the latest, update the state
            .then((task) => {
                self.setState({'task': task, 'case': task.resource.resource.resource});
                self.props.queryTasks.call(null);
            })
            .catch((err) => console.error(`Could not load task: ${err.stack}`))
            .done();
    },
    genEntityContents: function() {
        if (this.state.task.type === TaskTypeEnum.CASE.name) {
            return <Case key='taskCase' caseNumber={this.state.task.resource.resource.resource.caseNumber}></Case>;
        }
        return null;
    },
    queryTask: function () {
        var taskId = this.getParams()['taskId'],
            self = this;
        this.get({path: `/task/${taskId}`})
            .then((task) => self.setState({'task': task, 'case': task.resource.resource.resource}))
            .catch((err) => console.error(`Could not load task: ${taskId}, ${err.stack}`))
            .done();
    },
    componentWillReceiveProps: function(nextProps) {
        var newTaskId = this.getParams()['taskId'],
            currentTaskId = WebUtilsMixin.getDefined(this, 'state.task.resource.externalModelId');
        if (newTaskId != currentTaskId && newTaskId != 'tasks') {
            this.queryTask();
        }
    },
    // Refactor this to the more elegant advanced form in scorecard
    componentDidMount: function() {
        if (this.getParams()['taskId'] == 'tasks') {
            console.warn('/task/tasks received, not fetching task.');
            return;
        }
        this.queryTask();
    },
    render: function() {
        var taskId = this.getParams()['taskId'];
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
                            <User user={this.state.task.resource.owner} key='user'></User>
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
                        {/*<PotentialOwners task={this.state.task}></PotentialOwners>*/}
                    </div>
                    {/*/////////////////////////////////////////////////////////////////////////////////*/}
                    {/*Top Right*/}
                    {/*/////////////////////////////////////////////////////////////////////////////////*/}
                    <div className='col-md-6' key='containerRight'>
                        <Well key='well'>
                            <h3>Case Links</h3>
                            <ul>
                                <li>
                                    <a target='_blank' href={`https://unified.gsslab.rdu2.redhat.com/cli#Case/number/${this.state.case.caseNumber}`}>
                                    {`https://unified.gsslab.rdu2.redhat.com/cli#Case/number/${this.state.case.caseNumber}`}
                                    </a>
                                </li>
                                <li>
                                    <a target='_blank' href={`https://c.na7.visual.force.com/apex/Case_View?sbstr=${this.state.case.caseNumber}`}>
                                    {`https://c.na7.visual.force.com/apex/Case_View?sbstr=${this.state.case.caseNumber}`}
                                    </a>
                                </li>
                            </ul>
                        </Well>
                    </div>
                </div>
                {/*/////////////////////////////////////////////////////////////////////////////////*/}
                {/*Entity Contents*/}
                {/*/////////////////////////////////////////////////////////////////////////////////*/}
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
