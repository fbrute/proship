'use strict';
var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('[{ "nom" : "tinotte"},{ "nom" : "tinotte2"} ]');
});
server.listen(3000);
