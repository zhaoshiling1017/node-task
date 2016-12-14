var http = require('http'),
    url = require('url'),
    util = require('util'),
    _ = require('underscore'),
    querystring = require('querystring');

var HttpClient = function(urlStr) {
  this.urlStr = urlStr;
}

HttpClient.prototype.get = function() {
  var parsedUrl = url.parse(this.urlStr, true); 
  var options = {host: null, port: -1, path: null, method: 'GET'};
  options.host = parsedUrl.hostname;
  options.port = parsedUrl.port;
  options.path = parsedUrl.pathname;
  if (parsedUrl.search) {
    options.path += parsedUrl.search;
  }
  var req = http.request(options, function(res){
    util.log('STATUS: ' + res.statusCode);
    util.log('HEADERS: ' + util.inspect(res.headers));
    res.setEncoding('utf8');
    res.on('data', function(chunk){
      util.log('BODY: ' + chunk);
    });
    res.on('error', function(err){
      util.log('RESPONSE ERROR: ' + err);
    });
  });

  req.on('error', function(err){
    util.log('REQUEST ERROR: ' + err);
  });
  req.end();
}

HttpClient.prototype.post = function(content) {
  var parsedUrl = url.parse(this.urlStr, true);
  var options = {
    host: parsedUrl.hostname,
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': content.length
    }
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk){
      util.log('BODY: ' + chunk);
    });
    res.on('error', function(err) {
      util.log('RESPONSE ERROR: ' + err);
    });
  });

  req.on('error', function(err) {
    util.log('REQUST ERROR: ' + err);
  });

  req.write(content);
  req.end();
}

module.exports = HttpClient;
