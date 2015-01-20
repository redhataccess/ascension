var React               = require('react/addons');
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
var Comments            = require('react-redhat/comment/Comments');


var Alert               = require('react-bootstrap/Alert');
var Grid                = require('react-bootstrap/Grid');

var Component = React.createClass({
    displayName: 'Case',
    mixins: [AjaxMixin],
    getInitialState: function() {
        return {
            'case': void 0,
            'loading': true
        };
    },
    componentDidMount: function() {
        this.setState({'case': this.props.case, 'loading': false});
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
        return (
            <div>
                <CaseHeader case={this.props.case.resource} key='caseHeader'></CaseHeader>
                <div key='caseMetaData'>
                    <CaseDescription description={this.props.case.resource.description}></CaseDescription>
                    <CaseSummary summary={this.props.case.resource.summary}></CaseSummary>
                    <CaseAssociates owner={this.props.case.resource.owner} associates={this.state.case.resource.caseAssociates}></CaseAssociates>
                    <CaseResourceLinks resourceLinks={this.props.case.resource.resourceLinks}></CaseResourceLinks>
                </div>
                <hr />
                <Comments caseNumber={this.props.case.resource.caseNumber}></Comments>
            </div>
        )
    }
});

module.exports = Component;
