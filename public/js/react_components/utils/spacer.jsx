var React = require('react');

var Component = React.createClass({
    displayName: 'Spacer',
    render: function() {
        return <div className='spacer' key='spacer'></div>
    }
});

module.exports = Component;
