var React           = require('react');
var RoutingRoles    = require('../../../../../src/com/redhat/ascension/rules/routing_roles/routingRoles.coffee');
var Label           = require('react-bootstrap/Label');

var Component = React.createClass({
    displayName: 'RoutingRolesDisplay',
    genAssignedRolesLabel: function (defaultRoles, urlRoles) {
        if (defaultRoles == false && urlRoles == false) {
            return (
                <span>
                    <Label bsStyle="success">User Roles Found!</Label>
                &nbsp;
                </span>
            )
        }
        return null;
    },
    genDefaultRolesLabel: function (defaultRoles) {
        if (defaultRoles == true) {
            return (
                <span>
                    <Label bsStyle="warning">No user Roles, assuming defaults</Label>
                    &nbsp;
                </span>
            )
        }
        return null;
    },
    genUrlRolesLabel: function (urlRoles) {
        if (urlRoles == true) {
            return (
                <span>
                    <Label bsStyle="warning">Overriding roles from the URL</Label>
                    &nbsp;
                </span>
            )
        }
        return null;
    },
    genUserRoles: function (roles) {
      return roles.map((r) => <span><Label bsStyle="primary">{r}</Label>&nbsp;</span>)
    },
    render: function() {
        if (this.props.roles == null) {
            return null;
        }
        return (
            <div>
            {this.genAssignedRolesLabel(this.props.defaultRoles, this.props.urlRoles)}
            {this.genDefaultRolesLabel(this.props.defaultRoles)}
            {this.genUrlRolesLabel(this.props.urlRoles)}
            {this.genUserRoles(this.props.roles)}
            </div>
        )
    }
});

module.exports = Component;
