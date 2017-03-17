var app = require('./app');
var portFile = require('./portFile');

var port = portFile.port;

app.listen(port, function() {
  console.log('We got the boogie on port', port);
});