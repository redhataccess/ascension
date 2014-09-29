(function() {
  var express, router;

  express = require('express');

  router = express.Router();

  router.get('/', function(req, res) {
    return res.send('Hello World!');
  });

  module.exports = router;

}).call(this);

//# sourceMappingURL=hello.js.map
