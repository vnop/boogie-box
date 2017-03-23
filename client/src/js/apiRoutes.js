// all callbacks in this file are expected to be in this form:
// cb(err, val) where err is any error recieved, and val
// is the value upon which to operate. If no error, call as
// cb(null, val)


// Gets the title of a video using its URL.
// url: takes a video URL for the video in
//      in question
// cb: takes a callback that gets run on the
//     new, returned title string
var getVideoTitle = function(url, cb) {
  return 'standin video title';
};

// Retrieves videos from DB via server connection
//  cb: Takes a callback that gets run on the array
//      returned by the server
var getVideos = function(cb) {

  if (!cb) {
    var cb = function(err, val) {
      console.log('error:', err);
      console.log('response:', val);
    }
  }

  $.ajax({
    method: 'GET',
    url: '/api/url',
    success: function(data) {
      console.log('response on getVideos', JSON.stringify(data));
      cb(null, data);
    },

    error: function(err) {
      console.log('error on getVideos', err);
      cb(err);
    }
  });
}


// Adds video to DB via server connection
//  url: takes the URL of the new video
//  cb: Takes a callback that gets run on
//      the server's response
var postVideo = function(url, cb) {

  if (!cb) {
    var cb = function(err, val) {
      console.log('error:', err);
      console.log('response:', val);
    }
  }

  var video = {
    videourl: url,
    origin: 'youtube',
    title: getVideoTitle(url),
    upVote: 0,
    downVote: 0
  }


  $.ajax({
    method: 'POST',
    url: '/api/url',
    dataType: 'json',
    data: video,
    success: function(response) {
      console.log('response on postVideo', JSON.stringify(response));
      cb(null, response);
    },
    error: function(err) {
      console.log('error on postVideo', err);
      cb(err);
    }
  });
};


// Removes a video from the queue via server connection
// video: takes a video object (in the format the server
//        originally sent it in)
// cb: takes a callback that gets run on the server's
//     response
var removeVideo = function(video, cb) {

  if (!cb) {
    var cb = function(err, val) {
      console.log('error:', err);
      console.log('response:', val);
    }
  }

  $.ajax({
    method: 'DELETE',
    url: '/api/url' + video.id,
    success: function(response) {
      console.log('response on removeVideo', JSON.stringify(response));
      cb(null, response);
    },
    error: function(err) {
      console.log('error on removeVideo', err);
      cb(err);
    }
  })
};


window.apiHelper = {
  getVideos: getVideos,
  postVideo: postVideo,
  removeVideo: removeVideo
};