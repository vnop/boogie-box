var getVideos = function() {
  $.ajax({
    method: 'GET',
    url: '/api/url',
    success: function(data) {
      console.log(data);
    }
  });
}

window.apiHelper = {
  getVideos: getVideos
};

getVideos();

console.log('API ROUTES FILE');