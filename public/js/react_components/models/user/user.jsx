var React            = require('react/addons');

//# Bootstrap imports
var MenuItem         = React.createFactory(require('react-bootstrap/MenuItem'));
var OverlayTrigger   = React.createFactory(require('react-bootstrap/OverlayTrigger'));
var Popover          = React.createFactory(require('react-bootstrap/Popover'));
var Button           = React.createFactory(require('react-bootstrap/Button'));
//var SplitButton      = require('react-bootstrap/SplitButton');
var Label            = React.createFactory(require('react-bootstrap/Label'));

//# Custom Components
var Timezone         = require('./timezone.jsx');
var Geo              = require('./geo.jsx');


var Component = React.createClass({
    render: () => {
        var user = this.props.user;
        if(user == null) {
            return null;
        }
        if(user.email == null) {
            return (<span>{user.fullName}</span>)
        } else {
            var UserRoles = _.map(user['roles'], (role) => {
               return (
                   // TODO test if the div here is really necessary
                   <div>
                       // TODO talk with adam on waht is actually a unique role identification, name or description ?
                       <Label bsStyle='danger' key={'role' + role['description']}>{role.resource.description}</Label>
                   </div>
               )
            });
            var UserPopover = (
              <Popover title={user.fullName} key='popover'>
                <div key='title'>{user.title}</div>
                <Geo geo={user.superRegion} key='geo'></Geo>
                <Timezone geo={user.timezone} key='timezone'></Timezone>
                <UserRoles />
              </Popover>
            );
            return (
                <OverlayTrigger trigger='hover' placement='bottom' overlay={<UserPopover />}>
                    <Label className='task-meta-data' bsStyle='default' key='label'>{user.fullName}</Label>
                </OverlayTrigger>
            );
        }

    }
  //render: ->
  //  user = @props.user
  //  if not user?
  //    return null
  //
  //  if !user.email?
  //    (span {}, [user.fullName])
  //  else
  //    popover = (Popover {title: user.fullName, key: 'popover'}, [
  //      (div {key: 'title'}, [user.title]),
  //      (Geo
  //        geo: user.superRegion
  //        key: 'userGeo'
  //      ),
  //      nbsp = "\u00A0"
  //      (Timezone
  //        timezone: user.timezone
  //        key: 'userTimezone'
  //      )
  //      nbsp = "\u00A0"
  //      _.map(user.roles, (role) ->
  //        (div {}, [
  //          (Label {bsStyle: 'danger', key: 'role'}, role.resource.description)
  //        ])
  //      )
  //    ])
  //
  //    (OverlayTrigger {trigger: 'hover', placement: 'bottom', overlay: popover},
  //      (Label {className: 'task-meta-data', bsStyle: 'default', key: 'userLabel'}, [user.fullName])
  //      #(Button {bsStyle: 'default', bsSize: 'small'}, [user.fullName])
  //      # (BSplitButton {bsStyle: 'default', bsSize: 'small', title: user.fullName}, [
  //      # (BMenuItem {key: user.email, href: "mailto:#{user.email}"}, ['Send E-Mail'])
  //      # ])
  //    )
});

module.exports = Component
