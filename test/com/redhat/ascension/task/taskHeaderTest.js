(function() {
  (function() {
    (function() {
      var React, ReactTestUtils, TaskHeader;
      React = require("react");
      ReactTestUtils = require("react/lib/ReactTestUtils");
      TaskHeader = require("../../../../../public/js/react_components/models/task/taskHeader.jsx");
      describe("taskHeader", function() {
        it("Should have a taskHeader class", function() {
          var instance;
          instance = ReactTestUtils.renderIntoDocument(React.createElement(TaskHeader, {
            task: "test-task"
          }));
          assert.ok(instance.getDOMNode().children[0].children[0].className.match(/\bCASE-text-color\b/));
        });
      });
    }).call(this);
  }).call(this);

}).call(this);

//# sourceMappingURL=taskHeaderTest.js.map
