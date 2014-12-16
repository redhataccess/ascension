var React           = require('react/addons');
var MenuItem        = React.createFactory(require('react-bootstrap/MenuItem'));
var DropdownButton  = React.createFactory(require('../../bsReactOverrides/DropdownButton.coffee'));
var Auth            = require('../../auth/auth.coffee');
var TaskStateEnum   = require('../../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');


var Component = React.createClass({
    displayName: 'TaskState',
    generateScopedOwnershipElem: () => {
        var id;
        if (Auth.getScopedUser() == null) {
            return null;
        }
        id = Auth.getScopedUser()['externalModelId'];
        return (
            <MenuItem key={`assign-${id}`} onClick={this.props.assignScopedOwnership}>
                <i className='fa fa-user fw'></i>
                ` Assign to ${Auth.getScopedUser()['resource']['firstName']}`
            </MenuItem>
        )
    },
    generateScopedDeclineElem: () => {
        var id;
        if (Auth.getScopedUser() == null) {
            return null;
        }
        id = Auth.getScopedUser()['externalModelId'];
        return (
            <MenuItem key={`decline-${id}`} onClick={this.props.assignScopedOwnership}>
                <i className='fa fa-user fw'></i>
                ` Decline for ${Auth.getScopedUser()['resource']['firstName']}`
            </MenuItem>
        )
    },
    render: () => {
        var id;
        if (Auth.getAuthedUser() == null) {
            return null;
        }
        id = Auth.getAuthedUser()['externalModelId'];
        if (this.props.task.state === TaskStateEnum.UNASSIGNED.name) {
            return (
                <DropdownButton bsStyle='warning' bsSize='xsmall' title='Unassigned'>
                    <MenuItem key={`assign-${id}`} onClick={this.props.takeOwnership}>
                        <i className='fa fa-user fw'></i>
                        Take Ownership
                    </MenuItem>
                    <MenuItem key={`decline-${id}`} onClick={this.props.declineOwnership}>
                        <i className='fa fa-user fw'></i>
                        Decline Ownership
                    </MenuItem>
                    {Auth.getScopedUser() == null ? null : <MenuItem key="divider" divider={true} ></MenuItem> }
                    {this.generateScopedOwnershipElem()}
                    {this.generateScopedDeclineElem()}
                </DropdownButton>
            )
        } else if (this.props.task.state === TaskStateEnum.ASSIGNED.name) {
            return (
                <DropdownButton bsStyle='primary' bsSize='xsmall' title='Assigned'>
                    <MenuItem key={`unassign-${id}`} onClick={this.props.removeOnwership}>
                        <i className='fa fa-user fw'></i>
                        Remove Ownership
                    </MenuItem>
                    <MenuItem key={`close-${id}`} onClick={this.props.close}>
                        <i className='fa fa-user fw'></i>
                        Close
                    </MenuItem>
                </DropdownButton>
            )
        } else if (this.props.task.state === TaskStateEnum.CLOSED.name) {
            return (
                <DropdownButton bsStyle='success' bsSize='xsmall' title='Closed'>
                    <MenuItem key={`assign-${id}`} onClick={this.props.takeOwnership}>
                        <i className='fa fa-user fw'></i>
                        Reopen and Take Ownership
                    </MenuItem>
                </DropdownButton>
            )
        } else {
            return null;
        }
    }
});

module.exports = Component;
