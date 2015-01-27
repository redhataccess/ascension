var React       = require('react');
var S           = require('string');
var CaseProduct = require('./caseProduct.jsx');
var TaskDates   = require('../task/taskDates.jsx');
var Spacer      = require('react-redhat/Spacer');
var ResourceOpEnum    = require('../../../../../src/com/redhat/ascension/rules/enums/ResourceOpEnum.coffee');

var Well            = require('react-bootstrap/Well');
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
    render: function() {
        var caseNumber = S(this.props.case.resource.caseNumber).padLeft(8, '0').s;
        return (
            <Well key='caseHeader'>
                <div>
                    <div className='pull-left'>
                        <h2 key='header'>
                            {this.genEntityOpText(this.props.case)} 
                            Case {caseNumber}
                        </h2>
                    </div>
                    <div className='pull-right'>
                        <CaseProduct case={this.props.case.resource} key='product'></CaseProduct>
                    </div>
                </div>
                <div className='clearfix'></div>
                <span>{this.props.case.resource.status} / {this.props.case.resource.internalStatus}</span>
                &nbsp;--&nbsp;
                <span>{this.props.case.resource.severity} / {this.props.case.resource.internalPriority}</span>
                <div className='clearfix'></div>
                <TaskDates task={this.props.case} key='dates'></TaskDates>
                <Spacer />
                <strong key='headerSubject'>{this.props.case.resource.subject}</strong>
                <Spacer />
                {/*/////////////////////////////////////////////////////////////////////////////////*/}
                {/*Case link buttons */}
                {/*/////////////////////////////////////////////////////////////////////////////////*/}
                <div className="row">
                    <div className='col-sm-6'>
                        <div key='caseLinks'>
                            <a className='btn btn-open' target='_blank' href={`https://na7.salesforce.com/${this.props.case.externalModelId}`}>
                                {`Salesforce`}
                            </a>
                            &nbsp;
                            <a className='btn btn-open' target='_blank' href={`https://unified.gsslab.rdu2.redhat.com/cli#Case/number/${this.props.case.resource.caseNumber}`}>
                                {`Unified`}
                            </a>
                        </div>
                    </div>
                    {/*
                    <div className='col-sm-6'>
                        <div className='pull-right'>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Ignore case until next time it is updated.</Tooltip>}>
                                <button className='btn btn-secondary' onClick={this._declineTask}>{`Ignore`}</button>
                            </OverlayTrigger>
                        </div>
                    </div>
                    */}
                </div>
            </Well>
        )
    }
});

module.exports = Component;
