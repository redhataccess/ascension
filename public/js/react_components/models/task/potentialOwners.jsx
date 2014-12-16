var React           = require('react');
var _               = require('lodash');
var Label           = require('react-bootstrap/Label');
var Popover         = require('react-bootstrap/Popover');
var OverlayTrigger  = require('react-bootstrap/OverlayTrigger');

var Component = React.createClass({
    displayName: 'TaskAction',
    render: function() {
        var lis, OwnersPopover, potentialOwnerCount, potentialOwners;
        if (this.props.task == null) {
            return null;
        }
        OwnersPopover = <Popover>No potential owners</Popover>;
        this.props.task['potentialOwners'].sort((a, b) => b.score - a.score);
        potentialOwners = this.props.task['potentialOwners'] == null ? [] : null;
        potentialOwnerCount = potentialOwners  || 0;
        if (potentialOwnerCount  > 0) {
            lis = _.map(potentialOwners, (u) => <li key={u['id']}>{u['fullName']}</li>);
            OwnersPopover = (
                <Popover key='popover'>
                    <ul className='list-unstyled' key='owner'>{lis}</ul>
                </Popover>
            )
        }
        return (
            <OverlayTrigger trigger='hover' placement='bottom' overlay={OwnersPopover} key='overlay'>
                <Label bsStyle='default' key='label'>`${potentialOwnerCount} Potential Owners(s)`</Label>
            </OverlayTrigger>
        )
    }
});

module.exports = Component;
