(function() {
  var Sandbox, logger, nools, prettyjson;

  nools = require('nools');

  logger = require('tracer').colorConsole();

  prettyjson = require('prettyjson');

  Sandbox = {};

  Sandbox.nools = "define Message {\n    text : '',\n    constructor : function(message){\n        this.text = message;\n    }\n}\n\n//find any message that starts with hello\nrule Hello {\n    when {\n        m : Message m.text =~ /^hello(\s*world)?$/;\n    }\n    then {\n        logger.debug(\"hello found: \" + m.text);\n        //modify(m, function(){this.text += \" goodbye\";});\n    }\n}";

  Sandbox.executeTest = function() {
    var Message, flow, session;
    flow = nools.compile(Sandbox.nools, {
      name: 'helloFlow',
      scope: {
        logger: logger
      }
    });
    Message = flow.getDefined("message");
    session = flow.getSession();
    session.on("assert", function(fact) {
      return logger.info("fact asserted");
    });
    session.on("retract", function(fact) {
      return logger.info("fact retracted");
    });
    session.on("modify", function(fact) {
      return logger.info("fact modified");
    });
    session.on("fire", function(name, rule) {
      return logger.info("" + name + " was fired");
    });
    session.assert(new Message("hello"));
    session.assert(new Message("hello"));
    session.assert(new Message("hello"));
    session.assert(new Message("hello"));
    session.assert(new Message("hello"));
    session.assert(new Message("hello"));
    return session.match().then(function() {
      logger.info("done.");
      return session.dispose();
    }, function(err) {
      return logger.error(err.stack);
    });
  };

  module.exports = Sandbox;

  if (require.main === module) {
    Sandbox.executeTest();
  }

}).call(this);
