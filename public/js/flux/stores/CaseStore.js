var Marty                   = require('marty');
var _                       = require('lodash');
var CaseConstants           = require('../constants/CaseConstants');
var CaseAPI                 = require('../sources/CaseAPI');

var Store = Marty.createStore({
    name: 'Case Store',
    handlers: {
        addCase: CaseConstants.ADD_CASE
    },
    getInitialState: function () {
        return {};
    },
    getCase: function (caseNumber) {
        return this.fetch({
            id: caseNumber,
            locally: function () {
                return this.state[caseNumber];
            },
            remotely: function () {
                return CaseAPI.getCase(caseNumber);
            }
        });
    },
    // updateCase: function (id, prediction) {
    //     var oldPrediction = _.findWhere(this.state[prediction.id], {id: id});

    //     if (oldPrediction) {
    //         _.extend(oldPrediction, prediction);
    //         this.hasChanged();
    //     }
    // },
    addCase: function (c) {
        this.state[c.resource.caseNumber] = c;
        this.hasChanged();
    },

});
module.exports = Store;

