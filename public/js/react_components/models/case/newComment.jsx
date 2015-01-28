var React                 = require('react');
var _                     = require('lodash');

// var CaseStatusComponent   = require('./caseStatusComponent.coffee');
var CommentType           = require('./commentType.jsx');

// React Bootstrap imports
var Label                 = require('react-bootstrap/Label');
var Modal                 = require('react-bootstrap/Modal');
var Button                = require('react-bootstrap/Button');
var Input                 = require('react-bootstrap/Input');
var DropdownButton        = require('react-bootstrap/DropdownButton');
var MenuItem              = require('react-bootstrap/MenuItem');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      isSaving: false,
      comment: this.props.comment
    };
  },
  componentWillUnmount: function() {
    this.props.setComment(this.state.comment);
  },
  getDefaultValue: function(component) {
    var items = _.filter(this.state.comment, (item) => item.name === component );
    if ((items != null) && items.length > 0) {
      return items.pop().value;
    }
  },
  toggleCommentType: function() {
    var items = _.filter(this.state.comment, (item) => item.name !== 'public' );
    this.setState({
      comment: _.union(items, [
        {
          'name': 'public',
          'value': !this.getDefaultValue('public')
        }
      ])
    });
  },
  updateStatus: function(newStatus) {
    var items = _.filter(this.state.comment, (item) => item.name !== 'status' && item.name !== 'internalStatus');
    this.setState({
      comment: _.union(items, [
        {
          'name': 'status',
          'value': newStatus
        }, {
          'name': 'internalStatus',
          'value': newStatus
        }
      ])
    });
  },
  render: function() {
    var commentStyle, self, statusStyle;
    self = this;
    commentStyle = self.getDefaultValue("public") ? 'success' : 'danger';
    statusStyle = 'success';
    if (self.getDefaultValue("status") === 'Waiting on Customer') {
      statusStyle = 'info';
    } else if (self.getDefaultValue("status") === 'Waiting on Red Hat') {
      statusStyle = 'warning';
    }
    // var caseStatus = <CaseStatus status={this.getDefaultValue("status")} internalStatus={this.getDefaultValue("internalStatus")}></CaseStatus>;
    var caseStatus = this.getDefaultValue("status") + " " + this.getDefaultValue("internalStatus");
    return (
      <Modal animation={false} keyboard={true} title="Submit a Comment" onRequestHide={this.hide}>
        <form onSubmit={this.submitNewComment}>
          <div className="modal-body">
            <div className="pull-left">
              <DropdownButton pullRight={true} disabled={true} bsStyle="large" title={caseStatus}>
                <MenuItem onSelect={this.updateStatus} key="woc">Waiting on Customer</MenuItem>
                <MenuItem onSelect={this.updateStatus} key="worh">Waiting on Red Hat</MenuItem>
                <MenuItem onSelect={this.updateStatus} key="closed">Closed</MenuItem>
              </DropdownButton>
            </div>
            <div className="pull-right">
              <Button onClick={this.toggleCommentType} bsStyle={commentStyle} bsSize="large">
                <CommentType resource={{public: this.getDefaultValue("public")}}></CommentType>
              </Button>
            </div>
            <br />
            <br />
            <br />
            <Input type="textarea" ref="comment" rows={10} defaultValue={this.getDefaultValue("comment")}/>
          </div>
          <div className="modal-footer">
            <Button type="submit" bsStyle="primary" disabled={this.state.isSaving}>Submit</Button>
          </div>
        </form>
      </Modal>
    );
  },
  submitNewComment: function() {
    var comment, commentType, self, url, self = this;
    this.setState({isSaving: true});
    commentType = self.getDefaultValue('public') ? 'public' : 'private';
    url = "" + this.props.url + "/" + commentType;
    comment = $(self.refs['comment'].getDOMNode()).children('textarea').val().trim();
    $.ajax(url, {
      type: 'POST',
      data: JSON.stringify("" + comment),
      contentType: "application/json; charset=utf-8",
      error: (function(jqXHR, textStatus, errorThrown) {
        console.log("Error submitting a new comment.");
        self.hide();
        return self.props.showDangerAlert("Cannot submit comment. You most probably need to login to http://gss.my.salesforce.com");
      }).bind(this),
      success: (function(result, textStatus, jqXHR) {
        console.log("Comment saved: " + result);
        self.setState({
          isSaving: false,
          comment: _.filter(this.state.comment, function(item) {
            return item.name === 'status' || item.name === 'internalStatus' || item.name === 'public';
          })
        });
        self.props.onRequestHide();
        self.props.showSuccessAlert("Comment submitted successfully");
        return self.props.refreshParentComponent();
      }).bind(this)
    });
    return false;
  },
  hide: function() {
    var items, textAreas;
    textAreas = _.filter(_.map($(this.getDOMNode()).find('textarea'), function(textarea) {
      if (textarea.value.trim() !== '') {
        return {
          'name': textarea.id,
          'value': textarea.value
        };
      }
    }), function(item) {
      return item != null;
    });
    items = _.filter(this.state.comment, (item) => item.name === 'status' || item.name === 'internalStatus' || item.name === 'public');
    this.setState({'comment': _.union(items, textAreas)});
    return this.props.onRequestHide();
  }
});
