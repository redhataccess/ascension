var React               = require('react/addons');
var padLeft             = require('lodash/string/padLeft');
var AjaxMixin           = require('../../mixins/ajaxMixin.coffee');
var Spacer              = require('react-redhat/Spacer');
var User                = require('react-redhat/user/User');
var Auth                = require('../../auth/auth.coffee');
var TaskActionsEnum     = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');
var TaskTypeEnum        = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');
var CaseHeader          = require('./caseHeader.jsx');
var CaseDescription     = require('./caseDescription.jsx');
var CaseSummary         = require('./caseSummary.jsx');
var CaseAssociates      = require('./caseAssociates.jsx');
var CaseIssueLinks      = require('./caseIssueLinks.jsx');
var CaseResourceLinks   = require('./caseResourceLinks.jsx');
var NewComment          = require('./newComment.jsx');
// var Comments            = require('react-redhat/comment/Comments');
var Comments            = require('./comments.jsx');

var Alert               = require('react-bootstrap/Alert');
var Grid                = require('react-bootstrap/Grid');

// var State               = require("react-router").State;
var State               = require('react-router/dist/react-router').State;

var CaseActions         = require('../../../flux/actions/CaseActions');
var CaseStore           = require('../../../flux/stores/CaseStore');

var CaseStateMixin = Marty.createStateMixin({
    mixins: [State],
    listenTo: CaseStore,
    getState: function () {
        return {
            case: CaseStore.getCase(this.getParams().taskId)
        }
    }
});

var Component = React.createClass({
    displayName: 'Case',
    mixins: [AjaxMixin, CaseStateMixin],
    getInitialState: function() {
        return {
            // 'loading': true,
            comment: [
                {
                  'name': 'status',
                  'value': this.props.case.resource.status
                }, 
                {
                  'name': 'internalStatus',
                  'value': this.props.case.resource.internalStatus
                }, 
                {
                  'name': 'public',
                  'value': false
                }
            ]
        };
    },
    componentWillUnmount: function() {
        if (this.state.case.done) {
            CaseActions.invalidateCase(this.state.case.result.resource.caseNumber);
        } else {
            console.warn("Case promise not done, could not invalidate cache.");
        }
    },
    setComment: function(comment) {
        this.setState({ 'comment': comment });
    },
    // componentDidMount: function() {
    //     this.setState({'case': this.props.case, 'loading': false});
    // },
    renderCase: function () {
        var self = this;
        return this.state.case.when({
            pending: function () {
                return <i className='fa fa-spinner fa-spin'></i>;
            },
            failed: function (err) {
                console.error(err.stack || err);
                return <Alert bsStyle="danger">Failed to load case: {err.stack || err}</Alert>;
            },
            done: function (c) {
                var caseNumber = padLeft(c.resource.caseNumber, 8, '0');
                return (
                    <div>
                        <CaseHeader case={c} key='caseHeader'></CaseHeader>
                        <div key='caseMetaData'>
                            <CaseDescription description={c.resource.description}></CaseDescription>
                            <CaseSummary summary={c.resource.summary}></CaseSummary>
                            <CaseAssociates owner={c.resource.owner} associates={c.resource.caseAssociates}></CaseAssociates>
                            <CaseResourceLinks resourceLinks={c.resource.resourceLinks}></CaseResourceLinks>
                            <NewComment caseNumber={caseNumber}
                              caseStatus={c.resource.status}
                              caseInternalStatus={c.resource.internalStatus}
                              onRequestHide={self.toggle}
                              refreshParentComponent={self.props.refreshParentComponent}
                              showSuccessAlert={self.props.showSuccessAlert}
                              showDangerAlert={self.props.showDangerAlert}
                              setComment={self.setComment}
                              comment={self.state.comment}
                              url={`/case/${+caseNumber}/comments`}
                              isUserAuthenticated={self.props.isUserAuthenticated}
                              authenticatedUser={self.props.authenticatedUser}></NewComment>
                        </div>
                        <hr />
                        <Comments caseNumber={caseNumber}></Comments>
                    </div>
                );
          }
      });
    },
    render: function() {
        if (this.state.loading == true) {
            return <i className='fa fa-spinner fa-spin'></i>;
        }
        if (this.state.case == null && this.state.loading == false) {
            return <Alert bsStyle='warning' key='alert'>
            {`No case found with case number: ${this.props.case.resource.caseNumber}`}
            </Alert>;
        }
        // var caseNumber = padLeft(this.props.case.resource.caseNumber, 8, '0');
        return this.renderCase();
    }
});

module.exports = Component;
