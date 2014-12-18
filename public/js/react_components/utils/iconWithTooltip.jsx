var React           = require('react');
var S               = require('string');

var OverlayTrigger  = require('react-bootstrap/OverlayTrigger');
var Popover         = require('react-bootstrap/Popover');
var Tooltip         = require('react-bootstrap/Tooltip');
var Button          = require('react-bootstrap/Button');

var Component = React.createClass({
    displayName: 'IconWithTooltip',
    genTooltipPrefix: function() {
        if ((this.props.tooltipPrefix == null) || this.props.tooltipPrefix === '') {
            return '';
        }
        return S(this.props.tooltipPrefix).capitalize().s + ' ';
    },
    render: function() {
        var tooltip;
        if (this.props.iconName == null) {
            return null;
        }
        tooltip = <Tooltip>{this.genTooltipPrefix() + this.props.tooltipText}</Tooltip>;
        return (
            <OverlayTrigger trigger='hover' placement='right' overlay={tooltip}>
                <i className={`fa ${this.props.iconName} icon-with-tooltip`} title={this.props.tooltipText}></i>
            </OverlayTrigger>
        )
    }
});

module.exports = Component;
