var React                   = require('react');

var Component = React.createClass({
    render: function() {
        //var description;
        //description = <span>No description available.</span>;
        //if (this.props.description != null) {
        //    description = <pre className='case description paneled'>{this.props.description}</pre>;
        //}
        return (
            <div key='caseDetailHeader'>
                <div>
                    <h2 key='header'>Case Details</h2>
                </div>
                <hr />
                <div>
                    <div className='pull-left'>
                        <h3 >{`Case #${this.props.case.caseNumber}`}</h3>
                    </div>
                    <div className='pull-right'>
                        <button className='btn btn-secondary'>{`Deny`}</button>
                        &nbsp;
                        <button className='btn btn-secondary'>{`Accept`}</button>
                    </div>
                </div>
                <div className='clearfix'></div>
            </div>
        )
    }
});

module.exports = Component;
