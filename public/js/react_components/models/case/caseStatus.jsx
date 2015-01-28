var React           = require('react/addons');

var Component = React.createClass({
    propTypes: {
        'case': React.PropTypes.object.isRequired
    },
    displayName: 'CaseStatus',
    render: function() {
        if (this.props.case == null)
        {
            return null;
        }
        return (
            <span>{this.props.case.resource.status} / {this.props.case.resource.internalStatus}</span>
        )
    }
});
module.exports = Component;