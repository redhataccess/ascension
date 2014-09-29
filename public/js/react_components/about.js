(function() {
  var Component, React, div, h1, img, li, ul, _ref;

  React = require('react/react-with-addons');

  _ref = React.DOM, div = _ref.div, img = _ref.img, h1 = _ref.h1, ul = _ref.ul, li = _ref.li;

  Component = React.createClass({
    render: function() {
      return h1({}, ['About']);
    }
  });

  module.exports = Component;

}).call(this);
