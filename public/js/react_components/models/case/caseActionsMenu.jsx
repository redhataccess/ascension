var React                      = require('react');
var NewComment                 = require('./newComment.jsx');
var Label                      = require('react-bootstrap/Label');
var Col                        = require('react-bootstrap/Col');
var DropdownButton             = require('react-bootstrap/DropdownButton');
var MenuItem                   = require('react-bootstrap/MenuItem');
var SplitButton                = require('react-bootstrap/SplitButton');
var Button                     = require('react-bootstrap/Button');
var ButtonGroup                = require('react-bootstrap/ButtonGroup');
var ButtonToolbar              = require('react-bootstrap/ButtonToolbar');
var ModalTrigger               = require('react-bootstrap/ModalTrigger');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      contentReview: {},
      comment: [
        {
          'name': 'status',
          'value': this.props.resource.resource.status
        }, {
          'name': 'internalStatus',
          'value': this.props.resource.resource.internalStatus
        }, {
          'name': 'public',
          'value': false
        }
      ]
    };
  },
  setContentReview: function(review) {
    this.setState({ 'contentReview': review });
  },
  setComment: function(comment) {
    this.setState({ 'comment': comment });
  },
  render: function() {
    var newCommentModal = <NewComment caseNumber={this.props.caseNumber}
      onRequestHide={this.toggle}
      refreshParentComponent={this.props.refreshParentComponent}
      showSuccessAlert={this.props.showSuccessAlert}
      showDangerAlert={this.props.showDangerAlert}
      setComment={this.setComment}
      url={`/case/${this.props.caseNumber}/comments`}
      isUserAuthenticated={this.props.isUserAuthenticated}
      authenticatedUser={this.props.authenticatedUser}></NewComment>
    // <Button disabled={!this.props.isUserAuthenticated()} bsSize="small">Comment</Button>
    return (
      <ModalTrigger modal={newCommentModal}>
        <Button disabled={false} bsSize="small">Comment</Button>
      </ModalTrigger>
    );
  }
});
