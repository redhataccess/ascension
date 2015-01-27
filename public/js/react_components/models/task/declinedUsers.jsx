var React           = require('react/addons');
var map             = require('lodash/collection/map');

var Label           = require('react-bootstrap/Label');
var Popover         = require('react-bootstrap/Popover');
var OverlayTrigger  = require('react-bootstrap/OverlayTrigger');

var Component = React.createClass({
    displayName: 'TaskAction',
    render: function() {
        var declinedUserCount, lis, UsersPopover, declinedUsers;
        if (this.props.task == null) {
            return null;
        }
        UsersPopover = <Popover>No declined users</Popover>;
        declinedUsers = this.props.task['declinedUsers'] == null ? [] : this.props.task['declinedUsers'];
        declinedUserCount = declinedUsers.length || 0;
        if (declinedUserCount > 0) {
            lis = map(declinedUsers, (u) => <li key={u['id']}>{u['fullName']}</li>);
            UsersPopover = (
                <Popover key='popover'>
                    <ul className='list-unstyled' key='users'>{lis}</ul>
                </Popover>
            )
        }
        return (
            <span>{`Declined Owners: ${declinedUserCount}`}</span>
        )
    }
});

module.exports = Component;
