var React = require('react');

var Label = require('react-bootstrap/Label');

module.exports = React.createClass({
    render: function() {
        var sbrs = _.map(this.props.sbrs, (sbr) => {
            return (
                <span>
                    <a href={`#SBRs/${encodeURIComponent(sbr)}`}>
                        <Label bsStyle='primary'>{sbr}</Label>
                    </a>
                    &nbsp;
                </span>
            )
        });
        return (
            <span>{sbrs}</span>
        )
    }
});
