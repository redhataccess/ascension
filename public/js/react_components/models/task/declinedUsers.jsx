var React           = require('react/addons');
var _               = require('lodash');

var Label           = React.createFactory(require('react-bootstrap/Label'));
var Popover         = React.createFactory(require('react-bootstrap/Popover'));
var OverlayTrigger  = React.createFactory(require('react-bootstrap/OverlayTrigger'));

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
            lis = _.map(declinedUsers, (u) => <li key={u['id']}>{u['fullName']}</li>);
            UsersPopover = (
                <Popover key='popover'>
                    <ul className='list-unstyled' key='users'>{lis}</ul>
                </Popover>
            )
        }
        return (
            <OverlayTrigger trigger='hover' placement='bottom' overlay={UsersPopover} key='overlay'>
                <Label bsStyle='default' key='label'>`${declinedUserCount} Declined User(s)`</Label>
            </OverlayTrigger>
        )
    }
});

module.exports = Component;
