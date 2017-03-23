var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var { VideoData } = require('./db');

var app = express();

app.use(express.static(path.join(__dirname, '../client')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/url', function(req, res) {
  VideoData.findAll({}).then(function(urls) {
    console.log(`urls ${JSON.stringify(urls)}`);
    res.send(urls);
  });

});

app.post('/api/url', function(req, res) {
  VideoData.create({  videourl: req.body.videourl,
    origin: req.body.origin,
    title: req.body.title,
    upVote: parseInt(req.body.upVote),
    downVote: parseInt(req.body.downVote)
  }).then(function(){
    console.log(`req body ${JSON.stringify(req.body)}`);
    res.send('done');
  });
});

app.delete('/api/url/:id', function(req, res) {
  VideoData.destroy({where : {id: req.params.id}}).then(function () {
    res.send('deleted successfully');
  });
});

module.exports = app;