var React           = require('react/addons');
var WebUtilsMixin   = React.createFactory(require('../../mixins/webUtilsMixin.coffee'));

var Label           = require('react-bootstrap/Label');

var Component = React.createClass({
    propTypes: {
      'case': React.PropTypes.object.isRequired
    },
    displayName: 'CaseProduct',
    mixins: [WebUtilsMixin],
    render: function() {
        var product, version;
        if (this.isDefined(this, 'props.case.resource.product')) {
            return null;
        }
        product = this.props.case.resource.product.resource;
        version = (product != null ? product.version : void 0) || "";
        return <Label bsStyle='default' key='caseProduct'>{`${product['productName']} ${version}`}</Label>;
    }
});

module.exports = Component;
