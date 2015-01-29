var Marty = require('marty');
var UserConstants = require('../constants/UserConstants');

var UserActions = Marty.createActionCreators({
    click: UserConstants.USER_CLICK(function (user, params, query) {
        this.dispatch(user, params, query);
    })
});
module.exports = UserActions;
