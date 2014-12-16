var React           = require('react/addons');
var cx              = React.addons.classSet;
var TaskOpEnum      = require('../../../../../src/com/redhat/ascension/rules/enums/TaskOpEnum.coffee');
var EntityOpEnum    = require('../../../../../src/com/redhat/ascension/rules/enums/EntityOpEnum.coffee');
var Label           = React.createFactory(require('react-bootstrap/Label'));

var Component = React.createClass({
    displayName: 'TaskAction',
    genClasses: function() {
        var classSet;
        classSet = {
            'task-meta-data': this.props.absolute !== true,
            'task-meta-data-absolute': this.props.absolute !== true
        };
        return cx(classSet);
    },
    render: function() {
        var entityOp;
        if (this.props.task == null) {
            return null;
        }
        entityOp = EntityOpEnum[this.props.task.entityOp];
        return (
            <Label className={this.genClasses()} bsStyle='primary'>{entityOp.display}</Label>
        )
    }
});

module.exports = Component;
