var React           = require('react/addons');
var Label           = require('react-bootstrap/Label');

var Component = React.createClass({
    displayName: 'TasksStat',
    render: function() {
        return (
            <div>
                <br/>
                <div>
                   <Label  bsStyle='default'>{this.props.tasks.length} out of {this.props.totalCases} cases displayed</Label>
                </div>
                <br/>
                <div>
                   <Label bsStyle='default'>Out of {this.props.tasks.length} displayed, {this.props.numberofOwnerCases} are owned cases and {this.props.numberOfOtherCases} are other cases</Label>
                 </div>
             </div>   

        )
    }
});
module.exports = Component;
