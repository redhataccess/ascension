var React           = require('react/addons');
var moment          = require('moment');
var cx              = React.addons.classSet;
var _               = require('lodash');
var moment          = require('moment');
var Comment         = require('react-redhat/comment/Comment');
var SlaAttainment   = require('react-redhat/comment/SlaAttainment');

var Alert           = require('react-bootstrap/Alert').State;

var State           = require('react-router/dist/react-router').State;
var CommentActions  = require('../../../flux/actions/CommentActions');
var CommentStore    = require('../../../flux/stores/CommentStore');

var CommentStateMixin = Marty.createStateMixin({
    mixins: [State],
    listenTo: CommentStore,
    getState: function () {
        return {
            comments: CommentStore.getComments(this.props.caseNumber)
        }
    }
});

var Component = React.createClass({
    displayName: 'Comments',
    mixins: [CommentStateMixin],

    genCommentElements: function(comments) {
        if (comments && comments.length > 0) {
            if (_.isNumber(this.props.limit)) {
                comments = comments.slice(0, this.props.limit);
            }
            comments = comments;
            return _.map(comments, (c) => <Comment id={c['externalModelId']} key={c['externalModelId']} comment={c}></Comment>);
        }
        return null;
    },
    componentWillUnmount: function() {
        if (this.state.comments.done) {
            CommentActions.invalidateComments(this.props.caseNumber);
        } else {
            console.warn("Comments promise not done, could not invalidate local cache.");
        }
    },
    renderComments: function () {
        var self = this;
        return this.state.comments.when({
            pending: function () {
                return <i className='fa fa-spinner fa-spin'></i>;
            },
            failed: function (err) {
                console.error(err.stack || err);
                return <Alert bsStyle="danger">Failed to load comments: {err.stack || err}</Alert>;
            },
            done: function (comments) {
		        if (comments == null) {
		            return <Alert bsStyle='warning' key='alert'>No case comments found for this case</Alert>
		        }
		        var negativeSla = _.filter(comments, (comment) => comment.resource["public"] && (comment.resource.sbt != null) && comment.resource.sbt < 0).length;
		        var allSla = _.filter(comments, (comment) => (comment.resource.sbt != null) && comment.resource["public"]).length;

		        return (
		            <div>
		                <SlaAttainment negative={negativeSla} all={allSla}></SlaAttainment>
		                <div
		                    // id={self.props.id}
		                    className='commentsContainer'
		                    key='commentsContainer'
		                    ref='commentsContainer'>
			                {self.genCommentElements(comments)}
		                </div>
		            </div>
		        )
          }
      });
    },
    render: function() {
    	return this.renderComments();
    }
});

module.exports = Component;