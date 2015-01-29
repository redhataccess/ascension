var Marty           = require('marty');
var CaseConstants   = require('../constants/CaseConstants');


var Actions = Marty.createActionCreators({
    addCase: CaseConstants['ADD_CASE'](function (c) {
        this.dispatch(c)
    })
});
module.exports = Actions;
