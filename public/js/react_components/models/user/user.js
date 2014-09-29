(function() {
  var Button, Component, Geo, Label, MenuItem, OverlayTrigger, Popover, React, SplitButton, Timezone, a, div, h4, li, pre, span, tbody, td, th, thead, tr, ul, _ref;

  React = require('react');

  MenuItem = require('react-bootstrap/MenuItem');

  OverlayTrigger = require('react-bootstrap/OverlayTrigger');

  Popover = require('react-bootstrap/Popover');

  Button = require('react-bootstrap/Button');

  SplitButton = require('react-bootstrap/SplitButton');

  Label = require('react-bootstrap/Label');

  Timezone = require('./timezone.coffee');

  Geo = require('./geo.coffee');

  _ref = React.DOM, ul = _ref.ul, li = _ref.li, div = _ref.div, h4 = _ref.h4, span = _ref.span, thead = _ref.thead, tbody = _ref.tbody, td = _ref.td, tr = _ref.tr, th = _ref.th, pre = _ref.pre, a = _ref.a;

  Component = React.createClass({
    render: function() {
      var nbsp, popover, user;
      user = this.props.user;
      if (user == null) {
        return null;
      }
      if (user.email == null) {
        return span({}, [user.fullName]);
      } else {
        popover = Popover({
          title: user.fullName,
          key: 'popover'
        }, [
          div({
            key: 'title'
          }, [user.title]), Geo({
            geo: user.superRegion,
            key: 'userGeo'
          }), nbsp = "\u00A0", Timezone({
            timezone: user.timezone,
            key: 'userTimezone'
          }), nbsp = "\u00A0", _.map(user.roles, function(role) {
            return Label({
              bsStyle: 'danger',
              key: 'role'
            }, role.resource.description);
          })
        ]);
        return OverlayTrigger({
          trigger: 'hover',
          placement: 'bottom',
          overlay: popover
        }, Button({
          bsStyle: 'default',
          bsSize: 'small'
        }, [user.fullName]));
      }
    }
  });

  module.exports = Component;

}).call(this);
