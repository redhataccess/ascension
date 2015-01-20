var React               = require('react');
//var AjaxMixin           = require('../../mixins/ajaxMixin.coffee');
var User                = require('react-redhat/user/User');
//var Auth                = require('../../auth/auth.coffee');
var TaskActionsEnum     = require('../../../../../src/com/redhat/ascension/rest/enums/taskActionsEnum.coffee');
var TaskTypeEnum        = require('../../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');

var Accordion           = require('react-bootstrap/Accordion');
var Panel               = require('react-bootstrap/Panel');
var Table               = require('react-bootstrap/Table');

var Component = React.createClass({
    displayName: 'Case Associates',
    displayOwner: function(owner) {
        if (owner == null) {
            return [ 'danger', <span></span>];
        } else {
            return [
                'default',
                <tr key={owner.resource.externalModelId}>
                    <td>Owner</td>
                    <td><User resource={owner.resource}></User></td>
                </tr>
            ];
        }
    },
    render: function() {
        var associates, associatesUI, owner, associateElements;
        owner = this.props.owner;
        associates = this.props.associates;

        var [ownerStyle, ownerElement] = this.displayOwner(owner);

        associateElements = _.map(associates, function (associate) {
            return (
                <tr>
                    <td>{associate.resource.role}</td>
                    <td><User resource={associate.resource.associate}></User></td>
                </tr>
            )
        });

        associatesUI = <span>No Red Hat Associates are assigned to this Case.</span>;
        if ((associates != null) || (ownerElement != null)) {
            associatesUI = (
                <Table responsive={true}>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Associate</th>
                        </tr>
                    </thead>
                    <tbody>
                    {ownerElement}
                    {associateElements}
                    </tbody>
                </Table>
            )
        }
        return (
            <Accordion>
                <Panel
                    eventKey='caseSupportAssociates'
                    key='caseSupportAssociates'
                    header='Support Associates'
                    bsStyle={ownerStyle}
                    collapsable={true}
                    defaultExpanded={false}
                >{associatesUI}</Panel>
            </Accordion>
        )
    }
});

module.exports = Component;
