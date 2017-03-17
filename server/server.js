var app = require('./app');

var port = 8080;

app.listen(port, function() {
  console.log('We got the boogie on port', port);
});