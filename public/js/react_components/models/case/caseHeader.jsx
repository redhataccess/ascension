var React       = require('react');
var S           = require('string');
var CaseProduct = require('./caseProduct.jsx');
var CaseSbrs    = require('./caseSbrs.jsx');
var CaseTags    = require('./caseTags.jsx');
var TaskDates   = require('../task/taskDates.jsx');
var Spacer      = require('react-redhat/Spacer');
var ResourceOpEnum    = require('../../../../../src/com/redhat/ascension/rules/enums/ResourceOpEnum.coffee');

var Well            = require('react-bootstrap/Well');
var Grid            = require('react-bootstrap/Grid');
var Row             = require('react-bootstrap/Row');
var Label           = require('react-bootstrap/Label');
var Col             = require('react-bootstrap/Col');
var OverlayTrigger  = require('react-bootstrap/OverlayTrigger');
var Tooltip         = require('react-bootstrap/Tooltip');

var Component = React.createClass({
    genEntityOpText: function (c) {
        var resourceOp, resourceOpText;
        if (c != null) {
            resourceOp = ResourceOpEnum.getOpFromCase(c);
            resourceOpText = resourceOp.display + (resourceOp.grammar != null ? " " + resourceOp.grammar : "")
            return (
                <span>{resourceOpText}&nbsp;</span>
            );
        } 
        return null;
    },
    genFtsLabel: function(c) {
        if (c.resource.isFTSCase == true) {
            return <span>&nbsp;<Label bsStyle="danger">FTS</Label></span>;
        }
        return null;
    },
    genTamLabel: function(c) {
        if (c.resource.isTAMCase == true) {
            return <span>&nbsp;<Label bsStyle="primary">TAM</Label></span>;
        }
        return null;
    },
    render: function() {
        var caseNumber = S(this.props.case.resource.caseNumber).padLeft(8, '0').s;
        return (
            <Well key='caseHeader'>
                <Row>
                    <Col md={6}>
                        <h2 key='header'>
                            {this.genEntityOpText(this.props.case)} 
                            Case {caseNumber}
                            {this.genFtsLabel(this.props.case)}
                            {this.genTamLabel(this.props.case)}
                        </h2>
                        <div className='clearfix'></div>
                        <span>{this.props.case.resource.status} / {this.props.case.resource.internalStatus}</span>
                        &nbsp;--&nbsp;
                        <span>{this.props.case.resource.severity} / {this.props.case.resource.internalPriority}</span>
                        <div className='clearfix'></div>
                        <TaskDates task={this.props.case} key='dates'></TaskDates>
                    </Col>
                    <Col md={6}>
                        <CaseProduct case={this.props.case.resource} key='product'></CaseProduct>
                        <Spacer />
                        <CaseSbrs case={this.props.case} key='sbrs'></CaseSbrs>
                        <Spacer />
                        <CaseTags case={this.props.case} key='tags'></CaseTags>
                        <Spacer />
                        {/*/////////////////////////////////////////////////////////////////////////////////*/}
                        {/*Case link buttons */}
                        {/*/////////////////////////////////////////////////////////////////////////////////*/}
                        <div key='caseLinks'>
                            <a className='btn btn-open' target='_blank' href={`https://na7.salesforce.com/${this.props.case.externalModelId}`}>
                                {`Salesforce`}
                            </a>
                            &nbsp;
                            <a className='btn btn-open' target='_blank' href={`https://unified.gsslab.rdu2.redhat.com/cli#Case/number/${this.props.case.resource.caseNumber}`}>
                                {`Unified`}
                            </a>
                        </div>
                    </Col>
                </Row>
                <Spacer />
                <strong key='headerSubject'>{this.props.case.resource.subject}</strong>
                <Spacer />
            </Well>
        )
    }
});

module.exports = Component;
