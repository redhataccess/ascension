var restify = require('restify');
var stratajs = require('stratajs');

function onError(err) {
    console.error(err.stack || err.message || err)
}

function respond(req, res, next) {
    res.send('hello ' + req.params.name);
    next();
}

function searchKcs(req, res, next) {
    console.log("Searching strata with: " + req.params.input);
    stratajs.solutions.search(req.params.input, function(data) {
        if (data) console.log("Returning " + data.length + " results.");
        res.send(data);
        next();
    }, function onError(err) {
        res.send(err.stack || err.message || err);
        next();
    });
}

var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.get('/search/kcs/:input', searchKcs);
server.head('/search/kcs/:input', searchKcs);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
