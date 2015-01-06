var React           = require('react/addons');
var cx              = React.addons.classSet;
var TaskOpEnum      = require('../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum.coffee');
var EntityOpEnum    = require('../../../../../src/com/redhat/ascension/rules/enums/ResourceOpEnum.coffee');

//var Label           = React.createFactory(require('react-bootstrap/Label'));
var Label           = require('react-bootstrap/Label');

var Component = React.createClass({
    displayName: 'TaskAction',
    genClasses: function() {
        var classSet;
        classSet = {
            'task-meta-data': this.props.absolute !== true,
            'task-meta-data-absolute': this.props.absolute == true
        };
        return cx(classSet);
    },
    render: function() {
        var resourceOp;
        if (this.props.task != null) {
            resourceOp = EntityOpEnum[this.props.task.resource.resourceOperation];
        } else if (this.props.case != null) {
            resourceOp = EntityOpEnum.getOpFromIntStatus(this.props.case.resource.internalStatus)
        } else {
            return null;
        }

        return (
            <Label className={this.genClasses()} bsStyle='primary'>{resourceOp.display}</Label>
        )
    }
});

module.exports = Component;
