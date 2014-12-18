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
                <div>
                    <div className='pull-left'>
                        <h2 key='header'>{`Case ${this.props.case.caseNumber}`}</h2>
                    </div>
                    <div className='pull-right'>
                        <CaseProduct case={this.props.case} key='product'></CaseProduct>
                    </div>
                </div>
                <div className='clearfix'></div>
                <span key='headerSubject'>{this.props.case.subject}</span>
            </Well>
        )
    }
});

module.exports = Component;
