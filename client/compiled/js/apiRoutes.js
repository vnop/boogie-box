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

// Checks to see if a user has been stored in session and returns username if it exists
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

// Checks the current session and adds or replaces the user info
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9hcGlSb3V0ZXMuanMiXSwibmFtZXMiOlsiZGVmYXVsdENhbGxiYWNrIiwiZXJyIiwidmFsIiwiY29uc29sZSIsImxvZyIsImdldFZpZGVvcyIsImNiIiwiJCIsImFqYXgiLCJtZXRob2QiLCJ1cmwiLCJzdWNjZXNzIiwiZGF0YSIsImVycm9yIiwicG9zdFZpZGVvIiwidmlkZW8iLCJ2aWRlb3VybCIsIm9yaWdpbiIsInVwVm90ZSIsImRvd25Wb3RlIiwicmVzcG9uc2UiLCJKU09OIiwic3RyaW5naWZ5IiwicmVtb3ZlVmlkZW8iLCJpZCIsInZvdGUiLCJnZXRDaGF0IiwicG9zdENoYXQiLCJtZXNzYWdlIiwiZ2V0VXNlckZyb21TZXNzaW9uIiwibmFtZSIsInBvc3RVc2VyVG9TZXNzaW9uIiwidXNlciIsImdldFZvdGVzIiwidm90ZXMiLCJwb3N0Vm90ZSIsIndpbmRvdyIsImFwaUhlbHBlciJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLElBQUlBLGtCQUFrQixTQUFsQkEsZUFBa0IsQ0FBU0MsR0FBVCxFQUFjQyxHQUFkLEVBQW1CO0FBQ3ZDLE1BQUlELEdBQUosRUFBUztBQUNQRSxZQUFRQyxHQUFSLENBQVksUUFBWixFQUFzQkgsR0FBdEI7QUFDRCxHQUZELE1BRU87QUFDTEUsWUFBUUMsR0FBUixDQUFZLFdBQVosRUFBeUJGLEdBQXpCO0FBQ0Q7QUFDRixDQU5EOztBQVFBO0FBQ0E7QUFDQTtBQUNBLElBQUlHLFlBQVksU0FBWkEsU0FBWSxDQUFTQyxFQUFULEVBQWE7O0FBRTNCLE1BQUksQ0FBQ0EsRUFBTCxFQUFTO0FBQ1AsUUFBSUEsS0FBS04sZUFBVDtBQUNEOztBQUVETyxJQUFFQyxJQUFGLENBQU87QUFDTEMsWUFBUSxLQURIO0FBRUxDLFNBQUssVUFGQTtBQUdMQyxhQUFTLGlCQUFTQyxJQUFULEVBQWU7QUFDdEJOLFNBQUcsSUFBSCxFQUFTTSxJQUFUO0FBQ0QsS0FM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LGFBQVdBLFNBRk07QUFHakJTLGVBQWFBLFdBSEk7QUFJakJFLFFBQU1BLElBSlc7QUFLakJDLFdBQVNBLE9BTFE7QUFNakJDLFlBQVVBLFFBTk87QUFPakJFLHNCQUFvQkEsa0JBUEg7QUFRakJFLHFCQUFtQkEsaUJBUkY7QUFTakJFLFlBQVVBLFFBVE87QUFVakJFLFlBQVVBO0FBVk8sQ0FBbkIiLCJmaWxlIjoiYXBpUm91dGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gYWxsIGNhbGxiYWNrcyBpbiB0aGlzIGZpbGUgYXJlIGV4cGVjdGVkIHRvIGJlIGluIHRoaXMgZm9ybTpcbi8vIGNiKGVyciwgdmFsKSB3aGVyZSBlcnIgaXMgYW55IGVycm9yIHJlY2lldmVkLCBhbmQgdmFsXG4vLyBpcyB0aGUgdmFsdWUgdXBvbiB3aGljaCB0byBvcGVyYXRlLiBJZiBubyBlcnJvciwgY2FsbCBhc1xuLy8gY2IobnVsbCwgdmFsKVxuXG4vLyBJbiBhbnkgY2FzZSwgaWYgYSBjYWxsYmFjayBpcyBub3QgZ2l2ZW4sIHRoZSBkZWZhdWx0IGlzIGp1c3QgdG9cbi8vIGxvZyB0aGUgcmVzcG9uc2UgYW5kIGVycm9yIHRvIHRoZSBjb25zb2xlOlxuXG52YXIgZGVmYXVsdENhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCB2YWwpIHtcbiAgaWYgKGVycikge1xuICAgIGNvbnNvbGUubG9nKCdlcnJvcjonLCBlcnIpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdyZXNwb25zZTonLCB2YWwpO1xuICB9XG59XG5cbi8vIFJldHJpZXZlcyB2aWRlb3MgZnJvbSBEQiB2aWEgc2VydmVyIGNvbm5lY3Rpb25cbi8vICBjYjogVGFrZXMgYSBjYWxsYmFjayB0aGF0IGdldHMgcnVuIG9uIHRoZSBhcnJheVxuLy8gICAgICByZXR1cm5lZCBieSB0aGUgc2VydmVyXG52YXIgZ2V0VmlkZW9zID0gZnVuY3Rpb24oY2IpIHtcblxuICBpZiAoIWNiKSB7XG4gICAgdmFyIGNiID0gZGVmYXVsdENhbGxiYWNrO1xuICB9XG5cbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVybDogJy9hcGkvdXJsJyxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjYihudWxsLCBkYXRhKTtcbiAgICB9LFxuXG4gICAgZXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0pO1xufVxuXG5cbi8vIEFkZHMgdmlkZW8gdG8gREIgdmlhIHNlcnZlciBjb25uZWN0aW9uXG4vLyAgdXJsOiB0YWtlcyB0aGUgVVJMIG9mIHRoZSBuZXcgdmlkZW9cbi8vICBjYjogVGFrZXMgYSBjYWxsYmFjayB0aGF0IGdldHMgcnVuIG9uXG4vLyAgICAgIHRoZSBzZXJ2ZXIncyByZXNwb25zZVxudmFyIHBvc3RWaWRlbyA9IGZ1bmN0aW9uKHVybCwgY2IpIHtcblxuICBpZiAoIWNiKSB7XG4gICAgdmFyIGNiID0gZGVmYXVsdENhbGxiYWNrO1xuICB9XG5cbiAgdmFyIHZpZGVvID0ge1xuICAgIHZpZGVvdXJsOiB1cmwsXG4gICAgb3JpZ2luOiAneW91dHViZScsXG4gICAgLy8gdGl0bGU6IGdldFZpZGVvVGl0bGUodXJsKSxcbiAgICB1cFZvdGU6IDAsXG4gICAgZG93blZvdGU6IDBcbiAgfVxuXG5cbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6ICcvYXBpL3VybCcsXG4gICAgZGF0YTogdmlkZW8sXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdyZXNwb25zZSBvbiBwb3N0VmlkZW8nLCBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgICAgY2IobnVsbCwgcmVzcG9uc2UpO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgICAgY29uc29sZS5sb2coJ2Vycm9yIG9uIHBvc3RWaWRlbycsIGVycik7XG4gICAgICBjYihlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5cbi8vIFJlbW92ZXMgYSB2aWRlbyBmcm9tIHRoZSBxdWV1ZSB2aWEgc2VydmVyIGNvbm5lY3Rpb25cbi8vIHZpZGVvOiB0YWtlcyBhIHZpZGVvIG9iamVjdCAoaW4gdGhlIGZvcm1hdCB0aGUgc2VydmVyXG4vLyAgICAgICAgb3JpZ2luYWxseSBzZW50IGl0IGluKVxuLy8gY2I6IHRha2VzIGEgY2FsbGJhY2sgdGhhdCBnZXRzIHJ1biBvbiB0aGUgc2VydmVyJ3Ncbi8vICAgICByZXNwb25zZVxudmFyIHJlbW92ZVZpZGVvID0gZnVuY3Rpb24odmlkZW8sIGNiKSB7XG5cbiAgaWYgKCFjYikge1xuICAgIHZhciBjYiA9IGRlZmF1bHRDYWxsYmFjaztcbiAgfVxuXG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICB1cmw6ICcvYXBpL3VybC8nICsgdmlkZW8uaWQsXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdyZXNwb25zZSBvbiByZW1vdmVWaWRlbycsIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgICBjYihudWxsLCByZXNwb25zZSk7XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZygnZXJyb3Igb24gcmVtb3ZlVmlkZW8nLCBlcnIpO1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0pO1xufTtcblxuXG4vLyBVc2VkIGZvciB2b3Rpbmcgb24gcXVldWUgZWxlbWVudHNcbi8vIHZvdGU6IHRha2VzIGFuIG9iamVjdCB0byBkZWZpbmUgdGhlXG4vLyAgICAgICB2b3RlIHRvIGJlIG1hZGUuIE9wdGlvbnM6XG4vLyAgICAgICB7dXBWb3RlOiB0cnVlfVxuLy8gICAgICAge2Rvd25Wb3RlOiB0cnVlfVxuLy8gdmlkZW86IHRoZSB2aWRlbyBvYmplY3Qgb24gd2hpY2hcbi8vICAgICAgICB0aGUgdm90ZSBpcyBiZWluZyBjYXN0XG4vLyBjYjogb3B0aW9uYWwgY2FsbGJhY2sgdGhhdCBnZXRzIHJ1blxuLy8gICAgIG9uIHRoZSBzZXJ2ZXIncyByZXNwb3Buc2UgdG8gdGhlXG4vLyAgICAgdm90ZSBjYWxsXG52YXIgdm90ZSA9IGZ1bmN0aW9uKHZvdGUsIHZpZGVvLCBjYikge1xuICBpZiAoIWNiKSB7XG4gICAgdmFyIGNiID0gZGVmYXVsdENhbGxiYWNrO1xuICB9XG5cbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6ICdQVVQnLFxuICAgIHVybDogJy9hcGkvdXJsLycgKyB2aWRlby5pZCxcbiAgICBkYXRhOiB2b3RlLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzcG9uc2Ugb24gcmVtb3ZlVmlkZW8nLCBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgICAgY2IobnVsbCwgcmVzcG9uc2UpO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgICAgY29uc29sZS5sb2coJ2Vycm9yIG9uIHJlbW92ZVZpZGVvJywgZXJyKTtcbiAgICAgIGNiKGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cbi8vIENyZWF0aW5nIGNoYXQgcmVxdWVzdHNcbnZhciBnZXRDaGF0ID0gZnVuY3Rpb24oY2IgPSBkZWZhdWx0Q2FsbGJhY2spIHtcbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVybDogJy9hcGkvY2hhdCcsXG4gICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY2IobnVsbCwgZGF0YSk7XG4gICAgfSxcbiAgICBlcnJvcjogZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjYihlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgcG9zdENoYXQgPSBmdW5jdGlvbihtZXNzYWdlLCBjYiA9IGRlZmF1bHRDYWxsYmFjaykge1xuXG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiAnL2FwaS9jaGF0JyxcbiAgICBkYXRhOiBtZXNzYWdlLFxuICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzcG9uc2Ugb24gcG9zdENoYXQnLCBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgICAgcmV0dXJuIGNiKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdlcnJvciBvbiBwb3N0Q2hhdCcsIGVycik7XG4gICAgICBjYihlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBDaGVja3MgdG8gc2VlIGlmIGEgdXNlciBoYXMgYmVlbiBzdG9yZWQgaW4gc2Vzc2lvbiBhbmQgcmV0dXJucyB1c2VybmFtZSBpZiBpdCBleGlzdHNcbnZhciBnZXRVc2VyRnJvbVNlc3Npb24gPSBmdW5jdGlvbihjYiA9IGRlZmF1bHRDYWxsYmFjaykge1xuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgdXJsOiAnL2FwaS91c2VyJyxcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBjYihudWxsLCBuYW1lKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNiKGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cbi8vIENoZWNrcyB0aGUgY3VycmVudCBzZXNzaW9uIGFuZCBhZGRzIG9yIHJlcGxhY2VzIHRoZSB1c2VyIGluZm9cbnZhciBwb3N0VXNlclRvU2Vzc2lvbiA9IGZ1bmN0aW9uKHVzZXIsIGNiID0gZGVmYXVsdENhbGxiYWNrKSB7XG5cbiAgdmFyIHVzZXIgPSB7IG5hbWU6IHVzZXIgfTtcblxuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogJy9hcGkvdXNlcicsXG4gICAgZGF0YTogdXNlcixcbiAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgY2IobnVsbCwgcmVzcG9uc2UpO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignZXJyb3Igb24gcG9zdGluZyB1c2VyOicsIGVycik7XG4gICAgICBjYihlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5cbi8vIEdldCB2b3RlcyBmcm9tIHNlc3Npb24gaWYgYW55XG52YXIgZ2V0Vm90ZXMgPSBmdW5jdGlvbihjYiA9IGRlZmF1bHRDYWxsYmFjaykge1xuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgdXJsOiAnL2FwaS92b3RlcycsXG4gICAgc3VjY2VzczogZnVuY3Rpb24odm90ZXMpIHtcbiAgICAgIGNiKG51bGwsIHZvdGVzKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2Vycm9yIG9uIGdldHRpbmcgdm90ZXM6JywgZXJyKTtcbiAgICAgIGNiKGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cbi8vIFBvc3Qgdm90ZSB0byBzZXNzaW9uXG52YXIgcG9zdFZvdGUgPSBmdW5jdGlvbih2b3RlLCBjYiA9IGRlZmF1bHRDYWxsYmFjaykge1xuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogJy9hcGkvdm90ZXMnLFxuICAgIGRhdGE6IHZvdGUsXG4gICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIGNiKG51bGwsIHJlc3BvbnNlKTtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2Vycm9yIG9uIHBvc3Rpbmcgdm90ZTonLCBlcnIpO1xuICAgICAgY2IoZXJyKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLy8gRXhwb3J0cyBhbGwgdGhlIGFwaSBoZWxwZXJzLiB1c2UgYXBpSGVscGVyLjxtZXRob2Q+IHRvIGludm9rZSBhbnlcbi8vIGZ1bmN0aW9uIGluIHRoaXMgZmlsZS5cbndpbmRvdy5hcGlIZWxwZXIgPSB7XG4gIGdldFZpZGVvczogZ2V0VmlkZW9zLFxuICBwb3N0VmlkZW86IHBvc3RWaWRlbyxcbiAgcmVtb3ZlVmlkZW86IHJlbW92ZVZpZGVvLFxuICB2b3RlOiB2b3RlLFxuICBnZXRDaGF0OiBnZXRDaGF0LFxuICBwb3N0Q2hhdDogcG9zdENoYXQsXG4gIGdldFVzZXJGcm9tU2Vzc2lvbjogZ2V0VXNlckZyb21TZXNzaW9uLFxuICBwb3N0VXNlclRvU2Vzc2lvbjogcG9zdFVzZXJUb1Nlc3Npb24sXG4gIGdldFZvdGVzOiBnZXRWb3RlcyxcbiAgcG9zdFZvdGU6IHBvc3RWb3RlXG59OyJdfQ==