'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//CLASSES
//The Video class controlls the player
var Video = function (_React$Component) {
  _inherits(Video, _React$Component);

  function Video(props) {
    _classCallCheck(this, Video);

    //if a video is not loaded, the url variable will be null. Otherwise, url will be set to the loaded video's url
    var _this = _possibleConstructorReturn(this, (Video.__proto__ || Object.getPrototypeOf(Video)).call(this, props));

    if (!_this.props.video) {
      var url = null;
      var setPlay = false;
    } else {
      var url = _this.props.video.videourl;
      var setPlay = true;
    }

    _this.state = {
      //default audio states
      video: _this.props.video, //reference state that allows us to access the video URL as well as its title
      url: url, //the url that the react player component uses for current video
      hideVid: false, //whether or not the videos are hidden on the page. Audio will play regardless
      playing: setPlay, //If false, playback is paused. Also controls automatic playback upon load
      muted: false,
      volume: 1, //volume is measure as a decimal number between 0 and 1
      played: 0,
      loaded: 0,
      duration: 0, //value in seconds that counts the overall length of the video
      progress: 0, //the current time at which the video is playing. This is a decimal number between 0 and 1
      serverData: 0,
      playbackRate: 1.0, //the speed at which a video will be played, between 0 and 2
      useSync: true, //optional state for whether or not a given connected user will remain in sync with the 'admin'
      adminFlag: _this.props.adminFlag, //state given to the first person to connect to the session. Playback sync is matched to their current playback time.
      initializedSync: false
    };

    _this.props.socket.on('recTime', function (data) {
      this.setState({ serverData: data.time });
      this.verifySync();
    }.bind(_this));

    //When the setAdminFlag event occurs, the setAdmin flag is also assigned in the component's states
    _this.props.socket.on('setAdminFlag', function (data) {
      this.setState({ adminFlag: true });

      //if the user is the admin and their Sync hasn't already been initialized, it will force that initializtion
      //this is important for when admin roles are handed off, such as when an admin disconnects
      if (this.state.adminFlag && !this.state.initializedSync) {
        this.setState({
          initializedSync: true
        });
        this.startVideo(); //ensures that the video playback automatically begins
      }
    }.bind(_this));

    _this.emitData();
    return _this;
  }

  //AUDIO CONTROLLERS
  //stop button's controls


  _createClass(Video, [{
    key: 'stop',
    value: function stop() {
      this.setState({ url: null, playing: false, progress: 0 });
    }
    //toggle for playing or pause

  }, {
    key: 'playPause',
    value: function playPause() {
      if (this.state.url) {
        this.setState({ playing: !this.state.playing });
      } else {
        if (!this.state.video && this.state.serverData.video) {
          this.setState({
            video: this.state.serverData.video,
            url: this.state.serverData.video.videourl,
            playing: true
          });
        } else {
          this.setState({
            //if the video had been stopped previous, this will resume playback of that from the beginning
            url: this.state.video.videourl,
            playing: true
          });
        }
      }
    }
    //toggles the mute state

  }, {
    key: 'mute',
    value: function mute() {
      this.setState({ muted: !this.state.muted });
    }
    //sets the volume based on the position of the slider. See the HTML controls in the JSX below

  }, {
    key: 'setVolume',
    value: function setVolume(vol) {
      if (this.state.muted) {
        this.setState({ muted: false });
      };
      this.setState({ volume: parseFloat(vol.target.value) });
    }
    //toggles video visibility on the page. Audio plays regardless

  }, {
    key: 'toggleVideo',
    value: function toggleVideo() {
      this.setState({ hideVid: !this.state.hideVid });
    }

    //optional toggle sync button. When useSync is false, playback ignores the state of the current admin

  }, {
    key: 'toggleSync',
    value: function toggleSync() {
      this.setState({ useSync: !this.state.useSync });
    }

    //updates the current progress time

  }, {
    key: 'updateProgress',
    value: function updateProgress(time) {
      this.setState({ progress: time.played });
    }

    //method to compare syncronization of all connected users

  }, {
    key: 'verifySync',
    value: function verifySync() {
      if (!this.state.adminFlag && this.state.useSync) {
        //if user is NOT the admin and the useSync button is ON
        var clientTime = Math.floor(this.state.progress * this.state.duration); //variable to hold the USER's playback progress (in the form of seconds, rather than decimals)
        var serverTime = Math.floor(this.state.serverData.progress * this.state.duration); //variable to hold the SERVER's playback progress (in the form of seconds, rather than decimals)
        if (Math.abs(clientTime - serverTime) >= 4) {
          //this will check if a connected user is above or below 4 seconds away from the admin's current playback time, and if they are...
          this.player.seekTo(this.state.serverData.progress); //force the user's playback time to match the admin's playback time
          this.setState({ //sets the 'progress' state to match the recently adjusted playback time
            progress: this.state.serverData.progress
          });
        }
        //The follow code will force synchronization of Player component states
        if (this.state.playing !== this.state.serverData.playing) {
          //if the user's 'playing' does not match the admin's 'playing' state, toggles playPause on the video
          this.playPause();
        }
        if (this.state.video && this.state.serverData.video) {
          //if the user's loaded video doesn't match the admin's video, force it to match
          if (this.state.video.id !== this.state.serverData.video.id) {
            this.setState({
              video: this.state.serverData.video,
              url: this.state.serverData.video.videourl
            });
          }
        } else if (!this.state.video && this.state.serverData.video) {
          //if a video had not been loaded for the user, force the current video that the admin has loaded to become loaded for the user
          this.setState({
            video: this.state.serverData.video,
            url: this.state.serverData.video.videourl
          });
        } else {
          //if no other syncronization is necessary, set video and url to null, rendering an empty video frame
          this.setState({
            video: null,
            url: null
          });
        }
      }
    }
  }, {
    key: 'emitData',
    value: function emitData() {
      //if the user is the admin, emit the following data
      if (this.state.adminFlag) {
        var playerData = {
          progress: this.state.progress, //what the current playback time is
          video: this.state.video, //what the current video playing should be
          playing: this.state.playing //what the current playing 'state' (paused or playing) is
        };
        this.props.socket.emit('setTime', { time: playerData }); //emits the data to all connected users using socket
      }

      setTimeout(this.emitData.bind(this), 1000); //repeat this method every 1 second
    }
  }, {
    key: 'startVideo',
    value: function startVideo() {
      //method to be run when a attempting to start a video
      if (this.state.adminFlag && this.state.video === null && this.state.url === null) {
        //if the user is admin and there isn't a video loaded as well as no url has been assigned...
        this.onVideoEnd(); //run the video end method, detailed below
      }
    }
  }, {
    key: 'onVideoEnd',
    value: function onVideoEnd() {
      if (this.state.adminFlag) {
        //if the user is the admin...
        var newVid = this.props.advanceQueue(); //sets the newVid variable to the next video in the queue

        this.setState({ //clears the last url that was used
          url: ''
        });

        if (newVid) {
          //if a new video has been set...
          this.setState({
            video: newVid, //set the new video's data
            url: newVid.videourl, //set the new video's URL
            progress: 0, //set its playback time to the start (zero)
            hideVid: false
          });
        } else {
          //ortherwise use empty data, as no video exists to be played
          this.setState({
            video: null,
            url: null,
            progress: 0,
            hideVid: true,
            playing: setPlay
          });
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      //render the video panel using bootstrap
      return React.createElement(
        'div',
        _defineProperty({ id: 'audioPanel', className: 'container-fluid' }, 'className', 'panel panel-info'),
        React.createElement(
          'div',
          { id: 'plyrPnlHeading', className: 'panel-heading' },
          React.createElement(
            'div',
            { id: 'hideVidBtn', 'data-toggle': 'tooltip', title: 'Toggle video', onClick: this.toggleVideo.bind(this) },
            React.createElement('span', { className: this.state.hideVid ? 'glyphicon glyphicon-eye-close' : 'glyphicon glyphicon-eye-open' })
          ),
          React.createElement(
            'div',
            { id: 'useSyncBtn', 'data-toggle': 'tooltip', title: 'Toggle sync', onClick: this.toggleSync.bind(this) },
            React.createElement('span', { className: this.state.useSync ? 'glyphicon glyphicon-transfer' : 'glyphicon glyphicon-headphones' })
          ),
          React.createElement(
            'div',
            { id: 'audioTitle' },
            !this.state.video ? 'Find a boogie!' : this.state.video.title
          )
        ),
        React.createElement(
          'div',
          { className: 'panel-body' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col-md-12' },
              React.createElement(ReactPlayer, {
                ref: function ref(player) {
                  _this2.player = player;
                },
                url: this.state.url,
                width: '100%',
                height: '480px',
                hidden: this.state.hideVid //hides the video frame by default; can be toggled
                , playing: this.state.playing //controls playback
                //volume={this.state.volume}
                , volume: this.state.muted ? 0 : this.state.volume,
                onPlay: function onPlay() {
                  return _this2.setState({ playing: true });
                },
                onPause: function onPause() {
                  return _this2.setState({ playing: false });
                },
                onEnded: this.onVideoEnd.bind(this),
                onError: this.onVideoEnd.bind(this),
                onDuration: function onDuration(duration) {
                  return _this2.setState({ duration: duration });
                } //logs the overall video duration
                , onProgress: this.updateProgress.bind(this)
              })
            )
          ),
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              { className: 'col-md-12' },
              React.createElement(
                'div',
                { id: 'progBar', className: 'progress' },
                React.createElement('div', { className: 'progress-bar progress-bar-striped active',
                  role: 'progressbar', style: { width: this.state.progress * 100 + '%' } })
              )
            )
          ),
          React.createElement(
            'div',
            { id: 'allCtrls', className: 'row' },
            React.createElement(
              'div',
              { className: 'col-xs-9' },
              React.createElement(
                'div',
                { className: 'videoCtrl' },
                React.createElement(
                  'button',
                  { className: 'btn btn-sm btn-default', onClick: this.playPause.bind(this) },
                  React.createElement('span', { className: this.state.playing ? 'glyphicon glyphicon-pause' : 'glyphicon glyphicon-play' })
                ),
                React.createElement(
                  'button',
                  { className: 'btn btn-sm btn-default', onClick: this.stop.bind(this) },
                  React.createElement('span', { className: 'glyphicon glyphicon-stop' })
                ),
                '  ' + Math.floor(this.state.duration * this.state.progress / 60) + ':' + ('00' + Math.floor(this.state.duration * this.state.progress - Math.floor(this.state.duration * this.state.progress / 60) * 60)).slice(-2),
                ' / ' + Math.floor(this.state.duration / 60) + ':' + (this.state.duration - Math.floor(this.state.duration / 60) * 60)
              )
            ),
            React.createElement(
              'div',
              { className: 'col-xs-3' },
              React.createElement(
                'div',
                { id: 'muteBtn', onClick: this.mute.bind(this) },
                React.createElement('span', { className: this.state.muted ? 'glyphicon glyphicon-volume-off' : this.state.volume < 0.5 ? 'glyphicon glyphicon-volume-down' : 'glyphicon glyphicon-volume-up' })
              ),
              React.createElement('input', { id: 'volumeCtrl', type: 'range', min: 0, max: 1, step: 'any',
                value: this.state.muted ? 0 : this.state.volume,
                onChange: this.setVolume.bind(this) })
            )
          )
        )
      );
    }
  }]);

  return Video;
}(React.Component);

;

window.Video = Video;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9wbGF5ZXIuanN4Il0sIm5hbWVzIjpbIlZpZGVvIiwicHJvcHMiLCJ2aWRlbyIsInVybCIsInNldFBsYXkiLCJ2aWRlb3VybCIsInN0YXRlIiwiaGlkZVZpZCIsInBsYXlpbmciLCJtdXRlZCIsInZvbHVtZSIsInBsYXllZCIsImxvYWRlZCIsImR1cmF0aW9uIiwicHJvZ3Jlc3MiLCJzZXJ2ZXJEYXRhIiwicGxheWJhY2tSYXRlIiwidXNlU3luYyIsImFkbWluRmxhZyIsImluaXRpYWxpemVkU3luYyIsInNvY2tldCIsIm9uIiwiZGF0YSIsInNldFN0YXRlIiwidGltZSIsInZlcmlmeVN5bmMiLCJiaW5kIiwic3RhcnRWaWRlbyIsImVtaXREYXRhIiwidm9sIiwicGFyc2VGbG9hdCIsInRhcmdldCIsInZhbHVlIiwiY2xpZW50VGltZSIsIk1hdGgiLCJmbG9vciIsInNlcnZlclRpbWUiLCJhYnMiLCJwbGF5ZXIiLCJzZWVrVG8iLCJwbGF5UGF1c2UiLCJpZCIsInBsYXllckRhdGEiLCJlbWl0Iiwic2V0VGltZW91dCIsIm9uVmlkZW9FbmQiLCJuZXdWaWQiLCJhZHZhbmNlUXVldWUiLCJ0b2dnbGVWaWRlbyIsInRvZ2dsZVN5bmMiLCJ0aXRsZSIsInVwZGF0ZVByb2dyZXNzIiwid2lkdGgiLCJzdG9wIiwic2xpY2UiLCJtdXRlIiwic2V0Vm9sdW1lIiwiUmVhY3QiLCJDb21wb25lbnQiLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7SUFDTUEsSzs7O0FBQ0osaUJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFFakI7QUFGaUIsOEdBQ1hBLEtBRFc7O0FBR2pCLFFBQUksQ0FBQyxNQUFLQSxLQUFMLENBQVdDLEtBQWhCLEVBQXVCO0FBQ3JCLFVBQUlDLE1BQU0sSUFBVjtBQUNBLFVBQUlDLFVBQVUsS0FBZDtBQUNELEtBSEQsTUFHTztBQUNMLFVBQUlELE1BQU0sTUFBS0YsS0FBTCxDQUFXQyxLQUFYLENBQWlCRyxRQUEzQjtBQUNBLFVBQUlELFVBQVUsSUFBZDtBQUNEOztBQUVELFVBQUtFLEtBQUwsR0FBYTtBQUNiO0FBQ0VKLGFBQU8sTUFBS0QsS0FBTCxDQUFXQyxLQUZQLEVBRWM7QUFDekJDLFdBQUtBLEdBSE0sRUFHRDtBQUNWSSxlQUFTLEtBSkUsRUFJSztBQUNoQkMsZUFBU0osT0FMRSxFQUtPO0FBQ2xCSyxhQUFPLEtBTkk7QUFPWEMsY0FBUSxDQVBHLEVBT0E7QUFDWEMsY0FBUSxDQVJHO0FBU1hDLGNBQVEsQ0FURztBQVVYQyxnQkFBVSxDQVZDLEVBVUU7QUFDYkMsZ0JBQVUsQ0FYQyxFQVdFO0FBQ2JDLGtCQUFZLENBWkQ7QUFhWEMsb0JBQWMsR0FiSCxFQWFRO0FBQ25CQyxlQUFTLElBZEUsRUFjSTtBQUNmQyxpQkFBVyxNQUFLakIsS0FBTCxDQUFXaUIsU0FmWCxFQWVzQjtBQUNqQ0MsdUJBQWlCO0FBaEJOLEtBQWI7O0FBbUJBLFVBQUtsQixLQUFMLENBQVdtQixNQUFYLENBQWtCQyxFQUFsQixDQUFxQixTQUFyQixFQUFnQyxVQUFVQyxJQUFWLEVBQWdCO0FBQzlDLFdBQUtDLFFBQUwsQ0FBYyxFQUFDUixZQUFZTyxLQUFLRSxJQUFsQixFQUFkO0FBQ0EsV0FBS0MsVUFBTDtBQUNELEtBSCtCLENBRzlCQyxJQUg4QixPQUFoQzs7QUFLQTtBQUNBLFVBQUt6QixLQUFMLENBQVdtQixNQUFYLENBQWtCQyxFQUFsQixDQUFxQixjQUFyQixFQUFxQyxVQUFVQyxJQUFWLEVBQWdCO0FBQ25ELFdBQUtDLFFBQUwsQ0FBYyxFQUFDTCxXQUFXLElBQVosRUFBZDs7QUFFQTtBQUNBO0FBQ0EsVUFBRyxLQUFLWixLQUFMLENBQVdZLFNBQVgsSUFBd0IsQ0FBQyxLQUFLWixLQUFMLENBQVdhLGVBQXZDLEVBQXdEO0FBQ3RELGFBQUtJLFFBQUwsQ0FBYztBQUNaSiwyQkFBaUI7QUFETCxTQUFkO0FBR0EsYUFBS1EsVUFBTCxHQUpzRCxDQUlwQztBQUNuQjtBQUNGLEtBWG9DLENBV25DRCxJQVhtQyxPQUFyQzs7QUFhQSxVQUFLRSxRQUFMO0FBakRpQjtBQWtEbEI7O0FBRUQ7QUFDQTs7Ozs7MkJBQ087QUFDTCxXQUFLTCxRQUFMLENBQWMsRUFBRXBCLEtBQUssSUFBUCxFQUFhSyxTQUFTLEtBQXRCLEVBQTZCTSxVQUFVLENBQXZDLEVBQWQ7QUFDRDtBQUNEOzs7O2dDQUNZO0FBQ1YsVUFBSSxLQUFLUixLQUFMLENBQVdILEdBQWYsRUFBb0I7QUFDbEIsYUFBS29CLFFBQUwsQ0FBYyxFQUFFZixTQUFTLENBQUMsS0FBS0YsS0FBTCxDQUFXRSxPQUF2QixFQUFkO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBSSxDQUFDLEtBQUtGLEtBQUwsQ0FBV0osS0FBWixJQUFxQixLQUFLSSxLQUFMLENBQVdTLFVBQVgsQ0FBc0JiLEtBQS9DLEVBQXNEO0FBQ3BELGVBQUtxQixRQUFMLENBQWM7QUFDWnJCLG1CQUFPLEtBQUtJLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQmIsS0FEakI7QUFFWkMsaUJBQUssS0FBS0csS0FBTCxDQUFXUyxVQUFYLENBQXNCYixLQUF0QixDQUE0QkcsUUFGckI7QUFHWkcscUJBQVM7QUFIRyxXQUFkO0FBS0QsU0FORCxNQU1PO0FBQ0wsZUFBS2UsUUFBTCxDQUFjO0FBQ1o7QUFDQXBCLGlCQUFLLEtBQUtHLEtBQUwsQ0FBV0osS0FBWCxDQUFpQkcsUUFGVjtBQUdaRyxxQkFBUztBQUhHLFdBQWQ7QUFLRDtBQUNGO0FBQ0Y7QUFDRDs7OzsyQkFDTztBQUNMLFdBQUtlLFFBQUwsQ0FBYyxFQUFFZCxPQUFPLENBQUMsS0FBS0gsS0FBTCxDQUFXRyxLQUFyQixFQUFkO0FBQ0Q7QUFDRDs7Ozs4QkFDVW9CLEcsRUFBSztBQUNiLFVBQUksS0FBS3ZCLEtBQUwsQ0FBV0csS0FBZixFQUFzQjtBQUFDLGFBQUtjLFFBQUwsQ0FBYyxFQUFFZCxPQUFPLEtBQVQsRUFBZDtBQUFnQztBQUN2RCxXQUFLYyxRQUFMLENBQWMsRUFBRWIsUUFBUW9CLFdBQVdELElBQUlFLE1BQUosQ0FBV0MsS0FBdEIsQ0FBVixFQUFkO0FBQ0Q7QUFDRDs7OztrQ0FDYztBQUNaLFdBQUtULFFBQUwsQ0FBYyxFQUFFaEIsU0FBUyxDQUFDLEtBQUtELEtBQUwsQ0FBV0MsT0FBdkIsRUFBZDtBQUNEOztBQUVEOzs7O2lDQUNhO0FBQ1gsV0FBS2dCLFFBQUwsQ0FBYyxFQUFFTixTQUFTLENBQUMsS0FBS1gsS0FBTCxDQUFXVyxPQUF2QixFQUFkO0FBQ0Q7O0FBRUQ7Ozs7bUNBQ2VPLEksRUFBTTtBQUNuQixXQUFLRCxRQUFMLENBQWMsRUFBRVQsVUFBVVUsS0FBS2IsTUFBakIsRUFBZDtBQUNEOztBQUVEOzs7O2lDQUNhO0FBQ1gsVUFBSSxDQUFDLEtBQUtMLEtBQUwsQ0FBV1ksU0FBWixJQUF5QixLQUFLWixLQUFMLENBQVdXLE9BQXhDLEVBQWlEO0FBQUU7QUFDakQsWUFBSWdCLGFBQWFDLEtBQUtDLEtBQUwsQ0FBVyxLQUFLN0IsS0FBTCxDQUFXUSxRQUFYLEdBQW9CLEtBQUtSLEtBQUwsQ0FBV08sUUFBMUMsQ0FBakIsQ0FEK0MsQ0FDc0I7QUFDckUsWUFBSXVCLGFBQWFGLEtBQUtDLEtBQUwsQ0FBVyxLQUFLN0IsS0FBTCxDQUFXUyxVQUFYLENBQXNCRCxRQUF0QixHQUErQixLQUFLUixLQUFMLENBQVdPLFFBQXJELENBQWpCLENBRitDLENBRWlDO0FBQ2hGLFlBQUlxQixLQUFLRyxHQUFMLENBQVNKLGFBQWFHLFVBQXRCLEtBQXFDLENBQXpDLEVBQTRDO0FBQUM7QUFDM0MsZUFBS0UsTUFBTCxDQUFZQyxNQUFaLENBQW1CLEtBQUtqQyxLQUFMLENBQVdTLFVBQVgsQ0FBc0JELFFBQXpDLEVBRDBDLENBQ1U7QUFDcEQsZUFBS1MsUUFBTCxDQUFjLEVBQUM7QUFDYlQsc0JBQVUsS0FBS1IsS0FBTCxDQUFXUyxVQUFYLENBQXNCRDtBQURwQixXQUFkO0FBR0Q7QUFDRDtBQUNBLFlBQUksS0FBS1IsS0FBTCxDQUFXRSxPQUFYLEtBQXVCLEtBQUtGLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQlAsT0FBakQsRUFBMEQ7QUFBQztBQUN6RCxlQUFLZ0MsU0FBTDtBQUNEO0FBQ0QsWUFBSSxLQUFLbEMsS0FBTCxDQUFXSixLQUFYLElBQW9CLEtBQUtJLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQmIsS0FBOUMsRUFBcUQ7QUFBQztBQUNwRCxjQUFJLEtBQUtJLEtBQUwsQ0FBV0osS0FBWCxDQUFpQnVDLEVBQWpCLEtBQXdCLEtBQUtuQyxLQUFMLENBQVdTLFVBQVgsQ0FBc0JiLEtBQXRCLENBQTRCdUMsRUFBeEQsRUFBNEQ7QUFDMUQsaUJBQUtsQixRQUFMLENBQWM7QUFDWnJCLHFCQUFPLEtBQUtJLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQmIsS0FEakI7QUFFWkMsbUJBQUssS0FBS0csS0FBTCxDQUFXUyxVQUFYLENBQXNCYixLQUF0QixDQUE0Qkc7QUFGckIsYUFBZDtBQUlEO0FBQ0YsU0FQRCxNQU9PLElBQUksQ0FBQyxLQUFLQyxLQUFMLENBQVdKLEtBQVosSUFBcUIsS0FBS0ksS0FBTCxDQUFXUyxVQUFYLENBQXNCYixLQUEvQyxFQUFzRDtBQUFDO0FBQzVELGVBQUtxQixRQUFMLENBQWM7QUFDWnJCLG1CQUFPLEtBQUtJLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQmIsS0FEakI7QUFFWkMsaUJBQUssS0FBS0csS0FBTCxDQUFXUyxVQUFYLENBQXNCYixLQUF0QixDQUE0Qkc7QUFGckIsV0FBZDtBQUlELFNBTE0sTUFLQTtBQUFDO0FBQ04sZUFBS2tCLFFBQUwsQ0FBYztBQUNackIsbUJBQU8sSUFESztBQUVaQyxpQkFBSztBQUZPLFdBQWQ7QUFJRDtBQUNGO0FBQ0Y7OzsrQkFFVTtBQUFDO0FBQ1YsVUFBSSxLQUFLRyxLQUFMLENBQVdZLFNBQWYsRUFBMEI7QUFDeEIsWUFBSXdCLGFBQWE7QUFDZjVCLG9CQUFVLEtBQUtSLEtBQUwsQ0FBV1EsUUFETixFQUNnQjtBQUMvQlosaUJBQU8sS0FBS0ksS0FBTCxDQUFXSixLQUZILEVBRVc7QUFDMUJNLG1CQUFTLEtBQUtGLEtBQUwsQ0FBV0UsT0FITCxDQUdhO0FBSGIsU0FBakI7QUFLQSxhQUFLUCxLQUFMLENBQVdtQixNQUFYLENBQWtCdUIsSUFBbEIsQ0FBdUIsU0FBdkIsRUFBa0MsRUFBQ25CLE1BQU1rQixVQUFQLEVBQWxDLEVBTndCLENBTStCO0FBQ3hEOztBQUVERSxpQkFBVyxLQUFLaEIsUUFBTCxDQUFjRixJQUFkLENBQW1CLElBQW5CLENBQVgsRUFBcUMsSUFBckMsRUFWUyxDQVVrQztBQUM1Qzs7O2lDQUVZO0FBQUM7QUFDWixVQUFHLEtBQUtwQixLQUFMLENBQVdZLFNBQVgsSUFBd0IsS0FBS1osS0FBTCxDQUFXSixLQUFYLEtBQXFCLElBQTdDLElBQXFELEtBQUtJLEtBQUwsQ0FBV0gsR0FBWCxLQUFtQixJQUEzRSxFQUFpRjtBQUFDO0FBQ2hGLGFBQUswQyxVQUFMLEdBRCtFLENBQzdEO0FBQ25CO0FBQ0Y7OztpQ0FFWTtBQUNYLFVBQUksS0FBS3ZDLEtBQUwsQ0FBV1ksU0FBZixFQUEwQjtBQUFDO0FBQ3pCLFlBQUk0QixTQUFTLEtBQUs3QyxLQUFMLENBQVc4QyxZQUFYLEVBQWIsQ0FEd0IsQ0FDZTs7QUFFdkMsYUFBS3hCLFFBQUwsQ0FBYyxFQUFDO0FBQ2JwQixlQUFLO0FBRE8sU0FBZDs7QUFJQSxZQUFJMkMsTUFBSixFQUFZO0FBQUM7QUFDWCxlQUFLdkIsUUFBTCxDQUFjO0FBQ1pyQixtQkFBTzRDLE1BREssRUFDRztBQUNmM0MsaUJBQUsyQyxPQUFPekMsUUFGQSxFQUVVO0FBQ3RCUyxzQkFBVSxDQUhFLEVBR0M7QUFDYlAscUJBQVM7QUFKRyxXQUFkO0FBTUQsU0FQRCxNQU9PO0FBQUU7QUFDUCxlQUFLZ0IsUUFBTCxDQUFjO0FBQ1pyQixtQkFBTyxJQURLO0FBRVpDLGlCQUFLLElBRk87QUFHWlcsc0JBQVUsQ0FIRTtBQUlaUCxxQkFBUyxJQUpHO0FBS1pDLHFCQUFTSjtBQUxHLFdBQWQ7QUFPRDtBQUNGO0FBQ0Y7Ozs2QkFJUTtBQUFBOztBQUFFO0FBQ1QsYUFDRTtBQUFBO0FBQUEsMEJBQUssSUFBRyxZQUFSLEVBQXFCLFdBQVUsaUJBQS9CLGlCQUEyRCxrQkFBM0Q7QUFDRTtBQUFBO0FBQUEsWUFBSyxJQUFHLGdCQUFSLEVBQXlCLFdBQVUsZUFBbkM7QUFDRTtBQUFBO0FBQUEsY0FBSyxJQUFHLFlBQVIsRUFBcUIsZUFBWSxTQUFqQyxFQUEyQyxPQUFNLGNBQWpELEVBQWdFLFNBQVMsS0FBSzRDLFdBQUwsQ0FBaUJ0QixJQUFqQixDQUFzQixJQUF0QixDQUF6RTtBQUFzRywwQ0FBTSxXQUFXLEtBQUtwQixLQUFMLENBQVdDLE9BQVgsR0FBcUIsK0JBQXJCLEdBQXVELDhCQUF4RTtBQUF0RyxXQURGO0FBRUU7QUFBQTtBQUFBLGNBQUssSUFBRyxZQUFSLEVBQXFCLGVBQVksU0FBakMsRUFBMkMsT0FBTSxhQUFqRCxFQUErRCxTQUFTLEtBQUswQyxVQUFMLENBQWdCdkIsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBeEU7QUFBb0csMENBQU0sV0FBVyxLQUFLcEIsS0FBTCxDQUFXVyxPQUFYLEdBQXFCLDhCQUFyQixHQUFzRCxnQ0FBdkU7QUFBcEcsV0FGRjtBQUdFO0FBQUE7QUFBQSxjQUFLLElBQUcsWUFBUjtBQUF1QixhQUFDLEtBQUtYLEtBQUwsQ0FBV0osS0FBYixHQUFzQixnQkFBdEIsR0FBeUMsS0FBS0ksS0FBTCxDQUFXSixLQUFYLENBQWlCZ0Q7QUFBaEY7QUFIRixTQURGO0FBT0U7QUFBQTtBQUFBLFlBQUssV0FBVSxZQUFmO0FBQ0U7QUFBQTtBQUFBLGNBQUssV0FBVSxLQUFmO0FBQ0U7QUFBQTtBQUFBLGdCQUFLLFdBQVUsV0FBZjtBQUNFLGtDQUFDLFdBQUQ7QUFDRSxxQkFBSyxxQkFBVTtBQUFFLHlCQUFLWixNQUFMLEdBQWNBLE1BQWQ7QUFBc0IsaUJBRHpDO0FBRUUscUJBQUssS0FBS2hDLEtBQUwsQ0FBV0gsR0FGbEI7QUFHRSx1QkFBTSxNQUhSO0FBSUUsd0JBQU8sT0FKVDtBQUtFLHdCQUFRLEtBQUtHLEtBQUwsQ0FBV0MsT0FMckIsQ0FLOEI7QUFMOUIsa0JBTUUsU0FBUyxLQUFLRCxLQUFMLENBQVdFLE9BTnRCLENBTStCO0FBQzdCO0FBUEYsa0JBUUUsUUFBUSxLQUFLRixLQUFMLENBQVdHLEtBQVgsR0FBbUIsQ0FBbkIsR0FBdUIsS0FBS0gsS0FBTCxDQUFXSSxNQVI1QztBQVNFLHdCQUFRO0FBQUEseUJBQU0sT0FBS2EsUUFBTCxDQUFjLEVBQUVmLFNBQVMsSUFBWCxFQUFkLENBQU47QUFBQSxpQkFUVjtBQVVFLHlCQUFTO0FBQUEseUJBQU0sT0FBS2UsUUFBTCxDQUFjLEVBQUVmLFNBQVMsS0FBWCxFQUFkLENBQU47QUFBQSxpQkFWWDtBQVdFLHlCQUFTLEtBQUtxQyxVQUFMLENBQWdCbkIsSUFBaEIsQ0FBcUIsSUFBckIsQ0FYWDtBQVlFLHlCQUFTLEtBQUttQixVQUFMLENBQWdCbkIsSUFBaEIsQ0FBcUIsSUFBckIsQ0FaWDtBQWFFLDRCQUFZO0FBQUEseUJBQVksT0FBS0gsUUFBTCxDQUFjLEVBQUVWLGtCQUFGLEVBQWQsQ0FBWjtBQUFBLGlCQWJkLENBYXdEO0FBYnhELGtCQWNFLFlBQVksS0FBS3NDLGNBQUwsQ0FBb0J6QixJQUFwQixDQUF5QixJQUF6QjtBQWRkO0FBREY7QUFERixXQURGO0FBdUJFO0FBQUE7QUFBQSxjQUFLLFdBQVUsS0FBZjtBQUNFO0FBQUE7QUFBQSxnQkFBSyxXQUFVLFdBQWY7QUFDRTtBQUFBO0FBQUEsa0JBQUssSUFBRyxTQUFSLEVBQWlCLFdBQVUsVUFBM0I7QUFDRSw2Q0FBSyxXQUFVLDBDQUFmO0FBQ0Usd0JBQUssYUFEUCxFQUNxQixPQUFPLEVBQUMwQixPQUFRLEtBQUs5QyxLQUFMLENBQVdRLFFBQVgsR0FBb0IsR0FBckIsR0FBMEIsR0FBbEMsRUFENUI7QUFERjtBQURGO0FBREYsV0F2QkY7QUFnQ0U7QUFBQTtBQUFBLGNBQUssSUFBRyxVQUFSLEVBQW1CLFdBQVUsS0FBN0I7QUFDRTtBQUFBO0FBQUEsZ0JBQUssV0FBVSxVQUFmO0FBQ0U7QUFBQTtBQUFBLGtCQUFLLFdBQVUsV0FBZjtBQUNFO0FBQUE7QUFBQSxvQkFBUSxXQUFVLHdCQUFsQixFQUEyQyxTQUFTLEtBQUswQixTQUFMLENBQWVkLElBQWYsQ0FBb0IsSUFBcEIsQ0FBcEQ7QUFBK0UsZ0RBQU0sV0FBVyxLQUFLcEIsS0FBTCxDQUFXRSxPQUFYLEdBQXFCLDJCQUFyQixHQUFtRCwwQkFBcEU7QUFBL0UsaUJBREY7QUFFRTtBQUFBO0FBQUEsb0JBQVEsV0FBVSx3QkFBbEIsRUFBMkMsU0FBUyxLQUFLNkMsSUFBTCxDQUFVM0IsSUFBVixDQUFlLElBQWYsQ0FBcEQ7QUFBMEUsZ0RBQU0sV0FBVSwwQkFBaEI7QUFBMUUsaUJBRkY7QUFHRyx1QkFBS1EsS0FBS0MsS0FBTCxDQUFZLEtBQUs3QixLQUFMLENBQVdPLFFBQVgsR0FBb0IsS0FBS1AsS0FBTCxDQUFXUSxRQUFoQyxHQUEwQyxFQUFyRCxDQUFMLEdBQThELEdBQTlELEdBQWtFLENBQUMsT0FBTW9CLEtBQUtDLEtBQUwsQ0FBYSxLQUFLN0IsS0FBTCxDQUFXTyxRQUFYLEdBQW9CLEtBQUtQLEtBQUwsQ0FBV1EsUUFBaEMsR0FBMENvQixLQUFLQyxLQUFMLENBQVksS0FBSzdCLEtBQUwsQ0FBV08sUUFBWCxHQUFvQixLQUFLUCxLQUFMLENBQVdRLFFBQWhDLEdBQTBDLEVBQXJELElBQXlELEVBQS9HLENBQVAsRUFBNkh3QyxLQUE3SCxDQUFtSSxDQUFDLENBQXBJLENBSHJFO0FBSUksd0JBQU1wQixLQUFLQyxLQUFMLENBQVcsS0FBSzdCLEtBQUwsQ0FBV08sUUFBWCxHQUFvQixFQUEvQixDQUFOLEdBQXlDLEdBQXpDLElBQThDLEtBQUtQLEtBQUwsQ0FBV08sUUFBWCxHQUFvQnFCLEtBQUtDLEtBQUwsQ0FBVyxLQUFLN0IsS0FBTCxDQUFXTyxRQUFYLEdBQW9CLEVBQS9CLElBQW1DLEVBQXJHO0FBSko7QUFERixhQURGO0FBVUU7QUFBQTtBQUFBLGdCQUFLLFdBQVUsVUFBZjtBQUNFO0FBQUE7QUFBQSxrQkFBSyxJQUFHLFNBQVIsRUFBa0IsU0FBUyxLQUFLMEMsSUFBTCxDQUFVN0IsSUFBVixDQUFlLElBQWYsQ0FBM0I7QUFDRSw4Q0FBTSxXQUFXLEtBQUtwQixLQUFMLENBQVdHLEtBQVgsR0FBbUIsZ0NBQW5CLEdBQXdELEtBQUtILEtBQUwsQ0FBV0ksTUFBWCxHQUFrQixHQUFuQixHQUEwQixpQ0FBMUIsR0FBOEQsK0JBQXRJO0FBREYsZUFERjtBQUlFLDZDQUFPLElBQUcsWUFBVixFQUF1QixNQUFLLE9BQTVCLEVBQW9DLEtBQUssQ0FBekMsRUFBNEMsS0FBSyxDQUFqRCxFQUFvRCxNQUFLLEtBQXpEO0FBQ0UsdUJBQU8sS0FBS0osS0FBTCxDQUFXRyxLQUFYLEdBQW1CLENBQW5CLEdBQXVCLEtBQUtILEtBQUwsQ0FBV0ksTUFEM0M7QUFFRSwwQkFBVSxLQUFLOEMsU0FBTCxDQUFlOUIsSUFBZixDQUFvQixJQUFwQixDQUZaO0FBSkY7QUFWRjtBQWhDRjtBQVBGLE9BREY7QUE4REQ7Ozs7RUF6UGlCK0IsTUFBTUMsUzs7QUEwUHpCOztBQUVEQyxPQUFPM0QsS0FBUCxHQUFlQSxLQUFmIiwiZmlsZSI6InBsYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vQ0xBU1NFU1xyXG4vL1RoZSBWaWRlbyBjbGFzcyBjb250cm9sbHMgdGhlIHBsYXllclxyXG5jbGFzcyBWaWRlbyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzKTtcclxuICAgIC8vaWYgYSB2aWRlbyBpcyBub3QgbG9hZGVkLCB0aGUgdXJsIHZhcmlhYmxlIHdpbGwgYmUgbnVsbC4gT3RoZXJ3aXNlLCB1cmwgd2lsbCBiZSBzZXQgdG8gdGhlIGxvYWRlZCB2aWRlbydzIHVybFxyXG4gICAgaWYgKCF0aGlzLnByb3BzLnZpZGVvKSB7XHJcbiAgICAgIHZhciB1cmwgPSBudWxsO1xyXG4gICAgICB2YXIgc2V0UGxheSA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIHVybCA9IHRoaXMucHJvcHMudmlkZW8udmlkZW91cmw7XHJcbiAgICAgIHZhciBzZXRQbGF5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN0YXRlID0ge1xyXG4gICAgLy9kZWZhdWx0IGF1ZGlvIHN0YXRlc1xyXG4gICAgICB2aWRlbzogdGhpcy5wcm9wcy52aWRlbywgLy9yZWZlcmVuY2Ugc3RhdGUgdGhhdCBhbGxvd3MgdXMgdG8gYWNjZXNzIHRoZSB2aWRlbyBVUkwgYXMgd2VsbCBhcyBpdHMgdGl0bGVcclxuICAgICAgdXJsOiB1cmwsIC8vdGhlIHVybCB0aGF0IHRoZSByZWFjdCBwbGF5ZXIgY29tcG9uZW50IHVzZXMgZm9yIGN1cnJlbnQgdmlkZW9cclxuICAgICAgaGlkZVZpZDogZmFsc2UsIC8vd2hldGhlciBvciBub3QgdGhlIHZpZGVvcyBhcmUgaGlkZGVuIG9uIHRoZSBwYWdlLiBBdWRpbyB3aWxsIHBsYXkgcmVnYXJkbGVzc1xyXG4gICAgICBwbGF5aW5nOiBzZXRQbGF5LCAvL0lmIGZhbHNlLCBwbGF5YmFjayBpcyBwYXVzZWQuIEFsc28gY29udHJvbHMgYXV0b21hdGljIHBsYXliYWNrIHVwb24gbG9hZFxyXG4gICAgICBtdXRlZDogZmFsc2UsXHJcbiAgICAgIHZvbHVtZTogMSwgLy92b2x1bWUgaXMgbWVhc3VyZSBhcyBhIGRlY2ltYWwgbnVtYmVyIGJldHdlZW4gMCBhbmQgMVxyXG4gICAgICBwbGF5ZWQ6IDAsXHJcbiAgICAgIGxvYWRlZDogMCxcclxuICAgICAgZHVyYXRpb246IDAsIC8vdmFsdWUgaW4gc2Vjb25kcyB0aGF0IGNvdW50cyB0aGUgb3ZlcmFsbCBsZW5ndGggb2YgdGhlIHZpZGVvXHJcbiAgICAgIHByb2dyZXNzOiAwLCAvL3RoZSBjdXJyZW50IHRpbWUgYXQgd2hpY2ggdGhlIHZpZGVvIGlzIHBsYXlpbmcuIFRoaXMgaXMgYSBkZWNpbWFsIG51bWJlciBiZXR3ZWVuIDAgYW5kIDFcclxuICAgICAgc2VydmVyRGF0YTogMCxcclxuICAgICAgcGxheWJhY2tSYXRlOiAxLjAsIC8vdGhlIHNwZWVkIGF0IHdoaWNoIGEgdmlkZW8gd2lsbCBiZSBwbGF5ZWQsIGJldHdlZW4gMCBhbmQgMlxyXG4gICAgICB1c2VTeW5jOiB0cnVlLCAvL29wdGlvbmFsIHN0YXRlIGZvciB3aGV0aGVyIG9yIG5vdCBhIGdpdmVuIGNvbm5lY3RlZCB1c2VyIHdpbGwgcmVtYWluIGluIHN5bmMgd2l0aCB0aGUgJ2FkbWluJ1xyXG4gICAgICBhZG1pbkZsYWc6IHRoaXMucHJvcHMuYWRtaW5GbGFnLCAvL3N0YXRlIGdpdmVuIHRvIHRoZSBmaXJzdCBwZXJzb24gdG8gY29ubmVjdCB0byB0aGUgc2Vzc2lvbi4gUGxheWJhY2sgc3luYyBpcyBtYXRjaGVkIHRvIHRoZWlyIGN1cnJlbnQgcGxheWJhY2sgdGltZS5cclxuICAgICAgaW5pdGlhbGl6ZWRTeW5jOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbigncmVjVGltZScsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlcnZlckRhdGE6IGRhdGEudGltZX0pO1xyXG4gICAgICB0aGlzLnZlcmlmeVN5bmMoKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy9XaGVuIHRoZSBzZXRBZG1pbkZsYWcgZXZlbnQgb2NjdXJzLCB0aGUgc2V0QWRtaW4gZmxhZyBpcyBhbHNvIGFzc2lnbmVkIGluIHRoZSBjb21wb25lbnQncyBzdGF0ZXNcclxuICAgIHRoaXMucHJvcHMuc29ja2V0Lm9uKCdzZXRBZG1pbkZsYWcnLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHthZG1pbkZsYWc6IHRydWV9KTtcclxuXHJcbiAgICAgIC8vaWYgdGhlIHVzZXIgaXMgdGhlIGFkbWluIGFuZCB0aGVpciBTeW5jIGhhc24ndCBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQsIGl0IHdpbGwgZm9yY2UgdGhhdCBpbml0aWFsaXp0aW9uXHJcbiAgICAgIC8vdGhpcyBpcyBpbXBvcnRhbnQgZm9yIHdoZW4gYWRtaW4gcm9sZXMgYXJlIGhhbmRlZCBvZmYsIHN1Y2ggYXMgd2hlbiBhbiBhZG1pbiBkaXNjb25uZWN0c1xyXG4gICAgICBpZih0aGlzLnN0YXRlLmFkbWluRmxhZyAmJiAhdGhpcy5zdGF0ZS5pbml0aWFsaXplZFN5bmMpIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIGluaXRpYWxpemVkU3luYzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRWaWRlbygpOy8vZW5zdXJlcyB0aGF0IHRoZSB2aWRlbyBwbGF5YmFjayBhdXRvbWF0aWNhbGx5IGJlZ2luc1xyXG4gICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuZW1pdERhdGEoKTtcclxuICB9XHJcblxyXG4gIC8vQVVESU8gQ09OVFJPTExFUlNcclxuICAvL3N0b3AgYnV0dG9uJ3MgY29udHJvbHNcclxuICBzdG9wKCkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHVybDogbnVsbCwgcGxheWluZzogZmFsc2UsIHByb2dyZXNzOiAwIH0pO1xyXG4gIH1cclxuICAvL3RvZ2dsZSBmb3IgcGxheWluZyBvciBwYXVzZVxyXG4gIHBsYXlQYXVzZSgpIHtcclxuICAgIGlmICh0aGlzLnN0YXRlLnVybCkge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogIXRoaXMuc3RhdGUucGxheWluZyB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICghdGhpcy5zdGF0ZS52aWRlbyAmJiB0aGlzLnN0YXRlLnNlcnZlckRhdGEudmlkZW8pIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIHZpZGVvOiB0aGlzLnN0YXRlLnNlcnZlckRhdGEudmlkZW8sXHJcbiAgICAgICAgICB1cmw6IHRoaXMuc3RhdGUuc2VydmVyRGF0YS52aWRlby52aWRlb3VybCxcclxuICAgICAgICAgIHBsYXlpbmc6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIC8vaWYgdGhlIHZpZGVvIGhhZCBiZWVuIHN0b3BwZWQgcHJldmlvdXMsIHRoaXMgd2lsbCByZXN1bWUgcGxheWJhY2sgb2YgdGhhdCBmcm9tIHRoZSBiZWdpbm5pbmdcclxuICAgICAgICAgIHVybDogdGhpcy5zdGF0ZS52aWRlby52aWRlb3VybCxcclxuICAgICAgICAgIHBsYXlpbmc6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICAvL3RvZ2dsZXMgdGhlIG11dGUgc3RhdGVcclxuICBtdXRlKCkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IG11dGVkOiAhdGhpcy5zdGF0ZS5tdXRlZCB9KTtcclxuICB9XHJcbiAgLy9zZXRzIHRoZSB2b2x1bWUgYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBzbGlkZXIuIFNlZSB0aGUgSFRNTCBjb250cm9scyBpbiB0aGUgSlNYIGJlbG93XHJcbiAgc2V0Vm9sdW1lKHZvbCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUubXV0ZWQpIHt0aGlzLnNldFN0YXRlKHsgbXV0ZWQ6IGZhbHNlIH0pfTtcclxuICAgIHRoaXMuc2V0U3RhdGUoeyB2b2x1bWU6IHBhcnNlRmxvYXQodm9sLnRhcmdldC52YWx1ZSkgfSk7XHJcbiAgfVxyXG4gIC8vdG9nZ2xlcyB2aWRlbyB2aXNpYmlsaXR5IG9uIHRoZSBwYWdlLiBBdWRpbyBwbGF5cyByZWdhcmRsZXNzXHJcbiAgdG9nZ2xlVmlkZW8oKSB7XHJcbiAgICB0aGlzLnNldFN0YXRlKHsgaGlkZVZpZDogIXRoaXMuc3RhdGUuaGlkZVZpZCB9KTtcclxuICB9XHJcblxyXG4gIC8vb3B0aW9uYWwgdG9nZ2xlIHN5bmMgYnV0dG9uLiBXaGVuIHVzZVN5bmMgaXMgZmFsc2UsIHBsYXliYWNrIGlnbm9yZXMgdGhlIHN0YXRlIG9mIHRoZSBjdXJyZW50IGFkbWluXHJcbiAgdG9nZ2xlU3luYygpIHtcclxuICAgIHRoaXMuc2V0U3RhdGUoeyB1c2VTeW5jOiAhdGhpcy5zdGF0ZS51c2VTeW5jIH0pO1xyXG4gIH1cclxuXHJcbiAgLy91cGRhdGVzIHRoZSBjdXJyZW50IHByb2dyZXNzIHRpbWVcclxuICB1cGRhdGVQcm9ncmVzcyh0aW1lKSB7XHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcHJvZ3Jlc3M6IHRpbWUucGxheWVkIH0pO1xyXG4gIH1cclxuXHJcbiAgLy9tZXRob2QgdG8gY29tcGFyZSBzeW5jcm9uaXphdGlvbiBvZiBhbGwgY29ubmVjdGVkIHVzZXJzXHJcbiAgdmVyaWZ5U3luYygpIHtcclxuICAgIGlmICghdGhpcy5zdGF0ZS5hZG1pbkZsYWcgJiYgdGhpcy5zdGF0ZS51c2VTeW5jKSB7IC8vaWYgdXNlciBpcyBOT1QgdGhlIGFkbWluIGFuZCB0aGUgdXNlU3luYyBidXR0b24gaXMgT05cclxuICAgICAgdmFyIGNsaWVudFRpbWUgPSBNYXRoLmZsb29yKHRoaXMuc3RhdGUucHJvZ3Jlc3MqdGhpcy5zdGF0ZS5kdXJhdGlvbik7Ly92YXJpYWJsZSB0byBob2xkIHRoZSBVU0VSJ3MgcGxheWJhY2sgcHJvZ3Jlc3MgKGluIHRoZSBmb3JtIG9mIHNlY29uZHMsIHJhdGhlciB0aGFuIGRlY2ltYWxzKVxyXG4gICAgICB2YXIgc2VydmVyVGltZSA9IE1hdGguZmxvb3IodGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnByb2dyZXNzKnRoaXMuc3RhdGUuZHVyYXRpb24pOy8vdmFyaWFibGUgdG8gaG9sZCB0aGUgU0VSVkVSJ3MgcGxheWJhY2sgcHJvZ3Jlc3MgKGluIHRoZSBmb3JtIG9mIHNlY29uZHMsIHJhdGhlciB0aGFuIGRlY2ltYWxzKVxyXG4gICAgICBpZiAoTWF0aC5hYnMoY2xpZW50VGltZSAtIHNlcnZlclRpbWUpID49IDQpIHsvL3RoaXMgd2lsbCBjaGVjayBpZiBhIGNvbm5lY3RlZCB1c2VyIGlzIGFib3ZlIG9yIGJlbG93IDQgc2Vjb25kcyBhd2F5IGZyb20gdGhlIGFkbWluJ3MgY3VycmVudCBwbGF5YmFjayB0aW1lLCBhbmQgaWYgdGhleSBhcmUuLi5cclxuICAgICAgICB0aGlzLnBsYXllci5zZWVrVG8odGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnByb2dyZXNzKTsgLy9mb3JjZSB0aGUgdXNlcidzIHBsYXliYWNrIHRpbWUgdG8gbWF0Y2ggdGhlIGFkbWluJ3MgcGxheWJhY2sgdGltZVxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoey8vc2V0cyB0aGUgJ3Byb2dyZXNzJyBzdGF0ZSB0byBtYXRjaCB0aGUgcmVjZW50bHkgYWRqdXN0ZWQgcGxheWJhY2sgdGltZVxyXG4gICAgICAgICAgcHJvZ3Jlc3M6IHRoaXMuc3RhdGUuc2VydmVyRGF0YS5wcm9ncmVzc1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIC8vVGhlIGZvbGxvdyBjb2RlIHdpbGwgZm9yY2Ugc3luY2hyb25pemF0aW9uIG9mIFBsYXllciBjb21wb25lbnQgc3RhdGVzXHJcbiAgICAgIGlmICh0aGlzLnN0YXRlLnBsYXlpbmcgIT09IHRoaXMuc3RhdGUuc2VydmVyRGF0YS5wbGF5aW5nKSB7Ly9pZiB0aGUgdXNlcidzICdwbGF5aW5nJyBkb2VzIG5vdCBtYXRjaCB0aGUgYWRtaW4ncyAncGxheWluZycgc3RhdGUsIHRvZ2dsZXMgcGxheVBhdXNlIG9uIHRoZSB2aWRlb1xyXG4gICAgICAgIHRoaXMucGxheVBhdXNlKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuc3RhdGUudmlkZW8gJiYgdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnZpZGVvKSB7Ly9pZiB0aGUgdXNlcidzIGxvYWRlZCB2aWRlbyBkb2Vzbid0IG1hdGNoIHRoZSBhZG1pbidzIHZpZGVvLCBmb3JjZSBpdCB0byBtYXRjaFxyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZpZGVvLmlkICE9PSB0aGlzLnN0YXRlLnNlcnZlckRhdGEudmlkZW8uaWQpIHtcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICB2aWRlbzogdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnZpZGVvLFxyXG4gICAgICAgICAgICB1cmw6IHRoaXMuc3RhdGUuc2VydmVyRGF0YS52aWRlby52aWRlb3VybFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXRlLnZpZGVvICYmIHRoaXMuc3RhdGUuc2VydmVyRGF0YS52aWRlbykgey8vaWYgYSB2aWRlbyBoYWQgbm90IGJlZW4gbG9hZGVkIGZvciB0aGUgdXNlciwgZm9yY2UgdGhlIGN1cnJlbnQgdmlkZW8gdGhhdCB0aGUgYWRtaW4gaGFzIGxvYWRlZCB0byBiZWNvbWUgbG9hZGVkIGZvciB0aGUgdXNlclxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgdmlkZW86IHRoaXMuc3RhdGUuc2VydmVyRGF0YS52aWRlbyxcclxuICAgICAgICAgIHVybDogdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnZpZGVvLnZpZGVvdXJsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7Ly9pZiBubyBvdGhlciBzeW5jcm9uaXphdGlvbiBpcyBuZWNlc3NhcnksIHNldCB2aWRlbyBhbmQgdXJsIHRvIG51bGwsIHJlbmRlcmluZyBhbiBlbXB0eSB2aWRlbyBmcmFtZVxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgdmlkZW86IG51bGwsXHJcbiAgICAgICAgICB1cmw6IG51bGxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZW1pdERhdGEoKSB7Ly9pZiB0aGUgdXNlciBpcyB0aGUgYWRtaW4sIGVtaXQgdGhlIGZvbGxvd2luZyBkYXRhXHJcbiAgICBpZiAodGhpcy5zdGF0ZS5hZG1pbkZsYWcpIHtcclxuICAgICAgdmFyIHBsYXllckRhdGEgPSB7XHJcbiAgICAgICAgcHJvZ3Jlc3M6IHRoaXMuc3RhdGUucHJvZ3Jlc3MsIC8vd2hhdCB0aGUgY3VycmVudCBwbGF5YmFjayB0aW1lIGlzXHJcbiAgICAgICAgdmlkZW86IHRoaXMuc3RhdGUudmlkZW8sICAvL3doYXQgdGhlIGN1cnJlbnQgdmlkZW8gcGxheWluZyBzaG91bGQgYmVcclxuICAgICAgICBwbGF5aW5nOiB0aGlzLnN0YXRlLnBsYXlpbmcgLy93aGF0IHRoZSBjdXJyZW50IHBsYXlpbmcgJ3N0YXRlJyAocGF1c2VkIG9yIHBsYXlpbmcpIGlzXHJcbiAgICAgIH07XHJcbiAgICAgIHRoaXMucHJvcHMuc29ja2V0LmVtaXQoJ3NldFRpbWUnLCB7dGltZTogcGxheWVyRGF0YX0pOyAvL2VtaXRzIHRoZSBkYXRhIHRvIGFsbCBjb25uZWN0ZWQgdXNlcnMgdXNpbmcgc29ja2V0XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dCh0aGlzLmVtaXREYXRhLmJpbmQodGhpcyksIDEwMDApOy8vcmVwZWF0IHRoaXMgbWV0aG9kIGV2ZXJ5IDEgc2Vjb25kXHJcbiAgfVxyXG5cclxuICBzdGFydFZpZGVvKCkgey8vbWV0aG9kIHRvIGJlIHJ1biB3aGVuIGEgYXR0ZW1wdGluZyB0byBzdGFydCBhIHZpZGVvXHJcbiAgICBpZih0aGlzLnN0YXRlLmFkbWluRmxhZyAmJiB0aGlzLnN0YXRlLnZpZGVvID09PSBudWxsICYmIHRoaXMuc3RhdGUudXJsID09PSBudWxsKSB7Ly9pZiB0aGUgdXNlciBpcyBhZG1pbiBhbmQgdGhlcmUgaXNuJ3QgYSB2aWRlbyBsb2FkZWQgYXMgd2VsbCBhcyBubyB1cmwgaGFzIGJlZW4gYXNzaWduZWQuLi5cclxuICAgICAgdGhpcy5vblZpZGVvRW5kKCk7Ly9ydW4gdGhlIHZpZGVvIGVuZCBtZXRob2QsIGRldGFpbGVkIGJlbG93XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBvblZpZGVvRW5kKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUuYWRtaW5GbGFnKSB7Ly9pZiB0aGUgdXNlciBpcyB0aGUgYWRtaW4uLi5cclxuICAgICAgdmFyIG5ld1ZpZCA9IHRoaXMucHJvcHMuYWR2YW5jZVF1ZXVlKCk7Ly9zZXRzIHRoZSBuZXdWaWQgdmFyaWFibGUgdG8gdGhlIG5leHQgdmlkZW8gaW4gdGhlIHF1ZXVlXHJcblxyXG4gICAgICB0aGlzLnNldFN0YXRlKHsvL2NsZWFycyB0aGUgbGFzdCB1cmwgdGhhdCB3YXMgdXNlZFxyXG4gICAgICAgIHVybDogJydcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAobmV3VmlkKSB7Ly9pZiBhIG5ldyB2aWRlbyBoYXMgYmVlbiBzZXQuLi5cclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIHZpZGVvOiBuZXdWaWQsIC8vc2V0IHRoZSBuZXcgdmlkZW8ncyBkYXRhXHJcbiAgICAgICAgICB1cmw6IG5ld1ZpZC52aWRlb3VybCwgLy9zZXQgdGhlIG5ldyB2aWRlbydzIFVSTFxyXG4gICAgICAgICAgcHJvZ3Jlc3M6IDAsIC8vc2V0IGl0cyBwbGF5YmFjayB0aW1lIHRvIHRoZSBzdGFydCAoemVybylcclxuICAgICAgICAgIGhpZGVWaWQ6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7IC8vb3J0aGVyd2lzZSB1c2UgZW1wdHkgZGF0YSwgYXMgbm8gdmlkZW8gZXhpc3RzIHRvIGJlIHBsYXllZFxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgdmlkZW86IG51bGwsXHJcbiAgICAgICAgICB1cmw6IG51bGwsXHJcbiAgICAgICAgICBwcm9ncmVzczogMCxcclxuICAgICAgICAgIGhpZGVWaWQ6IHRydWUsXHJcbiAgICAgICAgICBwbGF5aW5nOiBzZXRQbGF5XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuXHJcbiAgcmVuZGVyKCkgeyAvL3JlbmRlciB0aGUgdmlkZW8gcGFuZWwgdXNpbmcgYm9vdHN0cmFwXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2IGlkPSdhdWRpb1BhbmVsJyBjbGFzc05hbWU9J2NvbnRhaW5lci1mbHVpZCcgY2xhc3NOYW1lPVwicGFuZWwgcGFuZWwtaW5mb1wiPlxyXG4gICAgICAgIDxkaXYgaWQ9J3BseXJQbmxIZWFkaW5nJyBjbGFzc05hbWU9XCJwYW5lbC1oZWFkaW5nXCI+XHJcbiAgICAgICAgICA8ZGl2IGlkPSdoaWRlVmlkQnRuJyBkYXRhLXRvZ2dsZT0ndG9vbHRpcCcgdGl0bGU9J1RvZ2dsZSB2aWRlbycgb25DbGljaz17dGhpcy50b2dnbGVWaWRlby5iaW5kKHRoaXMpfT48c3BhbiBjbGFzc05hbWU9e3RoaXMuc3RhdGUuaGlkZVZpZCA/ICdnbHlwaGljb24gZ2x5cGhpY29uLWV5ZS1jbG9zZScgOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1leWUtb3Blbid9Pjwvc3Bhbj48L2Rpdj5cclxuICAgICAgICAgIDxkaXYgaWQ9J3VzZVN5bmNCdG4nIGRhdGEtdG9nZ2xlPSd0b29sdGlwJyB0aXRsZT0nVG9nZ2xlIHN5bmMnIG9uQ2xpY2s9e3RoaXMudG9nZ2xlU3luYy5iaW5kKHRoaXMpfT48c3BhbiBjbGFzc05hbWU9e3RoaXMuc3RhdGUudXNlU3luYyA/ICdnbHlwaGljb24gZ2x5cGhpY29uLXRyYW5zZmVyJyA6ICdnbHlwaGljb24gZ2x5cGhpY29uLWhlYWRwaG9uZXMnfT48L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGlkPSdhdWRpb1RpdGxlJz57KCF0aGlzLnN0YXRlLnZpZGVvKSA/ICdGaW5kIGEgYm9vZ2llIScgOiB0aGlzLnN0YXRlLnZpZGVvLnRpdGxlfTwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWJvZHlcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cnPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLW1kLTEyJz5cclxuICAgICAgICAgICAgICA8UmVhY3RQbGF5ZXJcclxuICAgICAgICAgICAgICAgIHJlZj17cGxheWVyID0+IHsgdGhpcy5wbGF5ZXIgPSBwbGF5ZXIgfSB9XHJcbiAgICAgICAgICAgICAgICB1cmw9e3RoaXMuc3RhdGUudXJsfVxyXG4gICAgICAgICAgICAgICAgd2lkdGg9JzEwMCUnXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ9JzQ4MHB4J1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuPXt0aGlzLnN0YXRlLmhpZGVWaWR9IC8vaGlkZXMgdGhlIHZpZGVvIGZyYW1lIGJ5IGRlZmF1bHQ7IGNhbiBiZSB0b2dnbGVkXHJcbiAgICAgICAgICAgICAgICBwbGF5aW5nPXt0aGlzLnN0YXRlLnBsYXlpbmd9IC8vY29udHJvbHMgcGxheWJhY2tcclxuICAgICAgICAgICAgICAgIC8vdm9sdW1lPXt0aGlzLnN0YXRlLnZvbHVtZX1cclxuICAgICAgICAgICAgICAgIHZvbHVtZT17dGhpcy5zdGF0ZS5tdXRlZCA/IDAgOiB0aGlzLnN0YXRlLnZvbHVtZX1cclxuICAgICAgICAgICAgICAgIG9uUGxheT17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6IHRydWUgfSkgfVxyXG4gICAgICAgICAgICAgICAgb25QYXVzZT17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6IGZhbHNlfSkgfVxyXG4gICAgICAgICAgICAgICAgb25FbmRlZD17dGhpcy5vblZpZGVvRW5kLmJpbmQodGhpcyl9XHJcbiAgICAgICAgICAgICAgICBvbkVycm9yPXt0aGlzLm9uVmlkZW9FbmQuYmluZCh0aGlzKX1cclxuICAgICAgICAgICAgICAgIG9uRHVyYXRpb249e2R1cmF0aW9uID0+IHRoaXMuc2V0U3RhdGUoeyBkdXJhdGlvbiB9KSB9IC8vbG9ncyB0aGUgb3ZlcmFsbCB2aWRlbyBkdXJhdGlvblxyXG4gICAgICAgICAgICAgICAgb25Qcm9ncmVzcz17dGhpcy51cGRhdGVQcm9ncmVzcy5iaW5kKHRoaXMpfVxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyb3cnPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLW1kLTEyJz5cclxuICAgICAgICAgICAgICA8ZGl2IGlkPSdwcm9nQmFyJ2NsYXNzTmFtZT0ncHJvZ3Jlc3MnPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3Byb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItc3RyaXBlZCBhY3RpdmUnXHJcbiAgICAgICAgICAgICAgICAgIHJvbGU9J3Byb2dyZXNzYmFyJyBzdHlsZT17e3dpZHRoOiAodGhpcy5zdGF0ZS5wcm9ncmVzcyoxMDApKyclJ319PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGlkPSdhbGxDdHJscycgY2xhc3NOYW1lPSdyb3cnPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXhzLTknPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSd2aWRlb0N0cmwnPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9J2J0biBidG4tc20gYnRuLWRlZmF1bHQnIG9uQ2xpY2s9e3RoaXMucGxheVBhdXNlLmJpbmQodGhpcyl9PjxzcGFuIGNsYXNzTmFtZT17dGhpcy5zdGF0ZS5wbGF5aW5nID8gJ2dseXBoaWNvbiBnbHlwaGljb24tcGF1c2UnIDogJ2dseXBoaWNvbiBnbHlwaGljb24tcGxheSd9Pjwvc3Bhbj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1kZWZhdWx0JyBvbkNsaWNrPXt0aGlzLnN0b3AuYmluZCh0aGlzKX0+PHNwYW4gY2xhc3NOYW1lPSdnbHlwaGljb24gZ2x5cGhpY29uLXN0b3AnPjwvc3Bhbj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIHsnICAnK01hdGguZmxvb3IoKHRoaXMuc3RhdGUuZHVyYXRpb24qdGhpcy5zdGF0ZS5wcm9ncmVzcykvNjApKyc6JysoJzAwJysoTWF0aC5mbG9vcigoKHRoaXMuc3RhdGUuZHVyYXRpb24qdGhpcy5zdGF0ZS5wcm9ncmVzcyktTWF0aC5mbG9vcigodGhpcy5zdGF0ZS5kdXJhdGlvbip0aGlzLnN0YXRlLnByb2dyZXNzKS82MCkqNjApKSkpLnNsaWNlKC0yKX1cclxuICAgICAgICAgICAgICAgIHsgJyAvICcrTWF0aC5mbG9vcih0aGlzLnN0YXRlLmR1cmF0aW9uLzYwKSsnOicrKHRoaXMuc3RhdGUuZHVyYXRpb24tTWF0aC5mbG9vcih0aGlzLnN0YXRlLmR1cmF0aW9uLzYwKSo2MCkgfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb2wteHMtMyc+XHJcbiAgICAgICAgICAgICAgPGRpdiBpZD0nbXV0ZUJ0bicgb25DbGljaz17dGhpcy5tdXRlLmJpbmQodGhpcyl9PlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXt0aGlzLnN0YXRlLm11dGVkID8gJ2dseXBoaWNvbiBnbHlwaGljb24tdm9sdW1lLW9mZicgOiAoKHRoaXMuc3RhdGUudm9sdW1lPDAuNSkgPyAnZ2x5cGhpY29uIGdseXBoaWNvbi12b2x1bWUtZG93bicgOiAnZ2x5cGhpY29uIGdseXBoaWNvbi12b2x1bWUtdXAnICkgfT48L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGlucHV0IGlkPSd2b2x1bWVDdHJsJyB0eXBlPSdyYW5nZScgbWluPXswfSBtYXg9ezF9IHN0ZXA9J2FueSdcclxuICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm11dGVkID8gMCA6IHRoaXMuc3RhdGUudm9sdW1lfVxyXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuc2V0Vm9sdW1lLmJpbmQodGhpcyl9IC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcblxyXG53aW5kb3cuVmlkZW8gPSBWaWRlbzsiXX0=