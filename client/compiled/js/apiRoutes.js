'use strict';

// all callbacks in this file are expected to be in this form:
// cb(err, val) where err is any error recieved, and val
// is the value upon which to operate. If no error, call as
// cb(null, val)

// In any case, if a callback is not given, the default is just to
// log the response and error to the console:

var defaultCallback = function defaultCallback(err, val) {
  if (err) {
    console.log('error:', err);
  } else {
    console.log('response:', val);
  }
};

// Retrieves videos from DB via server connection
//  cb: Takes a callback that gets run on the array
//      returned by the server
var getVideos = function getVideos(cb) {

  if (!cb) {
    var cb = defaultCallback;
  }

  $.ajax({
    method: 'GET',
    url: '/api/url',
    success: function success(data) {
      cb(null, data);
    },

    error: function error(err) {
      cb(err);
    }
  });
};

// Adds video to DB via server connection
//  url: takes the URL of the new video
//  cb: Takes a callback that gets run on
//      the server's response
var postVideo = function postVideo(url, cb) {

  if (!cb) {
    var cb = defaultCallback;
  }

  var video = {
    videourl: url,
    origin: 'youtube',
    // title: getVideoTitle(url),
    upVote: 0,
    downVote: 0
  };

  $.ajax({
    method: 'POST',
    url: '/api/url',
    data: video,
    success: function success(response) {
      console.log('response on postVideo', JSON.stringify(response));
      cb(null, response);
    },
    error: function error(err) {
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
var removeVideo = function removeVideo(video, cb) {

  if (!cb) {
    var cb = defaultCallback;
  }

  $.ajax({
    method: 'DELETE',
    url: '/api/url/' + video.id,
    success: function success(response) {
      console.log('response on removeVideo', JSON.stringify(response));
      cb(null, response);
    },
    error: function error(err) {
      console.log('error on removeVideo', err);
      cb(err);
    }
  });
};

// Used for voting on queue elements
// vote: takes an object to define the
//       vote to be made. Options:
//       {upVote: true}
//       {downVote: true}
// video: the video object on which
//        the vote is being cast
// cb: optional callback that gets run
//     on the server's respopnse to the
//     vote call
var vote = function vote(_vote, video, cb) {
  if (!cb) {
    var cb = defaultCallback;
  }

  $.ajax({
    method: 'PUT',
    url: '/api/url/' + video.id,
    data: _vote,
    success: function success(response) {
      console.log('response on removeVideo', JSON.stringify(response));
      cb(null, response);
    },
    error: function error(err) {
      console.log('error on removeVideo', err);
      cb(err);
    }
  });
};

// Creating chat requests
var getChat = function getChat() {
  var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultCallback;

  $.ajax({
    method: 'GET',
    url: '/api/chat',
    success: function success(data) {
      cb(null, data);
    },
    error: function error(err) {
      cb(err);
    }
  });
};

var postChat = function postChat(message) {
  var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultCallback;


  $.ajax({
    method: 'POST',
    url: '/api/chat',
    data: message,
    success: function success(response) {
      console.log('response on postChat', JSON.stringify(response));
      return cb(null, response);
    },
    error: function error(err) {
      console.log('error on postChat', err);
      cb(err);
    }
  });
};

var getUserFromSession = function getUserFromSession() {
  var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultCallback;

  $.ajax({
    method: 'GET',
    url: '/api/user',
    success: function success(name) {
      cb(null, name);
    },
    error: function error(err) {
      cb(err);
    }
  });
};

// Creating user request
var postUserToSession = function postUserToSession(user) {
  var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultCallback;


  var user = { name: user };

  $.ajax({
    method: 'POST',
    url: '/api/user',
    data: user,
    success: function success(response) {
      cb(null, response);
    },
    error: function error(err) {
      console.error('error on posting user:', err);
      cb(err);
    }
  });
};

// Get votes from session if any
var getVotes = function getVotes() {
  var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultCallback;

  $.ajax({
    method: 'GET',
    url: '/api/votes',
    success: function success(votes) {
      cb(null, votes);
    },
    error: function error(err) {
      console.error('error on getting votes:', err);
      cb(err);
    }
  });
};

// Post vote to session
var postVote = function postVote(vote) {
  var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultCallback;

  $.ajax({
    method: 'POST',
    url: '/api/votes',
    data: vote,
    success: function success(response) {
      cb(null, response);
    },
    error: function error(err) {
      console.error('error on posting vote:', err);
      cb(err);
    }
  });
};

// Exports all the api helpers. use apiHelper.<method> to invoke any
// function in this file.
window.apiHelper = {
  getVideos: getVideos,
  postVideo: postVideo,
  removeVideo: removeVideo,
  vote: vote,
  getChat: getChat,
  postChat: postChat,
  getUserFromSession: getUserFromSession,
  postUserToSession: postUserToSession,
  getVotes: getVotes,
  postVote: postVote
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9hcGlSb3V0ZXMuanMiXSwibmFtZXMiOlsiZGVmYXVsdENhbGxiYWNrIiwiZXJyIiwidmFsIiwiY29uc29sZSIsImxvZyIsImdldFZpZGVvcyIsImNiIiwiJCIsImFqYXgiLCJtZXRob2QiLCJ1cmwiLCJzdWNjZXNzIiwiZGF0YSIsImVycm9yIiwicG9zdFZpZGVvIiwidmlkZW8iLCJ2aWRlb3VybCIsIm9yaWdpbiIsInVwVm90ZSIsImRvd25Wb3RlIiwicmVzcG9uc2UiLCJKU09OIiwic3RyaW5naWZ5IiwicmVtb3ZlVmlkZW8iLCJpZCIsInZvdGUiLCJnZXRDaGF0IiwicG9zdENoYXQiLCJtZXNzYWdlIiwiZ2V0VXNlckZyb21TZXNzaW9uIiwibmFtZSIsInBvc3RVc2VyVG9TZXNzaW9uIiwidXNlciIsImdldFZvdGVzIiwidm90ZXMiLCJwb3N0Vm90ZSIsIndpbmRvdyIsImFwaUhlbHBlciJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLElBQUlBLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBU0MsR0FBVCxFQUFjQyxHQUFkLEVBQW1CO0FBQ3ZDLE1BQUlELEdBQUosRUFBUztBQUNQRSxZQUFRQyxHQUFSLENBQVksUUFBWixFQUFzQkgsR0FBdEI7QUFDRCxHQUZELE1BRU87QUFDTEUsWUFBUUMsR0FBUixDQUFZLFdBQVosRUFBeUJGLEdBQXpCO0FBQ0Q7QUFDRixDQU5EOztBQVFBO0FBQ0E7QUFDQTtBQUNBLElBQUlHLFlBQVksU0FBWkEsU0FBWSxDQUFTQyxFQUFULEVBQWE7O0FBRTNCLE1BQUksQ0FBQ0EsRUFBTCxFQUFTO0FBQ1AsUUFBSUEsS0FBS04sZUFBVDtBQUNEOztBQUVETyxJQUFFQyxJQUFGLENBQU87QUFDTEMsWUFBUSxLQURIO0FBRUxDLFNBQUssVUFGQTtBQUdMQyxhQUFTLGlCQUFTQyxJQUFULEVBQWU7QUFDdEJOLFNBQUcsSUFBSCxFQUFTTSxJQUFUO0FBQ0QsS0FM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QSxTQUZNO0FBR2pCUyxlQUFhQSxXQUhJO0FBSWpCRSxRQUFNQSxJQUpXO0FBS2pCQyxXQUFTQSxPQUxRO0FBTWpCQyxZQUFVQSxRQU5PO0FBT2pCRSxzQkFBb0JBLGtCQVBIO0FBUWpCRSxxQkFBbUJBLGlCQVJGO0FBU2pCRSxZQUFVQSxRQVRPO0FBVWpCRSxZQUFVQTtBQVZPLENBQW5CIiwiZmlsZSI6ImFwaVJvdXRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGFsbCBjYWxsYmFja3MgaW4gdGhpcyBmaWxlIGFyZSBleHBlY3RlZCB0byBiZSBpbiB0aGlzIGZvcm06XG4vLyBjYihlcnIsIHZhbCkgd2hlcmUgZXJyIGlzIGFueSBlcnJvciByZWNpZXZlZCwgYW5kIHZhbFxuLy8gaXMgdGhlIHZhbHVlIHVwb24gd2hpY2ggdG8gb3BlcmF0ZS4gSWYgbm8gZXJyb3IsIGNhbGwgYXNcbi8vIGNiKG51bGwsIHZhbClcblxuLy8gSW4gYW55IGNhc2UsIGlmIGEgY2FsbGJhY2sgaXMgbm90IGdpdmVuLCB0aGUgZGVmYXVsdCBpcyBqdXN0IHRvXG4vLyBsb2cgdGhlIHJlc3BvbnNlIGFuZCBlcnJvciB0byB0aGUgY29uc29sZTpcblxudmFyIGRlZmF1bHRDYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgdmFsKSB7XG4gIGlmIChlcnIpIHtcbiAgICBjb25zb2xlLmxvZygnZXJyb3I6JywgZXJyKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygncmVzcG9uc2U6JywgdmFsKTtcbiAgfVxufVxuXG4vLyBSZXRyaWV2ZXMgdmlkZW9zIGZyb20gREIgdmlhIHNlcnZlciBjb25uZWN0aW9uXG4vLyAgY2I6IFRha2VzIGEgY2FsbGJhY2sgdGhhdCBnZXRzIHJ1biBvbiB0aGUgYXJyYXlcbi8vICAgICAgcmV0dXJuZWQgYnkgdGhlIHNlcnZlclxudmFyIGdldFZpZGVvcyA9IGZ1bmN0aW9uKGNiKSB7XG5cbiAgaWYgKCFjYikge1xuICAgIHZhciBjYiA9IGRlZmF1bHRDYWxsYmFjaztcbiAgfVxuXG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICB1cmw6ICcvYXBpL3VybCcsXG4gICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY2IobnVsbCwgZGF0YSk7XG4gICAgfSxcblxuICAgIGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNiKGVycik7XG4gICAgfVxuICB9KTtcbn1cblxuXG4vLyBBZGRzIHZpZGVvIHRvIERCIHZpYSBzZXJ2ZXIgY29ubmVjdGlvblxuLy8gIHVybDogdGFrZXMgdGhlIFVSTCBvZiB0aGUgbmV3IHZpZGVvXG4vLyAgY2I6IFRha2VzIGEgY2FsbGJhY2sgdGhhdCBnZXRzIHJ1biBvblxuLy8gICAgICB0aGUgc2VydmVyJ3MgcmVzcG9uc2VcbnZhciBwb3N0VmlkZW8gPSBmdW5jdGlvbih1cmwsIGNiKSB7XG5cbiAgaWYgKCFjYikge1xuICAgIHZhciBjYiA9IGRlZmF1bHRDYWxsYmFjaztcbiAgfVxuXG4gIHZhciB2aWRlbyA9IHtcbiAgICB2aWRlb3VybDogdXJsLFxuICAgIG9yaWdpbjogJ3lvdXR1YmUnLFxuICAgIC8vIHRpdGxlOiBnZXRWaWRlb1RpdGxlKHVybCksXG4gICAgdXBWb3RlOiAwLFxuICAgIGRvd25Wb3RlOiAwXG4gIH1cblxuXG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiAnL2FwaS91cmwnLFxuICAgIGRhdGE6IHZpZGVvLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzcG9uc2Ugb24gcG9zdFZpZGVvJywgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICAgIGNiKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdlcnJvciBvbiBwb3N0VmlkZW8nLCBlcnIpO1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0pO1xufTtcblxuXG4vLyBSZW1vdmVzIGEgdmlkZW8gZnJvbSB0aGUgcXVldWUgdmlhIHNlcnZlciBjb25uZWN0aW9uXG4vLyB2aWRlbzogdGFrZXMgYSB2aWRlbyBvYmplY3QgKGluIHRoZSBmb3JtYXQgdGhlIHNlcnZlclxuLy8gICAgICAgIG9yaWdpbmFsbHkgc2VudCBpdCBpbilcbi8vIGNiOiB0YWtlcyBhIGNhbGxiYWNrIHRoYXQgZ2V0cyBydW4gb24gdGhlIHNlcnZlcidzXG4vLyAgICAgcmVzcG9uc2VcbnZhciByZW1vdmVWaWRlbyA9IGZ1bmN0aW9uKHZpZGVvLCBjYikge1xuXG4gIGlmICghY2IpIHtcbiAgICB2YXIgY2IgPSBkZWZhdWx0Q2FsbGJhY2s7XG4gIH1cblxuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgdXJsOiAnL2FwaS91cmwvJyArIHZpZGVvLmlkLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzcG9uc2Ugb24gcmVtb3ZlVmlkZW8nLCBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgICAgY2IobnVsbCwgcmVzcG9uc2UpO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgICAgY29uc29sZS5sb2coJ2Vycm9yIG9uIHJlbW92ZVZpZGVvJywgZXJyKTtcbiAgICAgIGNiKGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cblxuLy8gVXNlZCBmb3Igdm90aW5nIG9uIHF1ZXVlIGVsZW1lbnRzXG4vLyB2b3RlOiB0YWtlcyBhbiBvYmplY3QgdG8gZGVmaW5lIHRoZVxuLy8gICAgICAgdm90ZSB0byBiZSBtYWRlLiBPcHRpb25zOlxuLy8gICAgICAge3VwVm90ZTogdHJ1ZX1cbi8vICAgICAgIHtkb3duVm90ZTogdHJ1ZX1cbi8vIHZpZGVvOiB0aGUgdmlkZW8gb2JqZWN0IG9uIHdoaWNoXG4vLyAgICAgICAgdGhlIHZvdGUgaXMgYmVpbmcgY2FzdFxuLy8gY2I6IG9wdGlvbmFsIGNhbGxiYWNrIHRoYXQgZ2V0cyBydW5cbi8vICAgICBvbiB0aGUgc2VydmVyJ3MgcmVzcG9wbnNlIHRvIHRoZVxuLy8gICAgIHZvdGUgY2FsbFxudmFyIHZvdGUgPSBmdW5jdGlvbih2b3RlLCB2aWRlbywgY2IpIHtcbiAgaWYgKCFjYikge1xuICAgIHZhciBjYiA9IGRlZmF1bHRDYWxsYmFjaztcbiAgfVxuXG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnUFVUJyxcbiAgICB1cmw6ICcvYXBpL3VybC8nICsgdmlkZW8uaWQsXG4gICAgZGF0YTogdm90ZSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgY29uc29sZS5sb2coJ3Jlc3BvbnNlIG9uIHJlbW92ZVZpZGVvJywgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICAgIGNiKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdlcnJvciBvbiByZW1vdmVWaWRlbycsIGVycik7XG4gICAgICBjYihlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBDcmVhdGluZyBjaGF0IHJlcXVlc3RzXG52YXIgZ2V0Q2hhdCA9IGZ1bmN0aW9uKGNiID0gZGVmYXVsdENhbGxiYWNrKSB7XG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICB1cmw6ICcvYXBpL2NoYXQnLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNiKG51bGwsIGRhdGEpO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIHBvc3RDaGF0ID0gZnVuY3Rpb24obWVzc2FnZSwgY2IgPSBkZWZhdWx0Q2FsbGJhY2spIHtcblxuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogJy9hcGkvY2hhdCcsXG4gICAgZGF0YTogbWVzc2FnZSxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgY29uc29sZS5sb2coJ3Jlc3BvbnNlIG9uIHBvc3RDaGF0JywgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICAgIHJldHVybiBjYihudWxsLCByZXNwb25zZSk7XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZygnZXJyb3Igb24gcG9zdENoYXQnLCBlcnIpO1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIGdldFVzZXJGcm9tU2Vzc2lvbiA9IGZ1bmN0aW9uKGNiID0gZGVmYXVsdENhbGxiYWNrKSB7XG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICB1cmw6ICcvYXBpL3VzZXInLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGNiKG51bGwsIG5hbWUpO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLy8gQ3JlYXRpbmcgdXNlciByZXF1ZXN0XG52YXIgcG9zdFVzZXJUb1Nlc3Npb24gPSBmdW5jdGlvbih1c2VyLCBjYiA9IGRlZmF1bHRDYWxsYmFjaykge1xuXG4gIHZhciB1c2VyID0geyBuYW1lOiB1c2VyIH07XG5cbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6ICcvYXBpL3VzZXInLFxuICAgIGRhdGE6IHVzZXIsXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIGNiKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2Vycm9yIG9uIHBvc3RpbmcgdXNlcjonLCBlcnIpO1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0pO1xufTtcblxuXG4vLyBHZXQgdm90ZXMgZnJvbSBzZXNzaW9uIGlmIGFueVxudmFyIGdldFZvdGVzID0gZnVuY3Rpb24oY2IgPSBkZWZhdWx0Q2FsbGJhY2spIHtcbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVybDogJy9hcGkvdm90ZXMnLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHZvdGVzKSB7XG4gICAgICBjYihudWxsLCB2b3Rlcyk7XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdlcnJvciBvbiBnZXR0aW5nIHZvdGVzOicsIGVycik7XG4gICAgICBjYihlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBQb3N0IHZvdGUgdG8gc2Vzc2lvblxudmFyIHBvc3RWb3RlID0gZnVuY3Rpb24odm90ZSwgY2IgPSBkZWZhdWx0Q2FsbGJhY2spIHtcbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6ICcvYXBpL3ZvdGVzJyxcbiAgICBkYXRhOiB2b3RlLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBjYihudWxsLCByZXNwb25zZSk7XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdlcnJvciBvbiBwb3N0aW5nIHZvdGU6JywgZXJyKTtcbiAgICAgIGNiKGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cbi8vIEV4cG9ydHMgYWxsIHRoZSBhcGkgaGVscGVycy4gdXNlIGFwaUhlbHBlci48bWV0aG9kPiB0byBpbnZva2UgYW55XG4vLyBmdW5jdGlvbiBpbiB0aGlzIGZpbGUuXG53aW5kb3cuYXBpSGVscGVyID0ge1xuICBnZXRWaWRlb3M6IGdldFZpZGVvcyxcbiAgcG9zdFZpZGVvOiBwb3N0VmlkZW8sXG4gIHJlbW92ZVZpZGVvOiByZW1vdmVWaWRlbyxcbiAgdm90ZTogdm90ZSxcbiAgZ2V0Q2hhdDogZ2V0Q2hhdCxcbiAgcG9zdENoYXQ6IHBvc3RDaGF0LFxuICBnZXRVc2VyRnJvbVNlc3Npb246IGdldFVzZXJGcm9tU2Vzc2lvbixcbiAgcG9zdFVzZXJUb1Nlc3Npb246IHBvc3RVc2VyVG9TZXNzaW9uLFxuICBnZXRWb3RlczogZ2V0Vm90ZXMsXG4gIHBvc3RWb3RlOiBwb3N0Vm90ZVxufTsiXX0=