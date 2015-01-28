var React = require('react');
var Label = require('react-bootstrap/Label');

module.exports = React.createClass({
  display: function() {
    if (this.props.resource.questionSets != null) {
      return ['info', 'Content Review'];
    } else if (this.props.resource["public"] != null) {
      if (this.props.resource["public"]) {
        return ['success', 'Public Comment'];
      } else if (!this.props.resource["public"]) {
        return ['danger', 'Private Comment'];
      }
    } else if ((this.props.resource.subject != null) && (this.props.resource.body != null)) {
      return ['warning', 'Account Note'];
    } else {
      return ['default', 'Unknown Update'];
    }
  },
  render: function() {
    var style, text, _ref;
    _ref = this.display(), style = _ref[0], text = _ref[1];
    return <Label bsStyle={style}>text</Label>
  }
});
