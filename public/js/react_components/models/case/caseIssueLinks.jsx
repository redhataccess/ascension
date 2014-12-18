var React       = require('react');

var Accordion   = require('react-bootstrap/Accordion');
var Table       = require('react-bootstrap/Table');

var Component = React.createClass({
    render: function() {
        var issuesUI, tableBody;
        issuesUI = <span>No solutions attached.</span>;
        if (this.props.issueLinks != null) {
            tableBody = _.map(this.props.issueLinks, (link) => {
                return (
                    <tr key={link.resource.issueNumber}>
                        <td>{link.resource.issueNumber}</td>
                        <td>{link.resource.source}</td>
                        <td>{link.resource.title}</td>
                        <td>{link.resource.summary}</td>
                    </tr>
                )
            });
            issuesUI = (
                <BTable responsive={true}>
                    <thead>
                        <tr>
                            <th>{`#`}</th>
                            <th>Type</th>
                            <th>Title</th>
                            <th>Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                    {tableBody}
                    </tbody>
                </BTable>
            )
        }
        return (
            <Accordion>
                <Panel
                    key='caseDescription'
                    header='Linked Bugs, Issues, or Feature Requests (Bugzilla, Jira, ...)'
                    collapsable={true}
                    defaultExpanded={false}>{issuesUI}</Panel>
            </Accordion>
        )
    }
});

module.exports = Component;
