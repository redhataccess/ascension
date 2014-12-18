var React           = require('react/addons');
var cx              = React.addons.classSet;
var Router          = require('react-router/dist/react-router');
var AjaxMixin       = require('../../mixins/ajaxMixin.coffee');
var d3              = require('d3/d3');
var _               = require('lodash');
var moment          = require('moment');
//var Auth            = require('../../auth/auth.coffee');
var Comment         = require('../comment/comment.jsx');
var SlaAttainment   = require('../comment/slaAttainment.jsx');

var Component = React.createClass({
    displayName: 'Comments',
    mixins: [AjaxMixin],
    getInitialState: function() {
        return {
            'loading': false,
            'comments': []
        };
    },
    genCommentElements: function() {
        return _.map(this.state.comments, (c) => <Comment id={c['externalModelId']} key={c['externalModelId']} comment={c}></Comment>);
    },
    queryComments: function(props) {
        var self = this;
        this.setState({'loading': true});
        var opts = {
            path: `/case/${props.caseNumber}/comments`
        };
        this.get(opts)
            .then((comments) => {
                self.setState({
                    'comments': _.zipObject(_.map(comments, (c) => [c['externalModelId'], c] )),
                    'loading': false
                })
            })
            .catch((err) => console.error(`Could not load comments: ${err.stack}`))
            .done(() => self.setState({'loading': false}));

    },
    componentDidMount: function() {
        this.queryComments(this.props);
    },
    render: function() {
        if (this.state.loading === true) {
            return <i className='fa fa-spinner fa-spin'></i>
        }
        if (this.state.comments == null) {
            return <Alert bsStyle='warning' key='alert'>No case comments found for this case</Alert>
        }
        var negativeSla = _.filter(_.values(this.state.comments), (comment) => {
            return comment.resource["public"] && (comment.resource.sbt != null) && comment.resource.sbt < 0;
        }).length;
        var allSla = _.filter(_.values(this.state.comments), function(comment) {
            return (comment.resource.sbt != null) && comment.resource["public"];
        }).length;

        return (
            <div>
                <SlaAttainment negative={negativeSla} all={allSla}></SlaAttainment>
                <div
                    id={this.props.id}
                    className='commentsContainer'
                    key='commentsContainer'
                    ref='commentsContainer'>
                {this.genCommentElements()}
                </div>
            </div>
        )
    }
});

module.exports = Component;
