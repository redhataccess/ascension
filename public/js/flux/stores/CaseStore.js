var Marty                   = require('marty');
var _                       = require('lodash');
var CaseConstants           = require('../constants/CaseConstants');
var CaseAPI                 = require('../sources/CaseAPI');

var Store = Marty.createStore({
    name: 'Case Store',
    handlers: {
        receiveCase: CaseConstants.RECEIVE_CASE
        // refreshCase: CaseConstants.REFRESH_CASE
    },
    getInitialState: function () {
        return {};
    },
    getCase: function (caseNumber) {
        return this.fetch({
            id: _.padLeft(caseNumber, 8, '0'),
            locally: function () {
                return this.state[_.padLeft(caseNumber, 8, '0')];
            },
            remotely: function () {
                return CaseAPI.getCase(_.padLeft(caseNumber, 8, '0'));
            }
        });
    },
    // refreshCase: function (caseNumber) {
    //     return this.fetch({
    //         id: caseNumber,
    //         locally: function () {
    //             console.debug(`Locally returning case ${this.state[caseNumber].resource.caseNumber}`);
    //             return this.state[caseNumber];
    //         },
    //         remotely: function () {
    //             console.debug(`Remotely fetching ${caseNumber}`);
    //             return CaseAPI.getCase(caseNumber);
    //         }
    //     });
    // },
    // updateCase: function (id, prediction) {
    //     var oldPrediction = _.findWhere(this.state[prediction.id], {id: id});

    //     if (oldPrediction) {
    //         _.extend(oldPrediction, prediction);
    //         this.hasChanged();
    //     }
    // },
    receiveCase: function (c) {
        var caseNumber = _.padLeft(c.resource.caseNumber, 8, '0');
        this.state[caseNumber] = c;
        this.hasChanged();
    },

});
module.exports = Store;