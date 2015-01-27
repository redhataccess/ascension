var React                       = require('react/addons');
var S                           = require('string');
var Router                      = require('react-router/dist/react-router');
var AjaxMixin                   = require('../../mixins/ajaxMixin.coffee');
var WebUtilsMixin               = require('../../mixins/webUtilsMixin.coffee');
var TaskState                   = require('./taskState.jsx');
var TaskHeader                  = require('./taskHeader.jsx');
var TaskActionHeader            = require('./taskActionHeader.jsx');
var TaskMetaData                = require('./taskMetaData.jsx');
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
    mixins: [AjaxMixin, Router.State, Router.Navigation, WebUtilsMixin],
    // This dictates how to open users from this component down
    openUser: function (user) {
        var query, params, self = this;
        params = { taskId: self.getParams().taskId || 'list' };
        // We may already have some query params in the navigation, so let's extend with the user to overwrite
        // what may be there and keep what may already be there
        query = _.extend(this.getQuery(), {ssoUsername: user.resource.sso[0]});
        this.transitionTo("tasks", params, query);
    },
    getInitialState: function() {
        // task and case are part of the same object, but due to the nested nature of UDS, I am defining both and setting
        // both as it makes for referring to the case much easier
        return {
            'task': void 0,
            'case': void 0,
            'caseLoading': true
        };
    },
    genEntityContents: function() {
        //return <Case key='taskCase' caseNumber={this.state.case.resource.caseNumber}></Case>;
        if (this.state.caseLoading == true) {
            return <i className='fa fa-spinner fa-spin'></i>;
        } else {
            return <Case key='taskCase' case={this.state.case}></Case>;
        }
    },
    queryCase: function (caseNumber) {
        var self = this;
        this.setState({caseLoading: true});
        this.get({path: `/case/${caseNumber}`})
            .then((task) => self.setState({'case': task}))
            .catch((err) => console.error(`Could not load case: ${caseNumber}, ${err.stack}`))
            .done(() => self.setState({caseLoading: false}));
    },
    _isCaseNumberList: function (caseNumber) {
        if (caseNumber == 'list') {
            console.warn('/tasks/list received, not fetching task.');
            this.setState({caseLoading: false});
            return true;
        }
        return false;
    },
    componentWillReceiveProps: function(nextProps) {
        if (this._isCaseNumberList(nextProps.caseNumber) == true) {
            return;
        }
        if (!_.isEqual(this.props.caseNumber, nextProps.caseNumber)) {
            this.queryCase(nextProps.caseNumber);
        }
    },
    componentDidMount: function() {
        if (this._isCaseNumberList(this.props.caseNumber) == true) {
            return;
        }
        this.queryCase(this.props.caseNumber);
    },
    render: function() {
        var caseNumber = S(this.props.caseNumber).padLeft(8, '0').s;
        if (this.state.caseLoading == true) {
            return <i className='fa fa-spinner fa-spin'></i>;
        }
        if (this.state.case == null && this.state.caseLoading == false && this.props.caseNumber == 'list') {
            return <Alert bsStyle='info' key='info'>No case to load, please select a task in the tasks list, or search for a different user.</Alert>
        }
        if (this.state.case == null && this.state.caseLoading == false) {
            return <Alert bsStyle='danger' key='alert'>Error fetching case: {caseNumber}</Alert>
        }
        return (
            <div>
                <div key='taskContainer' className='row'>
                    <div className='col-md-12' key='containerLeft'>
                        <span key='metaDataContainer'>
                            <TaskState
                                task={this.state.case}
                                close={this.close}
                                key='taskStatus'>
                            </TaskState>
                        </span>
                    </div>
                </div>
                {/*/////////////////////////////////////////////////////////////////////////////////*/}
                {/*Entity Contents*/}
                {/*/////////////////////////////////////////////////////////////////////////////////*/}
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
