var React           = require('react/addons');
var WebUtilsMixin   = require('../../mixins/webUtilsMixin.coffee');

var Label           = require('react-bootstrap/Label');

var Component = React.createClass({
    displayName: 'TaskAction',
    mixins: [WebUtilsMixin],
    render: function () {
        var output, sbrsExist, tagsExist;
        if (this.props.task == null) {
            return null;
        }
        sbrsExist = this.isDefined(this, 'props.task.resource.sbrs') && this.props.task.resource.sbrs.length > 0;
        tagsExist = this.isDefined(this, 'props.task.resource.tags') && this.props.task.resource.tags.length > 0;
        output = [];
        if (sbrsExist) {
            output.push("Pertaining to");
            output.push(this.props.task.resource.sbrs.join(','));
        }
        if (tagsExist) {
            if (sbrsExist) {
                output.push('and');
            }
            output.push(this.props.task.resource.tags.join(','));
        }

        return (
            <Label className='task-meta-data' bsStyle='primary'>{output.join(' ')}</Label>
        )
    }
});

module.exports = Component;
