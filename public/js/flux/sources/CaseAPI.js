var Marty                   = require('marty');
var _                       = require('lodash');
var Q                       = require('q');
var CaseSourceActions       = require('../actions/CaseSourceActions');

var API = Marty.createStateSource({
    type: 'http',
    getCase: function (caseNumber) {
        return Q($.ajax({url: `/case/${caseNumber}`}).then((c) => {
            console.debug(`Found case: ${c.resource.caseNumber}`);
            return CaseSourceActions.addCase(c)
        }));
    }
});

module.exports = API;