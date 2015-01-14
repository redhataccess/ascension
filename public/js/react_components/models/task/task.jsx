var React                       = require('react/addons');
var S                           = require('string');
var Router                      = require('react-router/dist/react-router');
var AjaxMixin                   = require('../../mixins/ajaxMixin.coffee');
var WebUtilsMixin               = require('../../mixins/webUtilsMixin.coffee');
var TaskState                   = require('./taskState.jsx');
var TaskHeader                  = require('./taskHeader.jsx');
var TaskActionHeader            = require('./taskActionHeader.jsx');
var TaskMetaData                = require('./taskMetaData.jsx');
var TaskDates                   = require('./taskDates.jsx');
var Spacer                      = require('react-redhat/Spacer');
var Case                        = require('../case/case.jsx');
var User                        = require('react-redhat/user/User');
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
            'case': void 0,
            'caseLoading': true
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
            },
            {
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
    //genEntityContents: function() {
    //    if (this.state.task.resource.type === TaskTypeEnum.CASE.name) {
    //        return <Case key='taskCase' caseNumber={this.state.case.resource.caseNumber}></Case>;
    //    }
    //    return null;
    //},
    genEntityContents: function() {
        //return <Case key='taskCase' caseNumber={this.state.case.resource.caseNumber}></Case>;
        if (this.state.caseLoading == true) {
            return <i className='fa fa-spinner fa-spin'></i>;
        } else {
            return <Case key='taskCase' case={this.state.case}></Case>;
        }
    },
    queryCase: function (caseNumber) {
        this.setState({caseLoading: true});
        var self = this;
        this.get({path: `/case/${caseNumber}`})
            .then((task) => self.setState({'case': task}))
            .catch((err) => console.error(`Could not load case: ${caseNumber}, ${err.stack}`))
            .done(() => self.setState({caseLoading: false}));
    },
    componentWillReceiveProps: function(nextProps) {
        if (!_.isEqual(this.props.caseNumber, nextProps.caseNumber)) {
            this.queryCase(nextProps.caseNumber);
        }

            //currentTaskId = WebUtilsMixin.getDefined(this, 'state.case.resource.caseNumber');
        //if (`${taskId}` != `${currentTaskId}` && `${taskId}` != 'list') {
        //}
    },
    // Refactor this to the more elegant advanced form in scorecard
    componentDidMount: function() {
        if (this.props.caseNumber == 'list') {
            console.warn('/tasks/list received, not fetching task.');
            return;
        }
        this.queryCase(this.props.caseNumber);
    },
    render: function() {
        var caseNumber = S(this.props.caseNumber).padLeft(8, '0').s
        var summaryStyle = {
            overflow : 'hidden',
            width: '50em',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap'

        };
        if (this.state.caseLoading == true) {
            return <i className='fa fa-spinner fa-spin'></i>;
        }
        if (this.state.case == null && this.state.caseLoading == false) {
            return <Alert bsStyle='danger' key='alert'>`Error fetching case: ${caseNumber}`</Alert>
        }
        return (
            <div>
                <div key='taskContainer' className='row'>
                    <div className='col-md-8' key='containerLeft'>
                        <TaskHeader task={this.state.case} key='header'></TaskHeader>
                        <span key='metaDataContainer'>
                            <TaskState
                                task={this.state.case}
                                takeOwnership={this.assignOwnership.bind(this, Auth.getAuthedUser())}
                                declineOwnership={this.declineOwnership.bind(this, Auth.getAuthedUser())}
                                assignScopedOwnership={this.assignOwnership.bind(this, Auth.getScopedUser())}
                                declineScopedOwnership={this.declineOwnership.bind(this, Auth.getScopedUser())}
                                removeOwnership={this.removeOwnership}
                                close={this.close}
                                key='taskStatus'>
                            </TaskState>
                            &nbsp;
                            <TaskActionHeader case={this.state.case} key='action'></TaskActionHeader>
                        </span>
                        <span>{`Status: ${this.state.case.resource.internalStatus}`}</span>
                        &nbsp;&nbsp;
                        <DeclinedUsers task={this.state.case}></DeclinedUsers>
                        &nbsp;&nbsp;
                        <PotentialOwners task={this.state.case}></PotentialOwners>
                        <span className='clearfix'></span>
                        <Spacer />
                        <span key='datesContainer'>
                            <TaskDates task={this.state.case} key='dates'></TaskDates>
                        </span>
                        <span className='clearfix'></span>
                        <Spacer />
                        <div style={summaryStyle}>Summary:  {this.state.case.resource.summary} </div>
                        <Spacer />
                        {/*/////////////////////////////////////////////////////////////////////////////////*/}
                        {/*Case link buttons */}
                        {/*/////////////////////////////////////////////////////////////////////////////////*/}
                        <div key='caseLinks'>
                            <a className='btn btn-open' target='_blank' href={`https://unified.gsslab.rdu2.redhat.com/cli#Case/number/${this.state.case.resource.caseNumber}`}>
                                    {`Case Link 1`}
                            </a>
                        &nbsp;
                            <a className='btn btn-open' target='_blank' href={`https://c.na7.visual.force.com/apex/Case_View?sbstr=${this.state.case.resource.caseNumber}`}>
                                    {`Case Link 2`}
                            </a>
                        </div>
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
