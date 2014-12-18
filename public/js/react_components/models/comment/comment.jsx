var React       = require('react/addons');
var cx          = React.addons.classSet;

var Timestamp   = require('../case/timestamp.jsx');
var User        = require('../user/user.jsx');

var Component = React.createClass({
    displayName: 'Comment',
    genCommentClasses: function(c) {
        var classSet;
        classSet = {
            'comment': true,
            'private': c["public"] === false,
            'public': c["public"] === true
        };
        return cx(classSet);
    },
    genPanelBodyClasses: function(c) {
        var classSet;
        classSet = {
            'panel-body': true,
            'private': c["public"] === false,
            'public': c["public"] === true
        };
        return cx(classSet);
    },
    genPreClasses: function(c) {
        var classSet;
        classSet = {
            'private': c["public"] === false,
            'public': c["public"] === true,
            'paneled': true
        };
        return cx(classSet);
    },
    render: function() {
        var comment, commentResource, header, timestamp, user;
        commentResource = this.props.comment;
        comment = commentResource.resource || null;
        if (comment.created === comment.lastModified) {
            timestamp = <Timestamp text='created' timestamp={comment.created}></Timestamp>;
        } else {
            timestamp = (
                <span>
                    <Timestamp text='Created' timestamp={comment.created}></Timestamp>
                    &nbsp;
                    <Timestamp text='Last modified' timestamp={comment.lastModified}></Timestamp>
                </span>
            )
        }
        user = comment && comment['createdBy'] && comment['createdBy']['resource'];
        header = (
            <span>
                <div className='pull-left'>
                    <User user={user}></User>
                </div>
                <div className='pull-right'>
                {timestamp}
                </div>
            </span>
        );
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    <h3 className='panel-title'> {header}</h3>
                    <div className='clearfix'></div>
                </div>
                <div className={this.genPanelBodyClasses(comment)}>
                    <pre className={this.genPreClasses(comment)}>{comment.text}</pre>
                </div>
            </div>
        )
    }
});

module.exports = Component;
