(->
  (->
    React = require("react")
    ReactTestUtils = require("react/lib/ReactTestUtils")
    TaskHeader = require("../../../../../public/js/react_components/models/task/taskHeader.jsx")
    describe "taskHeader", ->
      it "Should have a taskHeader class", ->
        instance = ReactTestUtils.renderIntoDocument(React.createElement(TaskHeader,
          task: "test-task"
        ))
        assert.ok instance.getDOMNode().children[0].children[0].className.match(/\bCASE-text-color\b/)
        return
      return
    return
  ).call this
  return
).call this
