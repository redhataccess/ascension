var React           = require('react');
var map             = require('lodash/collection/map');

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
        //this.props.task['potentialOwners'].sort((a, b) => b.resource.score - a.resource.score);
        potentialOwners = this.props.task['potentialOwners'] == null ? [] : null;
        potentialOwnerCount = potentialOwners.length || 0;
        if (potentialOwnerCount  > 0) {
            lis = map(potentialOwners, (u) => <li key={u['id']}>{u['fullName']}</li>);
            OwnersPopover = (
                <Popover key='popover'>
                    <ul className='list-unstyled' key='owner'>{lis}</ul>
                </Popover>
            )
        }
        return (
            <span>{`Potential Owners: ${potentialOwnerCount}`}</span>
        )
    }
});

module.exports = Component;
