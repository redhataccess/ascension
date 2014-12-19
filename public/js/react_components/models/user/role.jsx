var React           = require('react');
var _               = require('lodash');
var Sbrs            = require('./sbrs.jsx');
var Geo             = require('./geo.jsx');
var Label          = require('react-bootstrap/Label');
var Popover        = require('react-bootstrap/Popover');
var OverlayTrigger = require('react-bootstrap/OverlayTrigger');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            parentUser: void 0
        };
    },
    refreshParentComponent: function() {
        var self = this;
        if (this.props.role.resource.parentUser != null) {
            $.get(`/user/${this.props.role.resource.parentUser.externalModelId}`, ((result) => {
                self.setState({parentUser: _.first(JSON.parse(result))});
            }));
        }
    },
    componentDidMount: function() {
        this.refreshParentComponent();
    },
    render: function() {
        var isParent, role, roleDesc, roleDescRes, roleStyle, user, roleLink, overlayPopover, geoComponent, sbrsComponent;
        role = this.props.role;
        user = this.props.user;
        isParent = role.resource.parentRole == null;
        roleDescRes = [];
        if (isParent) {
            roleDescRes.push(<i className='fa fa-users'></i>);
            //roleDescRes.push(' ');
        }
        if (isParent && (user != null)) {
            roleLink = (
                <a className='label-link' href={`#Roles/${encodeURIComponent(role.resource.name)}/${user.externalModelId}`}>
                {role.resource.description}
                </a>
            );
            roleDescRes.push(roleLink);
        } else {
            if (this.state.parentUser != null) {
                roleLink = (
                    <span>
                        <span>{role.resource.description}</span>
                        <span>: </span>
                        <a className='label-link' href={`#Roles/${encodeURIComponent(role.resource.parentRole.resource.name)}/${this.state.parentUser.externalModelId}`}>
                        {this.state.parentUser.resource.fullName}
                        </a>
                    </span>
                )
            } else {
                roleLink = <span>{role.resource.description}</span>
            }
            roleDescRes.push(roleLink);
        }
        roleDesc = <span>{roleDescRes}</span>;
        if (!isParent) {
            roleStyle = 'danger';
        }
        if (isParent) {
            roleStyle = 'default';
        }
        overlayPopover = (
            <Popover title={role.resource.description}>
                <Sbrs sbrs={role.resource.sbrs}></Sbrs>
            </Popover>
        );
        geoComponent = role.resource.superRegion != null ? <Geo geo={role.resource.superRegion}></Geo> : null;
        sbrsComponent = role.resource.sbrs != null ? <Sbrs sbrs={role.resource.sbrs}></Sbrs>: null;
        return (
            <span>
                &nbsp;
                <OverlayTrigger overlay={overlayPopover} placement='bottom'>
                    <div>
                        <Label bsStyle={roleStyle}>{roleDesc}</Label>
                        {geoComponent}
                        {sbrsComponent}
                    </div>
                </OverlayTrigger>
            </span>
        )
    }
});
