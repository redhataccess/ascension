var React               = require('react/addons');
var AjaxMixin           = require('../../mixins/ajaxMixin.coffee');
var Spacer              = require('../../utils/spacer.jsx');
var User                = require('../user/user.jsx');
var Auth                = require('../../auth/auth.coffee');
var TaskActionsEnum     = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');
var TaskTypeEnum        = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');
var CaseHeader          = require('./caseHeader.jsx');
var CaseDescription     = require('./caseDescription.jsx');
var CaseSummary         = require('./caseSummary.jsx');
var CaseAssociates      = require('./caseAssociates.jsx');
var CaseIssueLinks      = require('./caseIssueLinks.jsx');
var CaseResourceLinks   = require('./caseResourceLinks.jsx');
var Comments            = require('../comment/comments.jsx');

var Alert               = require('react-bootstrap/Alert');
var Grid                = require('react-bootstrap/Grid');

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
        var self = this;
        this.setState({
            'loading': true
        });

        this.get({path: `/case/${props.caseNumber}`})
            .then((c) => {
                console.debug(`Discovered case: ${c.resource.caseNumber}`);
                self.setState({'case': c, 'theCase': c.resource, 'loading': false});
            })
            .catch((err) => console.error(`could not load case ${props.caseNumber}: ${err.stack}`))
            .done(() => self.setState({loading: false}));
    },
    componentDidMount: function() {
        if (this.props.caseNumber != null) {
            this.queryCase(this.props);
        }
    },
    //componentWillReceiveProps: function(nextProps) {
    //    if ((this.props.caseNumber !== nextProps.caseNumber) || this.state.theCase == null) {
    //        this.queryCase(nextProps);
    //    }
    //},
    render: function() {
        if (this.state.loading === true) {
            return <i className='fa fa-spinner fa-spin'></i>;
        }
        if (this.state["theCase"] == null) {
            return <Alert bsStyle='warning' key='alert'>
            {`No case found with case number: ${this.props.caseNumber}`}
            </Alert>;
        }
        return (
            <div>
                <CaseHeader case={this.state.theCase} key='caseHeader'></CaseHeader>
                <div key='caseMetaData'>
                    <CaseDescription description={this.state.theCase.description}></CaseDescription>
                    <CaseSummary summary={this.state.theCase.summary}></CaseSummary>
                    <CaseAssociates owner={this.state.theCase.owner} associates={this.state.theCase.caseAssociates}></CaseAssociates>
                    <CaseResourceLinks resourceLinks={this.state.theCase.resourceLinks}></CaseResourceLinks>
                </div>
                <hr />
                <Comments caseNumber={this.state.theCase.caseNumber}></Comments>
            </div>
        )
    }
});

module.exports = Component;
