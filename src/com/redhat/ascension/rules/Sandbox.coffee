nools       = require 'nools'
logger      = require('tracer').colorConsole()
prettyjson  = require 'prettyjson'

Sandbox = {}

Sandbox.nools = """
define Message {
    text : '',
    constructor : function(message){
        this.text = message;
    }
}

//find any message that starts with hello
rule Hello {
    when {
        m : Message m.text =~ /^hello(\s*world)?$/;
    }
    then {
        logger.debug("hello found: " + m.text);
        //modify(m, function(){this.text += " goodbye";});
    }
}
"""

Sandbox.executeTest = () ->
  flow = nools.compile Sandbox.nools,
    name: 'helloFlow'
    scope:
      logger: logger

  Message = flow.getDefined("message")

  session = flow.getSession()
  session.on "assert", (fact) -> logger.info "fact asserted"
  session.on "retract", (fact) -> logger.info "fact retracted"
  session.on "modify", (fact) -> logger.info "fact modified"
  session.on "fire", (name, rule) -> logger.info "#{name} was fired"

  session.assert new Message("hello")
  session.assert new Message("hello")
  session.assert new Message("hello")
  session.assert new Message("hello")
  session.assert new Message("hello")
  session.assert new Message("hello")

  session.match().then(() ->
    logger.info "done."
    session.dispose()
  , (err) ->
    logger.error err.stack
  )

  #logger.info "facts: #{prettyjson.render session.getFacts()}"

  #logger.info prettyjson.render m


module.exports = Sandbox

if require.main is module
  Sandbox.executeTest()
