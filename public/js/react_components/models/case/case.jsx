var React               = require('react/addons');
var AjaxMixin           = require('../../mixins/ajaxMixin.coffee');
var Spacer              = require('../../utils/spacer.coffee');
var User                = require('../user/user.jsx');
var Auth                = require('../../auth/auth.coffee');
var TaskActionsEnum     = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');
var TaskTypeEnum        = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');
var Well                = require('react-bootstrap/Well');
var Alert               = require('react-bootstrap/Alert');
var Accordion           = require('react-bootstrap/Accordion');
var Grid                = require('react-bootstrap/Grid');
var Row                 = require('react-bootstrap/Row');
var Col                 = require('react-bootstrap/Col');
var CaseHeader          = require('./caseHeader.jsx');
var CaseDescription     = require('./caseDescription.jsx');
var CaseSummary         = require('./caseSummary.jsx');
var CaseAssociates      = require('./caseAssociates.jsx');
var CaseIssueLinks      = require('./caseIssueLinks.jsx');
var CaseResourceLinks   = require('./caseResourceLinks.jsx');
var Comments            = require('../comment/comments.jsx');

var Component = React.createClass({
    displayName: 'Case',
    mixins: [AjaxMixin],
    getInitialState: function() {
        return {
            'case': void 0,
            'loading': false
        };
    },
    queryCase: function(props) {
        self = this;
        this.setState({
            'loading': true
        });

        this.get({path: `/case/${props.caseNumber}`})
            .then((c) => {
                console.debug("Discovered case: #{c['resource']['caseNumber']}");
                self.setState({'case': c, 'loading': false});
            })
            .catch((err) => console.error(`could not load case ${props.caseNumber}: ${err.stack}`))
            .done(() => self.setState({loading: false}));
    },
    componentWillMount: function() {
        if (this.props.caseNumber != null) {
            this.queryCase(this.props);
        }
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.caseNumber !== nextProps.caseNumber) {
            this.queryCase(nextProps);
        }
    },
    render: function() {
        if (this.state.loading === true) {
            return <i className='fa fa-spinner fa-spin'></i>;
        }
        if (this.state["case"] == null) {
            return <Alert bsStyle='warning' key='alert'>
                `No case found with case number: ${this.props.caseNumber}`
            </Alert>;
        }
        return (
            <div>
                <CaseHeader case={this.state.case} key='caseHeader'></CaseHeader>
                <div key='caseMetaData'>
                    <CaseDescription description={this.state.case.resource.description}></CaseDescription>
                    <CaseSummary summary={this.state.case.resource.summary}></CaseSummary>
                    <CaseAssociates owner={this.state.case.resource.owner} associates={this.state.case.resource.caseAssociates}></CaseAssociates>
                    <CaseResourceLinks resourceLinks={this.state.case.resource.resourceLinks}></CaseResourceLinks>
                </div>
                <hr />
                <Comments caseNumber={this.state.case.resource.caseNumber}></Comments>
            </div>
        )
    }
});

module.exports = Component;
