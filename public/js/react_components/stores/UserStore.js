var Marty           = require('marty');
var _               = require('lodash');
var UserConstants   = require('../constants/UserConstants');

var UserStore = Marty.createStore({
    handlers: {
        click: UserConstants.USER_CLICK
    },

    getInitialState: function () {
        return {};
    },

    click: function (user, params, query) {
        if (user) {

        }
        text = text.trim();

        if (text) {
            // Hand waving here -- not showing how this interacts with XHR or persistent
            // server-side storage.
            // Using the current timestamp + random number in place of a real id.
            var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
            this.state[id] = {
                id: id,
                complete: false,
                text: text
            };
            this.hasChanged();
        }
    }
});

module.exports = UserStore;