var React       = require('react');
var CaseProduct = require('./caseProduct.jsx');

var Well        = require('react-bootstrap/Well');

var Component = React.createClass({
    render: function() {
        //var description;
        //description = <span>No description available.</span>;
        //if (this.props.description != null) {
        //    description = <pre className='case description paneled'>{this.props.description}</pre>;
        //}
        return (
            <Well key='caseHeader'>
                <h2 key='header'>`Case ${this.props["case"].resource.caseNumber}`</h2>
                <span key='headerSubject'>{this.props.case.resource.subject}</span>
                <CaseProduct case={this.props.case} key='product'></CaseProduct>
            </Well>
        )
    }
});

module.exports = Component;
