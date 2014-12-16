var React   = require('react/addons');
var _       = require('lodash');
var Label   = React.createFactory(require('react-bootstrap/Label'));

var Component = React.createClass({
    displayName: 'TaskAction',
    render: () => {
        var output, sbrsExist, tagsExist, _ref1, _ref2;
        if (this.props.task == null) {
            return null;
        }
        sbrsExist = ((_ref1 = this.props.task.sbrs) != null ? _ref1.length : void 0) > 0;
        tagsExist = ((_ref2 = this.props.task.tags) != null ? _ref2.length : void 0) > 0;
        output = [];
        if (sbrsExist) {
            output.push("Pertaining to");
            output.push(this.props.task.sbrs.join(','));
        }
        if (tagsExist) {
            if (sbrsExist) {
                output.push('and');
            }
            output.push(this.props.task.tags.join(','));
        }

        return (
            <Label className='task-meta-data' bsStyle='primary'>{output.join(' ')}</Label>
        )
    }
});

module.exports = Component;
