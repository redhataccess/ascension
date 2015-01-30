var Marty                   = require('marty');
var moment                  = require('moment');
var _                       = require('lodash');
var CommentConstants        = require('../constants/CommentConstants');
var CommentAPI              = require('../sources/CommentAPI');

var Store = Marty.createStore({
    name: 'Comment Store',
    handlers: {
        receiveComments: CommentConstants.RECEIVE_COMMENTS
        // refreshCase: CaseConstants.REFRESH_CASE
    },
    getInitialState: function () {
        return {};
    },
    getComments: function (caseNumber) {
        return this.fetch({
            id: _.padLeft(caseNumber, 8, '0'),
            locally: function () {
                return this.state[_.padLeft(caseNumber, 8, '0')];
            },
            remotely: function () {
                return CommentAPI.getComments(_.padLeft(caseNumber, 8, '0'));
            }
        });
    },
    receiveComments: function (cn, comments) {
        var caseNumber = _.padLeft(cn, 8, '0');
        comments.sort((a, b) => +moment(b.resource.lastModified) - +moment(a.resource.lastModified));
        this.state[caseNumber] = comments;
        this.hasChanged();
    },

});
module.exports = Store;