var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var VideoData = require('./db').VideoData;
var url = require('url');
var request = require('request');
var config = require('./config');


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
  var queryData = url.parse(req.body.videourl, true).query;

  if (queryData && queryData.v) {
    //'https://www.googleapis.com/youtube/v3/videos?id=' + queryData.v + '&key=AIzaSyDq9XWYzDJrY3jNbZExt8UxHXXNamWbNE0%20&fields=items(id,snippet(title))&part=snippet'


    request('https://www.googleapis.com/youtube/v3/videos?id=' + queryData.v + '&key=' + config.YOUTUBE_API_KEY + '&fields=items(id,snippet(title))&part=snippet', function (err, response, body) {
      if (err) {
        throw err;
      }

      var parseBody = JSON.parse(body);

      VideoData.create({
        videourl: req.body.videourl,
        origin: req.body.origin,
        title: parseBody.items[0].snippet.title,
        upVote: parseInt(req.body.upVote),
        downVote: parseInt(req.body.downVote)
      }).then(function() {
        console.log(`req body ${JSON.stringify(req.body)}`);
        res.send('done');
      });
    });
  }

});

app.put('/api/url/:id', function (req, res) {
  // send -> '/api/url/upvote/_id'
  // send -> '/api/url/downvote/_id'

  // req.body.value

  var id = req.params.id;

  if ((req.body).hasOwnProperty('upVote') || (req.body).hasOwnProperty('downVote')) {
    VideoData.update(req.body, {
      where: {
        id: id,
      }
    });

    res.send('updated for id ' + id);
  } else {
    res.send('error');
  }
});

app.delete('/api/url/:id', function(req, res) {
  VideoData.destroy({ where : {id: req.params.id} }).then(function () {
    res.send('deleted successfully');
  });
});

module.exports = app;