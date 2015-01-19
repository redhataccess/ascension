var React           = require('react/addons');
var cx              = React.addons.classSet;
var TaskOpEnum      = require('../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum.coffee');
var EntityOpEnum    = require('../../../../../src/com/redhat/ascension/rules/enums/ResourceOpEnum.coffee');

//var Label           = React.createFactory(require('react-bootstrap/Label'));
//var Label           = require('react-bootstrap/Label');

var Component = React.createClass({
    displayName: 'TaskActionHeader',
    render: function() {
        var resourceOp;
        if (this.props.task != null) {
            resourceOp = EntityOpEnum[this.props.task.resource.resourceOperation];
        } else if (this.props.case != null) {
            resourceOp = EntityOpEnum.getOpFromCase(this.props.case);
        } else {
            return null;
        }

        if (resourceOp == null && this.props.case != null) {
            console.error(`No resourceOp, case.resource.internalStatus: ${this.props.case.resource.internalStatus}`)
        }

        return (
            <div className="row">
                <div className='col-sm-6'>
                    <h4>
                        Task: {resourceOp.display}  (Case{this.props.case.resource.caseNumber})
                    </h4>
                </div>
                <div className='col-sm-6'>
                    <div className='pull-right'>
                        <button className='btn btn-secondary'>{`Deny`}</button>
                    &nbsp;
                        <button className='btn btn-secondary'>{`Accept`}</button>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = Component;
