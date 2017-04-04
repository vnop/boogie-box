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
            hideVid: true
            // playing: setPlay
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9wbGF5ZXIuanN4Il0sIm5hbWVzIjpbIlZpZGVvIiwicHJvcHMiLCJ2aWRlbyIsInVybCIsInNldFBsYXkiLCJ2aWRlb3VybCIsInN0YXRlIiwiaGlkZVZpZCIsInBsYXlpbmciLCJtdXRlZCIsInZvbHVtZSIsInBsYXllZCIsImxvYWRlZCIsImR1cmF0aW9uIiwicHJvZ3Jlc3MiLCJzZXJ2ZXJEYXRhIiwicGxheWJhY2tSYXRlIiwidXNlU3luYyIsImFkbWluRmxhZyIsImluaXRpYWxpemVkU3luYyIsInNvY2tldCIsIm9uIiwiZGF0YSIsInNldFN0YXRlIiwidGltZSIsInZlcmlmeVN5bmMiLCJiaW5kIiwic3RhcnRWaWRlbyIsImVtaXREYXRhIiwidm9sIiwicGFyc2VGbG9hdCIsInRhcmdldCIsInZhbHVlIiwiY2xpZW50VGltZSIsIk1hdGgiLCJmbG9vciIsInNlcnZlclRpbWUiLCJhYnMiLCJwbGF5ZXIiLCJzZWVrVG8iLCJwbGF5UGF1c2UiLCJpZCIsInBsYXllckRhdGEiLCJlbWl0Iiwic2V0VGltZW91dCIsIm9uVmlkZW9FbmQiLCJuZXdWaWQiLCJhZHZhbmNlUXVldWUiLCJ0b2dnbGVWaWRlbyIsInRvZ2dsZVN5bmMiLCJ0aXRsZSIsInVwZGF0ZVByb2dyZXNzIiwid2lkdGgiLCJzdG9wIiwic2xpY2UiLCJtdXRlIiwic2V0Vm9sdW1lIiwiUmVhY3QiLCJDb21wb25lbnQiLCJ3aW5kb3ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7SUFDTUEsSzs7O0FBQ0osaUJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFFakI7QUFGaUIsOEdBQ1hBLEtBRFc7O0FBR2pCLFFBQUksQ0FBQyxNQUFLQSxLQUFMLENBQVdDLEtBQWhCLEVBQXVCO0FBQ3JCLFVBQUlDLE1BQU0sSUFBVjtBQUNBLFVBQUlDLFVBQVUsS0FBZDtBQUNELEtBSEQsTUFHTztBQUNMLFVBQUlELE1BQU0sTUFBS0YsS0FBTCxDQUFXQyxLQUFYLENBQWlCRyxRQUEzQjtBQUNBLFVBQUlELFVBQVUsSUFBZDtBQUNEOztBQUVELFVBQUtFLEtBQUwsR0FBYTtBQUNiO0FBQ0VKLGFBQU8sTUFBS0QsS0FBTCxDQUFXQyxLQUZQLEVBRWM7QUFDekJDLFdBQUtBLEdBSE0sRUFHRDtBQUNWSSxlQUFTLEtBSkUsRUFJSztBQUNoQkMsZUFBU0osT0FMRSxFQUtPO0FBQ2xCSyxhQUFPLEtBTkk7QUFPWEMsY0FBUSxDQVBHLEVBT0E7QUFDWEMsY0FBUSxDQVJHO0FBU1hDLGNBQVEsQ0FURztBQVVYQyxnQkFBVSxDQVZDLEVBVUU7QUFDYkMsZ0JBQVUsQ0FYQyxFQVdFO0FBQ2JDLGtCQUFZLENBWkQ7QUFhWEMsb0JBQWMsR0FiSCxFQWFRO0FBQ25CQyxlQUFTLElBZEUsRUFjSTtBQUNmQyxpQkFBVyxNQUFLakIsS0FBTCxDQUFXaUIsU0FmWCxFQWVzQjtBQUNqQ0MsdUJBQWlCO0FBaEJOLEtBQWI7O0FBbUJBLFVBQUtsQixLQUFMLENBQVdtQixNQUFYLENBQWtCQyxFQUFsQixDQUFxQixTQUFyQixFQUFnQyxVQUFVQyxJQUFWLEVBQWdCO0FBQzlDLFdBQUtDLFFBQUwsQ0FBYyxFQUFDUixZQUFZTyxLQUFLRSxJQUFsQixFQUFkO0FBQ0EsV0FBS0MsVUFBTDtBQUNELEtBSCtCLENBRzlCQyxJQUg4QixPQUFoQzs7QUFLQTtBQUNBLFVBQUt6QixLQUFMLENBQVdtQixNQUFYLENBQWtCQyxFQUFsQixDQUFxQixjQUFyQixFQUFxQyxVQUFVQyxJQUFWLEVBQWdCO0FBQ25ELFdBQUtDLFFBQUwsQ0FBYyxFQUFDTCxXQUFXLElBQVosRUFBZDs7QUFFQTtBQUNBO0FBQ0EsVUFBRyxLQUFLWixLQUFMLENBQVdZLFNBQVgsSUFBd0IsQ0FBQyxLQUFLWixLQUFMLENBQVdhLGVBQXZDLEVBQXdEO0FBQ3RELGFBQUtJLFFBQUwsQ0FBYztBQUNaSiwyQkFBaUI7QUFETCxTQUFkO0FBR0EsYUFBS1EsVUFBTCxHQUpzRCxDQUlwQztBQUNuQjtBQUNGLEtBWG9DLENBV25DRCxJQVhtQyxPQUFyQzs7QUFhQSxVQUFLRSxRQUFMO0FBakRpQjtBQWtEbEI7O0FBRUQ7QUFDQTs7Ozs7MkJBQ087QUFDTCxXQUFLTCxRQUFMLENBQWMsRUFBRXBCLEtBQUssSUFBUCxFQUFhSyxTQUFTLEtBQXRCLEVBQTZCTSxVQUFVLENBQXZDLEVBQWQ7QUFDRDtBQUNEOzs7O2dDQUNZO0FBQ1YsVUFBSSxLQUFLUixLQUFMLENBQVdILEdBQWYsRUFBb0I7QUFDbEIsYUFBS29CLFFBQUwsQ0FBYyxFQUFFZixTQUFTLENBQUMsS0FBS0YsS0FBTCxDQUFXRSxPQUF2QixFQUFkO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBSSxDQUFDLEtBQUtGLEtBQUwsQ0FBV0osS0FBWixJQUFxQixLQUFLSSxLQUFMLENBQVdTLFVBQVgsQ0FBc0JiLEtBQS9DLEVBQXNEO0FBQ3BELGVBQUtxQixRQUFMLENBQWM7QUFDWnJCLG1CQUFPLEtBQUtJLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQmIsS0FEakI7QUFFWkMsaUJBQUssS0FBS0csS0FBTCxDQUFXUyxVQUFYLENBQXNCYixLQUF0QixDQUE0QkcsUUFGckI7QUFHWkcscUJBQVM7QUFIRyxXQUFkO0FBS0QsU0FORCxNQU1PO0FBQ0wsZUFBS2UsUUFBTCxDQUFjO0FBQ1o7QUFDQXBCLGlCQUFLLEtBQUtHLEtBQUwsQ0FBV0osS0FBWCxDQUFpQkcsUUFGVjtBQUdaRyxxQkFBUztBQUhHLFdBQWQ7QUFLRDtBQUNGO0FBQ0Y7QUFDRDs7OzsyQkFDTztBQUNMLFdBQUtlLFFBQUwsQ0FBYyxFQUFFZCxPQUFPLENBQUMsS0FBS0gsS0FBTCxDQUFXRyxLQUFyQixFQUFkO0FBQ0Q7QUFDRDs7Ozs4QkFDVW9CLEcsRUFBSztBQUNiLFVBQUksS0FBS3ZCLEtBQUwsQ0FBV0csS0FBZixFQUFzQjtBQUFDLGFBQUtjLFFBQUwsQ0FBYyxFQUFFZCxPQUFPLEtBQVQsRUFBZDtBQUFnQztBQUN2RCxXQUFLYyxRQUFMLENBQWMsRUFBRWIsUUFBUW9CLFdBQVdELElBQUlFLE1BQUosQ0FBV0MsS0FBdEIsQ0FBVixFQUFkO0FBQ0Q7QUFDRDs7OztrQ0FDYztBQUNaLFdBQUtULFFBQUwsQ0FBYyxFQUFFaEIsU0FBUyxDQUFDLEtBQUtELEtBQUwsQ0FBV0MsT0FBdkIsRUFBZDtBQUNEOztBQUVEOzs7O2lDQUNhO0FBQ1gsV0FBS2dCLFFBQUwsQ0FBYyxFQUFFTixTQUFTLENBQUMsS0FBS1gsS0FBTCxDQUFXVyxPQUF2QixFQUFkO0FBQ0Q7O0FBRUQ7Ozs7bUNBQ2VPLEksRUFBTTtBQUNuQixXQUFLRCxRQUFMLENBQWMsRUFBRVQsVUFBVVUsS0FBS2IsTUFBakIsRUFBZDtBQUNEOztBQUVEOzs7O2lDQUNhO0FBQ1gsVUFBSSxDQUFDLEtBQUtMLEtBQUwsQ0FBV1ksU0FBWixJQUF5QixLQUFLWixLQUFMLENBQVdXLE9BQXhDLEVBQWlEO0FBQUU7QUFDakQsWUFBSWdCLGFBQWFDLEtBQUtDLEtBQUwsQ0FBVyxLQUFLN0IsS0FBTCxDQUFXUSxRQUFYLEdBQW9CLEtBQUtSLEtBQUwsQ0FBV08sUUFBMUMsQ0FBakIsQ0FEK0MsQ0FDc0I7QUFDckUsWUFBSXVCLGFBQWFGLEtBQUtDLEtBQUwsQ0FBVyxLQUFLN0IsS0FBTCxDQUFXUyxVQUFYLENBQXNCRCxRQUF0QixHQUErQixLQUFLUixLQUFMLENBQVdPLFFBQXJELENBQWpCLENBRitDLENBRWlDO0FBQ2hGLFlBQUlxQixLQUFLRyxHQUFMLENBQVNKLGFBQWFHLFVBQXRCLEtBQXFDLENBQXpDLEVBQTRDO0FBQUM7QUFDM0MsZUFBS0UsTUFBTCxDQUFZQyxNQUFaLENBQW1CLEtBQUtqQyxLQUFMLENBQVdTLFVBQVgsQ0FBc0JELFFBQXpDLEVBRDBDLENBQ1U7QUFDcEQsZUFBS1MsUUFBTCxDQUFjLEVBQUM7QUFDYlQsc0JBQVUsS0FBS1IsS0FBTCxDQUFXUyxVQUFYLENBQXNCRDtBQURwQixXQUFkO0FBR0Q7QUFDRDtBQUNBLFlBQUksS0FBS1IsS0FBTCxDQUFXRSxPQUFYLEtBQXVCLEtBQUtGLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQlAsT0FBakQsRUFBMEQ7QUFBQztBQUN6RCxlQUFLZ0MsU0FBTDtBQUNEO0FBQ0QsWUFBSSxLQUFLbEMsS0FBTCxDQUFXSixLQUFYLElBQW9CLEtBQUtJLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQmIsS0FBOUMsRUFBcUQ7QUFBQztBQUNwRCxjQUFJLEtBQUtJLEtBQUwsQ0FBV0osS0FBWCxDQUFpQnVDLEVBQWpCLEtBQXdCLEtBQUtuQyxLQUFMLENBQVdTLFVBQVgsQ0FBc0JiLEtBQXRCLENBQTRCdUMsRUFBeEQsRUFBNEQ7QUFDMUQsaUJBQUtsQixRQUFMLENBQWM7QUFDWnJCLHFCQUFPLEtBQUtJLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQmIsS0FEakI7QUFFWkMsbUJBQUssS0FBS0csS0FBTCxDQUFXUyxVQUFYLENBQXNCYixLQUF0QixDQUE0Qkc7QUFGckIsYUFBZDtBQUlEO0FBQ0YsU0FQRCxNQU9PLElBQUksQ0FBQyxLQUFLQyxLQUFMLENBQVdKLEtBQVosSUFBcUIsS0FBS0ksS0FBTCxDQUFXUyxVQUFYLENBQXNCYixLQUEvQyxFQUFzRDtBQUFDO0FBQzVELGVBQUtxQixRQUFMLENBQWM7QUFDWnJCLG1CQUFPLEtBQUtJLEtBQUwsQ0FBV1MsVUFBWCxDQUFzQmIsS0FEakI7QUFFWkMsaUJBQUssS0FBS0csS0FBTCxDQUFXUyxVQUFYLENBQXNCYixLQUF0QixDQUE0Qkc7QUFGckIsV0FBZDtBQUlELFNBTE0sTUFLQTtBQUFDO0FBQ04sZUFBS2tCLFFBQUwsQ0FBYztBQUNackIsbUJBQU8sSUFESztBQUVaQyxpQkFBSztBQUZPLFdBQWQ7QUFJRDtBQUNGO0FBQ0Y7OzsrQkFFVTtBQUFDO0FBQ1YsVUFBSSxLQUFLRyxLQUFMLENBQVdZLFNBQWYsRUFBMEI7QUFDeEIsWUFBSXdCLGFBQWE7QUFDZjVCLG9CQUFVLEtBQUtSLEtBQUwsQ0FBV1EsUUFETixFQUNnQjtBQUMvQlosaUJBQU8sS0FBS0ksS0FBTCxDQUFXSixLQUZILEVBRVc7QUFDMUJNLG1CQUFTLEtBQUtGLEtBQUwsQ0FBV0UsT0FITCxDQUdhO0FBSGIsU0FBakI7QUFLQSxhQUFLUCxLQUFMLENBQVdtQixNQUFYLENBQWtCdUIsSUFBbEIsQ0FBdUIsU0FBdkIsRUFBa0MsRUFBQ25CLE1BQU1rQixVQUFQLEVBQWxDLEVBTndCLENBTStCO0FBQ3hEOztBQUVERSxpQkFBVyxLQUFLaEIsUUFBTCxDQUFjRixJQUFkLENBQW1CLElBQW5CLENBQVgsRUFBcUMsSUFBckMsRUFWUyxDQVVrQztBQUM1Qzs7O2lDQUVZO0FBQUM7QUFDWixVQUFHLEtBQUtwQixLQUFMLENBQVdZLFNBQVgsSUFBd0IsS0FBS1osS0FBTCxDQUFXSixLQUFYLEtBQXFCLElBQTdDLElBQXFELEtBQUtJLEtBQUwsQ0FBV0gsR0FBWCxLQUFtQixJQUEzRSxFQUFpRjtBQUFDO0FBQ2hGLGFBQUswQyxVQUFMLEdBRCtFLENBQzdEO0FBQ25CO0FBQ0Y7OztpQ0FFWTtBQUNYLFVBQUksS0FBS3ZDLEtBQUwsQ0FBV1ksU0FBZixFQUEwQjtBQUFDO0FBQ3pCLFlBQUk0QixTQUFTLEtBQUs3QyxLQUFMLENBQVc4QyxZQUFYLEVBQWIsQ0FEd0IsQ0FDZTs7QUFFdkMsYUFBS3hCLFFBQUwsQ0FBYyxFQUFDO0FBQ2JwQixlQUFLO0FBRE8sU0FBZDs7QUFJQSxZQUFJMkMsTUFBSixFQUFZO0FBQUM7QUFDWCxlQUFLdkIsUUFBTCxDQUFjO0FBQ1pyQixtQkFBTzRDLE1BREssRUFDRztBQUNmM0MsaUJBQUsyQyxPQUFPekMsUUFGQSxFQUVVO0FBQ3RCUyxzQkFBVSxDQUhFLEVBR0M7QUFDYlAscUJBQVM7QUFKRyxXQUFkO0FBTUQsU0FQRCxNQU9PO0FBQUU7QUFDUCxlQUFLZ0IsUUFBTCxDQUFjO0FBQ1pyQixtQkFBTyxJQURLO0FBRVpDLGlCQUFLLElBRk87QUFHWlcsc0JBQVUsQ0FIRTtBQUlaUCxxQkFBUztBQUNUO0FBTFksV0FBZDtBQU9EO0FBQ0Y7QUFDRjs7OzZCQUlRO0FBQUE7O0FBQUU7QUFDVCxhQUNFO0FBQUE7QUFBQSwwQkFBSyxJQUFHLFlBQVIsRUFBcUIsV0FBVSxpQkFBL0IsaUJBQTJELGtCQUEzRDtBQUNFO0FBQUE7QUFBQSxZQUFLLElBQUcsZ0JBQVIsRUFBeUIsV0FBVSxlQUFuQztBQUNFO0FBQUE7QUFBQSxjQUFLLElBQUcsWUFBUixFQUFxQixlQUFZLFNBQWpDLEVBQTJDLE9BQU0sY0FBakQsRUFBZ0UsU0FBUyxLQUFLeUMsV0FBTCxDQUFpQnRCLElBQWpCLENBQXNCLElBQXRCLENBQXpFO0FBQXNHLDBDQUFNLFdBQVcsS0FBS3BCLEtBQUwsQ0FBV0MsT0FBWCxHQUFxQiwrQkFBckIsR0FBdUQsOEJBQXhFO0FBQXRHLFdBREY7QUFFRTtBQUFBO0FBQUEsY0FBSyxJQUFHLFlBQVIsRUFBcUIsZUFBWSxTQUFqQyxFQUEyQyxPQUFNLGFBQWpELEVBQStELFNBQVMsS0FBSzBDLFVBQUwsQ0FBZ0J2QixJQUFoQixDQUFxQixJQUFyQixDQUF4RTtBQUFvRywwQ0FBTSxXQUFXLEtBQUtwQixLQUFMLENBQVdXLE9BQVgsR0FBcUIsOEJBQXJCLEdBQXNELGdDQUF2RTtBQUFwRyxXQUZGO0FBR0U7QUFBQTtBQUFBLGNBQUssSUFBRyxZQUFSO0FBQXVCLGFBQUMsS0FBS1gsS0FBTCxDQUFXSixLQUFiLEdBQXNCLGdCQUF0QixHQUF5QyxLQUFLSSxLQUFMLENBQVdKLEtBQVgsQ0FBaUJnRDtBQUFoRjtBQUhGLFNBREY7QUFPRTtBQUFBO0FBQUEsWUFBSyxXQUFVLFlBQWY7QUFDRTtBQUFBO0FBQUEsY0FBSyxXQUFVLEtBQWY7QUFDRTtBQUFBO0FBQUEsZ0JBQUssV0FBVSxXQUFmO0FBQ0Usa0NBQUMsV0FBRDtBQUNFLHFCQUFLLHFCQUFVO0FBQUUseUJBQUtaLE1BQUwsR0FBY0EsTUFBZDtBQUFzQixpQkFEekM7QUFFRSxxQkFBSyxLQUFLaEMsS0FBTCxDQUFXSCxHQUZsQjtBQUdFLHVCQUFNLE1BSFI7QUFJRSx3QkFBTyxPQUpUO0FBS0Usd0JBQVEsS0FBS0csS0FBTCxDQUFXQyxPQUxyQixDQUs4QjtBQUw5QixrQkFNRSxTQUFTLEtBQUtELEtBQUwsQ0FBV0UsT0FOdEIsQ0FNK0I7QUFDN0I7QUFQRixrQkFRRSxRQUFRLEtBQUtGLEtBQUwsQ0FBV0csS0FBWCxHQUFtQixDQUFuQixHQUF1QixLQUFLSCxLQUFMLENBQVdJLE1BUjVDO0FBU0Usd0JBQVE7QUFBQSx5QkFBTSxPQUFLYSxRQUFMLENBQWMsRUFBRWYsU0FBUyxJQUFYLEVBQWQsQ0FBTjtBQUFBLGlCQVRWO0FBVUUseUJBQVM7QUFBQSx5QkFBTSxPQUFLZSxRQUFMLENBQWMsRUFBRWYsU0FBUyxLQUFYLEVBQWQsQ0FBTjtBQUFBLGlCQVZYO0FBV0UseUJBQVMsS0FBS3FDLFVBQUwsQ0FBZ0JuQixJQUFoQixDQUFxQixJQUFyQixDQVhYO0FBWUUseUJBQVMsS0FBS21CLFVBQUwsQ0FBZ0JuQixJQUFoQixDQUFxQixJQUFyQixDQVpYO0FBYUUsNEJBQVk7QUFBQSx5QkFBWSxPQUFLSCxRQUFMLENBQWMsRUFBRVYsa0JBQUYsRUFBZCxDQUFaO0FBQUEsaUJBYmQsQ0Fhd0Q7QUFieEQsa0JBY0UsWUFBWSxLQUFLc0MsY0FBTCxDQUFvQnpCLElBQXBCLENBQXlCLElBQXpCO0FBZGQ7QUFERjtBQURGLFdBREY7QUF1QkU7QUFBQTtBQUFBLGNBQUssV0FBVSxLQUFmO0FBQ0U7QUFBQTtBQUFBLGdCQUFLLFdBQVUsV0FBZjtBQUNFO0FBQUE7QUFBQSxrQkFBSyxJQUFHLFNBQVIsRUFBaUIsV0FBVSxVQUEzQjtBQUNFLDZDQUFLLFdBQVUsMENBQWY7QUFDRSx3QkFBSyxhQURQLEVBQ3FCLE9BQU8sRUFBQzBCLE9BQVEsS0FBSzlDLEtBQUwsQ0FBV1EsUUFBWCxHQUFvQixHQUFyQixHQUEwQixHQUFsQyxFQUQ1QjtBQURGO0FBREY7QUFERixXQXZCRjtBQWdDRTtBQUFBO0FBQUEsY0FBSyxJQUFHLFVBQVIsRUFBbUIsV0FBVSxLQUE3QjtBQUNFO0FBQUE7QUFBQSxnQkFBSyxXQUFVLFVBQWY7QUFDRTtBQUFBO0FBQUEsa0JBQUssV0FBVSxXQUFmO0FBQ0U7QUFBQTtBQUFBLG9CQUFRLFdBQVUsd0JBQWxCLEVBQTJDLFNBQVMsS0FBSzBCLFNBQUwsQ0FBZWQsSUFBZixDQUFvQixJQUFwQixDQUFwRDtBQUErRSxnREFBTSxXQUFXLEtBQUtwQixLQUFMLENBQVdFLE9BQVgsR0FBcUIsMkJBQXJCLEdBQW1ELDBCQUFwRTtBQUEvRSxpQkFERjtBQUVFO0FBQUE7QUFBQSxvQkFBUSxXQUFVLHdCQUFsQixFQUEyQyxTQUFTLEtBQUs2QyxJQUFMLENBQVUzQixJQUFWLENBQWUsSUFBZixDQUFwRDtBQUEwRSxnREFBTSxXQUFVLDBCQUFoQjtBQUExRSxpQkFGRjtBQUdHLHVCQUFLUSxLQUFLQyxLQUFMLENBQVksS0FBSzdCLEtBQUwsQ0FBV08sUUFBWCxHQUFvQixLQUFLUCxLQUFMLENBQVdRLFFBQWhDLEdBQTBDLEVBQXJELENBQUwsR0FBOEQsR0FBOUQsR0FBa0UsQ0FBQyxPQUFNb0IsS0FBS0MsS0FBTCxDQUFhLEtBQUs3QixLQUFMLENBQVdPLFFBQVgsR0FBb0IsS0FBS1AsS0FBTCxDQUFXUSxRQUFoQyxHQUEwQ29CLEtBQUtDLEtBQUwsQ0FBWSxLQUFLN0IsS0FBTCxDQUFXTyxRQUFYLEdBQW9CLEtBQUtQLEtBQUwsQ0FBV1EsUUFBaEMsR0FBMEMsRUFBckQsSUFBeUQsRUFBL0csQ0FBUCxFQUE2SHdDLEtBQTdILENBQW1JLENBQUMsQ0FBcEksQ0FIckU7QUFJSSx3QkFBTXBCLEtBQUtDLEtBQUwsQ0FBVyxLQUFLN0IsS0FBTCxDQUFXTyxRQUFYLEdBQW9CLEVBQS9CLENBQU4sR0FBeUMsR0FBekMsSUFBOEMsS0FBS1AsS0FBTCxDQUFXTyxRQUFYLEdBQW9CcUIsS0FBS0MsS0FBTCxDQUFXLEtBQUs3QixLQUFMLENBQVdPLFFBQVgsR0FBb0IsRUFBL0IsSUFBbUMsRUFBckc7QUFKSjtBQURGLGFBREY7QUFVRTtBQUFBO0FBQUEsZ0JBQUssV0FBVSxVQUFmO0FBQ0U7QUFBQTtBQUFBLGtCQUFLLElBQUcsU0FBUixFQUFrQixTQUFTLEtBQUswQyxJQUFMLENBQVU3QixJQUFWLENBQWUsSUFBZixDQUEzQjtBQUNFLDhDQUFNLFdBQVcsS0FBS3BCLEtBQUwsQ0FBV0csS0FBWCxHQUFtQixnQ0FBbkIsR0FBd0QsS0FBS0gsS0FBTCxDQUFXSSxNQUFYLEdBQWtCLEdBQW5CLEdBQTBCLGlDQUExQixHQUE4RCwrQkFBdEk7QUFERixlQURGO0FBSUUsNkNBQU8sSUFBRyxZQUFWLEVBQXVCLE1BQUssT0FBNUIsRUFBb0MsS0FBSyxDQUF6QyxFQUE0QyxLQUFLLENBQWpELEVBQW9ELE1BQUssS0FBekQ7QUFDRSx1QkFBTyxLQUFLSixLQUFMLENBQVdHLEtBQVgsR0FBbUIsQ0FBbkIsR0FBdUIsS0FBS0gsS0FBTCxDQUFXSSxNQUQzQztBQUVFLDBCQUFVLEtBQUs4QyxTQUFMLENBQWU5QixJQUFmLENBQW9CLElBQXBCLENBRlo7QUFKRjtBQVZGO0FBaENGO0FBUEYsT0FERjtBQThERDs7OztFQXpQaUIrQixNQUFNQyxTOztBQTBQekI7O0FBRURDLE9BQU8zRCxLQUFQLEdBQWVBLEtBQWYiLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9DTEFTU0VTXHJcbi8vVGhlIFZpZGVvIGNsYXNzIGNvbnRyb2xscyB0aGUgcGxheWVyXHJcbmNsYXNzIFZpZGVvIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gICAgLy9pZiBhIHZpZGVvIGlzIG5vdCBsb2FkZWQsIHRoZSB1cmwgdmFyaWFibGUgd2lsbCBiZSBudWxsLiBPdGhlcndpc2UsIHVybCB3aWxsIGJlIHNldCB0byB0aGUgbG9hZGVkIHZpZGVvJ3MgdXJsXHJcbiAgICBpZiAoIXRoaXMucHJvcHMudmlkZW8pIHtcclxuICAgICAgdmFyIHVybCA9IG51bGw7XHJcbiAgICAgIHZhciBzZXRQbGF5ID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgdXJsID0gdGhpcy5wcm9wcy52aWRlby52aWRlb3VybDtcclxuICAgICAgdmFyIHNldFBsYXkgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAvL2RlZmF1bHQgYXVkaW8gc3RhdGVzXHJcbiAgICAgIHZpZGVvOiB0aGlzLnByb3BzLnZpZGVvLCAvL3JlZmVyZW5jZSBzdGF0ZSB0aGF0IGFsbG93cyB1cyB0byBhY2Nlc3MgdGhlIHZpZGVvIFVSTCBhcyB3ZWxsIGFzIGl0cyB0aXRsZVxyXG4gICAgICB1cmw6IHVybCwgLy90aGUgdXJsIHRoYXQgdGhlIHJlYWN0IHBsYXllciBjb21wb25lbnQgdXNlcyBmb3IgY3VycmVudCB2aWRlb1xyXG4gICAgICBoaWRlVmlkOiBmYWxzZSwgLy93aGV0aGVyIG9yIG5vdCB0aGUgdmlkZW9zIGFyZSBoaWRkZW4gb24gdGhlIHBhZ2UuIEF1ZGlvIHdpbGwgcGxheSByZWdhcmRsZXNzXHJcbiAgICAgIHBsYXlpbmc6IHNldFBsYXksIC8vSWYgZmFsc2UsIHBsYXliYWNrIGlzIHBhdXNlZC4gQWxzbyBjb250cm9scyBhdXRvbWF0aWMgcGxheWJhY2sgdXBvbiBsb2FkXHJcbiAgICAgIG11dGVkOiBmYWxzZSxcclxuICAgICAgdm9sdW1lOiAxLCAvL3ZvbHVtZSBpcyBtZWFzdXJlIGFzIGEgZGVjaW1hbCBudW1iZXIgYmV0d2VlbiAwIGFuZCAxXHJcbiAgICAgIHBsYXllZDogMCxcclxuICAgICAgbG9hZGVkOiAwLFxyXG4gICAgICBkdXJhdGlvbjogMCwgLy92YWx1ZSBpbiBzZWNvbmRzIHRoYXQgY291bnRzIHRoZSBvdmVyYWxsIGxlbmd0aCBvZiB0aGUgdmlkZW9cclxuICAgICAgcHJvZ3Jlc3M6IDAsIC8vdGhlIGN1cnJlbnQgdGltZSBhdCB3aGljaCB0aGUgdmlkZW8gaXMgcGxheWluZy4gVGhpcyBpcyBhIGRlY2ltYWwgbnVtYmVyIGJldHdlZW4gMCBhbmQgMVxyXG4gICAgICBzZXJ2ZXJEYXRhOiAwLFxyXG4gICAgICBwbGF5YmFja1JhdGU6IDEuMCwgLy90aGUgc3BlZWQgYXQgd2hpY2ggYSB2aWRlbyB3aWxsIGJlIHBsYXllZCwgYmV0d2VlbiAwIGFuZCAyXHJcbiAgICAgIHVzZVN5bmM6IHRydWUsIC8vb3B0aW9uYWwgc3RhdGUgZm9yIHdoZXRoZXIgb3Igbm90IGEgZ2l2ZW4gY29ubmVjdGVkIHVzZXIgd2lsbCByZW1haW4gaW4gc3luYyB3aXRoIHRoZSAnYWRtaW4nXHJcbiAgICAgIGFkbWluRmxhZzogdGhpcy5wcm9wcy5hZG1pbkZsYWcsIC8vc3RhdGUgZ2l2ZW4gdG8gdGhlIGZpcnN0IHBlcnNvbiB0byBjb25uZWN0IHRvIHRoZSBzZXNzaW9uLiBQbGF5YmFjayBzeW5jIGlzIG1hdGNoZWQgdG8gdGhlaXIgY3VycmVudCBwbGF5YmFjayB0aW1lLlxyXG4gICAgICBpbml0aWFsaXplZFN5bmM6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucHJvcHMuc29ja2V0Lm9uKCdyZWNUaW1lJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VydmVyRGF0YTogZGF0YS50aW1lfSk7XHJcbiAgICAgIHRoaXMudmVyaWZ5U3luYygpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvL1doZW4gdGhlIHNldEFkbWluRmxhZyBldmVudCBvY2N1cnMsIHRoZSBzZXRBZG1pbiBmbGFnIGlzIGFsc28gYXNzaWduZWQgaW4gdGhlIGNvbXBvbmVudCdzIHN0YXRlc1xyXG4gICAgdGhpcy5wcm9wcy5zb2NrZXQub24oJ3NldEFkbWluRmxhZycsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2FkbWluRmxhZzogdHJ1ZX0pO1xyXG5cclxuICAgICAgLy9pZiB0aGUgdXNlciBpcyB0aGUgYWRtaW4gYW5kIHRoZWlyIFN5bmMgaGFzbid0IGFscmVhZHkgYmVlbiBpbml0aWFsaXplZCwgaXQgd2lsbCBmb3JjZSB0aGF0IGluaXRpYWxpenRpb25cclxuICAgICAgLy90aGlzIGlzIGltcG9ydGFudCBmb3Igd2hlbiBhZG1pbiByb2xlcyBhcmUgaGFuZGVkIG9mZiwgc3VjaCBhcyB3aGVuIGFuIGFkbWluIGRpc2Nvbm5lY3RzXHJcbiAgICAgIGlmKHRoaXMuc3RhdGUuYWRtaW5GbGFnICYmICF0aGlzLnN0YXRlLmluaXRpYWxpemVkU3luYykge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgaW5pdGlhbGl6ZWRTeW5jOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zdGFydFZpZGVvKCk7Ly9lbnN1cmVzIHRoYXQgdGhlIHZpZGVvIHBsYXliYWNrIGF1dG9tYXRpY2FsbHkgYmVnaW5zXHJcbiAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5lbWl0RGF0YSgpO1xyXG4gIH1cclxuXHJcbiAgLy9BVURJTyBDT05UUk9MTEVSU1xyXG4gIC8vc3RvcCBidXR0b24ncyBjb250cm9sc1xyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLnNldFN0YXRlKHsgdXJsOiBudWxsLCBwbGF5aW5nOiBmYWxzZSwgcHJvZ3Jlc3M6IDAgfSk7XHJcbiAgfVxyXG4gIC8vdG9nZ2xlIGZvciBwbGF5aW5nIG9yIHBhdXNlXHJcbiAgcGxheVBhdXNlKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUudXJsKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBwbGF5aW5nOiAhdGhpcy5zdGF0ZS5wbGF5aW5nIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCF0aGlzLnN0YXRlLnZpZGVvICYmIHRoaXMuc3RhdGUuc2VydmVyRGF0YS52aWRlbykge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgdmlkZW86IHRoaXMuc3RhdGUuc2VydmVyRGF0YS52aWRlbyxcclxuICAgICAgICAgIHVybDogdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnZpZGVvLnZpZGVvdXJsLFxyXG4gICAgICAgICAgcGxheWluZzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgLy9pZiB0aGUgdmlkZW8gaGFkIGJlZW4gc3RvcHBlZCBwcmV2aW91cywgdGhpcyB3aWxsIHJlc3VtZSBwbGF5YmFjayBvZiB0aGF0IGZyb20gdGhlIGJlZ2lubmluZ1xyXG4gICAgICAgICAgdXJsOiB0aGlzLnN0YXRlLnZpZGVvLnZpZGVvdXJsLFxyXG4gICAgICAgICAgcGxheWluZzogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vdG9nZ2xlcyB0aGUgbXV0ZSBzdGF0ZVxyXG4gIG11dGUoKSB7XHJcbiAgICB0aGlzLnNldFN0YXRlKHsgbXV0ZWQ6ICF0aGlzLnN0YXRlLm11dGVkIH0pO1xyXG4gIH1cclxuICAvL3NldHMgdGhlIHZvbHVtZSBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIHNsaWRlci4gU2VlIHRoZSBIVE1MIGNvbnRyb2xzIGluIHRoZSBKU1ggYmVsb3dcclxuICBzZXRWb2x1bWUodm9sKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS5tdXRlZCkge3RoaXMuc2V0U3RhdGUoeyBtdXRlZDogZmFsc2UgfSl9O1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHZvbHVtZTogcGFyc2VGbG9hdCh2b2wudGFyZ2V0LnZhbHVlKSB9KTtcclxuICB9XHJcbiAgLy90b2dnbGVzIHZpZGVvIHZpc2liaWxpdHkgb24gdGhlIHBhZ2UuIEF1ZGlvIHBsYXlzIHJlZ2FyZGxlc3NcclxuICB0b2dnbGVWaWRlbygpIHtcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBoaWRlVmlkOiAhdGhpcy5zdGF0ZS5oaWRlVmlkIH0pO1xyXG4gIH1cclxuXHJcbiAgLy9vcHRpb25hbCB0b2dnbGUgc3luYyBidXR0b24uIFdoZW4gdXNlU3luYyBpcyBmYWxzZSwgcGxheWJhY2sgaWdub3JlcyB0aGUgc3RhdGUgb2YgdGhlIGN1cnJlbnQgYWRtaW5cclxuICB0b2dnbGVTeW5jKCkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHVzZVN5bmM6ICF0aGlzLnN0YXRlLnVzZVN5bmMgfSk7XHJcbiAgfVxyXG5cclxuICAvL3VwZGF0ZXMgdGhlIGN1cnJlbnQgcHJvZ3Jlc3MgdGltZVxyXG4gIHVwZGF0ZVByb2dyZXNzKHRpbWUpIHtcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBwcm9ncmVzczogdGltZS5wbGF5ZWQgfSk7XHJcbiAgfVxyXG5cclxuICAvL21ldGhvZCB0byBjb21wYXJlIHN5bmNyb25pemF0aW9uIG9mIGFsbCBjb25uZWN0ZWQgdXNlcnNcclxuICB2ZXJpZnlTeW5jKCkge1xyXG4gICAgaWYgKCF0aGlzLnN0YXRlLmFkbWluRmxhZyAmJiB0aGlzLnN0YXRlLnVzZVN5bmMpIHsgLy9pZiB1c2VyIGlzIE5PVCB0aGUgYWRtaW4gYW5kIHRoZSB1c2VTeW5jIGJ1dHRvbiBpcyBPTlxyXG4gICAgICB2YXIgY2xpZW50VGltZSA9IE1hdGguZmxvb3IodGhpcy5zdGF0ZS5wcm9ncmVzcyp0aGlzLnN0YXRlLmR1cmF0aW9uKTsvL3ZhcmlhYmxlIHRvIGhvbGQgdGhlIFVTRVIncyBwbGF5YmFjayBwcm9ncmVzcyAoaW4gdGhlIGZvcm0gb2Ygc2Vjb25kcywgcmF0aGVyIHRoYW4gZGVjaW1hbHMpXHJcbiAgICAgIHZhciBzZXJ2ZXJUaW1lID0gTWF0aC5mbG9vcih0aGlzLnN0YXRlLnNlcnZlckRhdGEucHJvZ3Jlc3MqdGhpcy5zdGF0ZS5kdXJhdGlvbik7Ly92YXJpYWJsZSB0byBob2xkIHRoZSBTRVJWRVIncyBwbGF5YmFjayBwcm9ncmVzcyAoaW4gdGhlIGZvcm0gb2Ygc2Vjb25kcywgcmF0aGVyIHRoYW4gZGVjaW1hbHMpXHJcbiAgICAgIGlmIChNYXRoLmFicyhjbGllbnRUaW1lIC0gc2VydmVyVGltZSkgPj0gNCkgey8vdGhpcyB3aWxsIGNoZWNrIGlmIGEgY29ubmVjdGVkIHVzZXIgaXMgYWJvdmUgb3IgYmVsb3cgNCBzZWNvbmRzIGF3YXkgZnJvbSB0aGUgYWRtaW4ncyBjdXJyZW50IHBsYXliYWNrIHRpbWUsIGFuZCBpZiB0aGV5IGFyZS4uLlxyXG4gICAgICAgIHRoaXMucGxheWVyLnNlZWtUbyh0aGlzLnN0YXRlLnNlcnZlckRhdGEucHJvZ3Jlc3MpOyAvL2ZvcmNlIHRoZSB1c2VyJ3MgcGxheWJhY2sgdGltZSB0byBtYXRjaCB0aGUgYWRtaW4ncyBwbGF5YmFjayB0aW1lXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Ly9zZXRzIHRoZSAncHJvZ3Jlc3MnIHN0YXRlIHRvIG1hdGNoIHRoZSByZWNlbnRseSBhZGp1c3RlZCBwbGF5YmFjayB0aW1lXHJcbiAgICAgICAgICBwcm9ncmVzczogdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnByb2dyZXNzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgLy9UaGUgZm9sbG93IGNvZGUgd2lsbCBmb3JjZSBzeW5jaHJvbml6YXRpb24gb2YgUGxheWVyIGNvbXBvbmVudCBzdGF0ZXNcclxuICAgICAgaWYgKHRoaXMuc3RhdGUucGxheWluZyAhPT0gdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnBsYXlpbmcpIHsvL2lmIHRoZSB1c2VyJ3MgJ3BsYXlpbmcnIGRvZXMgbm90IG1hdGNoIHRoZSBhZG1pbidzICdwbGF5aW5nJyBzdGF0ZSwgdG9nZ2xlcyBwbGF5UGF1c2Ugb24gdGhlIHZpZGVvXHJcbiAgICAgICAgdGhpcy5wbGF5UGF1c2UoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5zdGF0ZS52aWRlbyAmJiB0aGlzLnN0YXRlLnNlcnZlckRhdGEudmlkZW8pIHsvL2lmIHRoZSB1c2VyJ3MgbG9hZGVkIHZpZGVvIGRvZXNuJ3QgbWF0Y2ggdGhlIGFkbWluJ3MgdmlkZW8sIGZvcmNlIGl0IHRvIG1hdGNoXHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmlkZW8uaWQgIT09IHRoaXMuc3RhdGUuc2VydmVyRGF0YS52aWRlby5pZCkge1xyXG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgIHZpZGVvOiB0aGlzLnN0YXRlLnNlcnZlckRhdGEudmlkZW8sXHJcbiAgICAgICAgICAgIHVybDogdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnZpZGVvLnZpZGVvdXJsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUudmlkZW8gJiYgdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnZpZGVvKSB7Ly9pZiBhIHZpZGVvIGhhZCBub3QgYmVlbiBsb2FkZWQgZm9yIHRoZSB1c2VyLCBmb3JjZSB0aGUgY3VycmVudCB2aWRlbyB0aGF0IHRoZSBhZG1pbiBoYXMgbG9hZGVkIHRvIGJlY29tZSBsb2FkZWQgZm9yIHRoZSB1c2VyXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICB2aWRlbzogdGhpcy5zdGF0ZS5zZXJ2ZXJEYXRhLnZpZGVvLFxyXG4gICAgICAgICAgdXJsOiB0aGlzLnN0YXRlLnNlcnZlckRhdGEudmlkZW8udmlkZW91cmxcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHsvL2lmIG5vIG90aGVyIHN5bmNyb25pemF0aW9uIGlzIG5lY2Vzc2FyeSwgc2V0IHZpZGVvIGFuZCB1cmwgdG8gbnVsbCwgcmVuZGVyaW5nIGFuIGVtcHR5IHZpZGVvIGZyYW1lXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICB2aWRlbzogbnVsbCxcclxuICAgICAgICAgIHVybDogbnVsbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBlbWl0RGF0YSgpIHsvL2lmIHRoZSB1c2VyIGlzIHRoZSBhZG1pbiwgZW1pdCB0aGUgZm9sbG93aW5nIGRhdGFcclxuICAgIGlmICh0aGlzLnN0YXRlLmFkbWluRmxhZykge1xyXG4gICAgICB2YXIgcGxheWVyRGF0YSA9IHtcclxuICAgICAgICBwcm9ncmVzczogdGhpcy5zdGF0ZS5wcm9ncmVzcywgLy93aGF0IHRoZSBjdXJyZW50IHBsYXliYWNrIHRpbWUgaXNcclxuICAgICAgICB2aWRlbzogdGhpcy5zdGF0ZS52aWRlbywgIC8vd2hhdCB0aGUgY3VycmVudCB2aWRlbyBwbGF5aW5nIHNob3VsZCBiZVxyXG4gICAgICAgIHBsYXlpbmc6IHRoaXMuc3RhdGUucGxheWluZyAvL3doYXQgdGhlIGN1cnJlbnQgcGxheWluZyAnc3RhdGUnIChwYXVzZWQgb3IgcGxheWluZykgaXNcclxuICAgICAgfTtcclxuICAgICAgdGhpcy5wcm9wcy5zb2NrZXQuZW1pdCgnc2V0VGltZScsIHt0aW1lOiBwbGF5ZXJEYXRhfSk7IC8vZW1pdHMgdGhlIGRhdGEgdG8gYWxsIGNvbm5lY3RlZCB1c2VycyB1c2luZyBzb2NrZXRcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KHRoaXMuZW1pdERhdGEuYmluZCh0aGlzKSwgMTAwMCk7Ly9yZXBlYXQgdGhpcyBtZXRob2QgZXZlcnkgMSBzZWNvbmRcclxuICB9XHJcblxyXG4gIHN0YXJ0VmlkZW8oKSB7Ly9tZXRob2QgdG8gYmUgcnVuIHdoZW4gYSBhdHRlbXB0aW5nIHRvIHN0YXJ0IGEgdmlkZW9cclxuICAgIGlmKHRoaXMuc3RhdGUuYWRtaW5GbGFnICYmIHRoaXMuc3RhdGUudmlkZW8gPT09IG51bGwgJiYgdGhpcy5zdGF0ZS51cmwgPT09IG51bGwpIHsvL2lmIHRoZSB1c2VyIGlzIGFkbWluIGFuZCB0aGVyZSBpc24ndCBhIHZpZGVvIGxvYWRlZCBhcyB3ZWxsIGFzIG5vIHVybCBoYXMgYmVlbiBhc3NpZ25lZC4uLlxyXG4gICAgICB0aGlzLm9uVmlkZW9FbmQoKTsvL3J1biB0aGUgdmlkZW8gZW5kIG1ldGhvZCwgZGV0YWlsZWQgYmVsb3dcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uVmlkZW9FbmQoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS5hZG1pbkZsYWcpIHsvL2lmIHRoZSB1c2VyIGlzIHRoZSBhZG1pbi4uLlxyXG4gICAgICB2YXIgbmV3VmlkID0gdGhpcy5wcm9wcy5hZHZhbmNlUXVldWUoKTsvL3NldHMgdGhlIG5ld1ZpZCB2YXJpYWJsZSB0byB0aGUgbmV4dCB2aWRlbyBpbiB0aGUgcXVldWVcclxuXHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoey8vY2xlYXJzIHRoZSBsYXN0IHVybCB0aGF0IHdhcyB1c2VkXHJcbiAgICAgICAgdXJsOiAnJ1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChuZXdWaWQpIHsvL2lmIGEgbmV3IHZpZGVvIGhhcyBiZWVuIHNldC4uLlxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgdmlkZW86IG5ld1ZpZCwgLy9zZXQgdGhlIG5ldyB2aWRlbydzIGRhdGFcclxuICAgICAgICAgIHVybDogbmV3VmlkLnZpZGVvdXJsLCAvL3NldCB0aGUgbmV3IHZpZGVvJ3MgVVJMXHJcbiAgICAgICAgICBwcm9ncmVzczogMCwgLy9zZXQgaXRzIHBsYXliYWNrIHRpbWUgdG8gdGhlIHN0YXJ0ICh6ZXJvKVxyXG4gICAgICAgICAgaGlkZVZpZDogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHsgLy9vcnRoZXJ3aXNlIHVzZSBlbXB0eSBkYXRhLCBhcyBubyB2aWRlbyBleGlzdHMgdG8gYmUgcGxheWVkXHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICB2aWRlbzogbnVsbCxcclxuICAgICAgICAgIHVybDogbnVsbCxcclxuICAgICAgICAgIHByb2dyZXNzOiAwLFxyXG4gICAgICAgICAgaGlkZVZpZDogdHJ1ZVxyXG4gICAgICAgICAgLy8gcGxheWluZzogc2V0UGxheVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcblxyXG4gIHJlbmRlcigpIHsgLy9yZW5kZXIgdGhlIHZpZGVvIHBhbmVsIHVzaW5nIGJvb3RzdHJhcFxyXG4gICAgcmV0dXJuIChcclxuICAgICAgPGRpdiBpZD0nYXVkaW9QYW5lbCcgY2xhc3NOYW1lPSdjb250YWluZXItZmx1aWQnIGNsYXNzTmFtZT1cInBhbmVsIHBhbmVsLWluZm9cIj5cclxuICAgICAgICA8ZGl2IGlkPSdwbHlyUG5sSGVhZGluZycgY2xhc3NOYW1lPVwicGFuZWwtaGVhZGluZ1wiPlxyXG4gICAgICAgICAgPGRpdiBpZD0naGlkZVZpZEJ0bicgZGF0YS10b2dnbGU9J3Rvb2x0aXAnIHRpdGxlPSdUb2dnbGUgdmlkZW8nIG9uQ2xpY2s9e3RoaXMudG9nZ2xlVmlkZW8uYmluZCh0aGlzKX0+PHNwYW4gY2xhc3NOYW1lPXt0aGlzLnN0YXRlLmhpZGVWaWQgPyAnZ2x5cGhpY29uIGdseXBoaWNvbi1leWUtY2xvc2UnIDogJ2dseXBoaWNvbiBnbHlwaGljb24tZXllLW9wZW4nfT48L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IGlkPSd1c2VTeW5jQnRuJyBkYXRhLXRvZ2dsZT0ndG9vbHRpcCcgdGl0bGU9J1RvZ2dsZSBzeW5jJyBvbkNsaWNrPXt0aGlzLnRvZ2dsZVN5bmMuYmluZCh0aGlzKX0+PHNwYW4gY2xhc3NOYW1lPXt0aGlzLnN0YXRlLnVzZVN5bmMgPyAnZ2x5cGhpY29uIGdseXBoaWNvbi10cmFuc2ZlcicgOiAnZ2x5cGhpY29uIGdseXBoaWNvbi1oZWFkcGhvbmVzJ30+PC9zcGFuPjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBpZD0nYXVkaW9UaXRsZSc+eyghdGhpcy5zdGF0ZS52aWRlbykgPyAnRmluZCBhIGJvb2dpZSEnIDogdGhpcy5zdGF0ZS52aWRlby50aXRsZX08L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1ib2R5XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1tZC0xMic+XHJcbiAgICAgICAgICAgICAgPFJlYWN0UGxheWVyXHJcbiAgICAgICAgICAgICAgICByZWY9e3BsYXllciA9PiB7IHRoaXMucGxheWVyID0gcGxheWVyIH0gfVxyXG4gICAgICAgICAgICAgICAgdXJsPXt0aGlzLnN0YXRlLnVybH1cclxuICAgICAgICAgICAgICAgIHdpZHRoPScxMDAlJ1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0PSc0ODBweCdcclxuICAgICAgICAgICAgICAgIGhpZGRlbj17dGhpcy5zdGF0ZS5oaWRlVmlkfSAvL2hpZGVzIHRoZSB2aWRlbyBmcmFtZSBieSBkZWZhdWx0OyBjYW4gYmUgdG9nZ2xlZFxyXG4gICAgICAgICAgICAgICAgcGxheWluZz17dGhpcy5zdGF0ZS5wbGF5aW5nfSAvL2NvbnRyb2xzIHBsYXliYWNrXHJcbiAgICAgICAgICAgICAgICAvL3ZvbHVtZT17dGhpcy5zdGF0ZS52b2x1bWV9XHJcbiAgICAgICAgICAgICAgICB2b2x1bWU9e3RoaXMuc3RhdGUubXV0ZWQgPyAwIDogdGhpcy5zdGF0ZS52b2x1bWV9XHJcbiAgICAgICAgICAgICAgICBvblBsYXk9eygpID0+IHRoaXMuc2V0U3RhdGUoeyBwbGF5aW5nOiB0cnVlIH0pIH1cclxuICAgICAgICAgICAgICAgIG9uUGF1c2U9eygpID0+IHRoaXMuc2V0U3RhdGUoeyBwbGF5aW5nOiBmYWxzZX0pIH1cclxuICAgICAgICAgICAgICAgIG9uRW5kZWQ9e3RoaXMub25WaWRlb0VuZC5iaW5kKHRoaXMpfVxyXG4gICAgICAgICAgICAgICAgb25FcnJvcj17dGhpcy5vblZpZGVvRW5kLmJpbmQodGhpcyl9XHJcbiAgICAgICAgICAgICAgICBvbkR1cmF0aW9uPXtkdXJhdGlvbiA9PiB0aGlzLnNldFN0YXRlKHsgZHVyYXRpb24gfSkgfSAvL2xvZ3MgdGhlIG92ZXJhbGwgdmlkZW8gZHVyYXRpb25cclxuICAgICAgICAgICAgICAgIG9uUHJvZ3Jlc3M9e3RoaXMudXBkYXRlUHJvZ3Jlc3MuYmluZCh0aGlzKX1cclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC1tZC0xMic+XHJcbiAgICAgICAgICAgICAgPGRpdiBpZD0ncHJvZ0JhcidjbGFzc05hbWU9J3Byb2dyZXNzJz5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLXN0cmlwZWQgYWN0aXZlJ1xyXG4gICAgICAgICAgICAgICAgICByb2xlPSdwcm9ncmVzc2Jhcicgc3R5bGU9e3t3aWR0aDogKHRoaXMuc3RhdGUucHJvZ3Jlc3MqMTAwKSsnJSd9fT5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBpZD0nYWxsQ3RybHMnIGNsYXNzTmFtZT0ncm93Jz5cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvbC14cy05Jz5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndmlkZW9DdHJsJz5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1kZWZhdWx0JyBvbkNsaWNrPXt0aGlzLnBsYXlQYXVzZS5iaW5kKHRoaXMpfT48c3BhbiBjbGFzc05hbWU9e3RoaXMuc3RhdGUucGxheWluZyA/ICdnbHlwaGljb24gZ2x5cGhpY29uLXBhdXNlJyA6ICdnbHlwaGljb24gZ2x5cGhpY29uLXBsYXknfT48L3NwYW4+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1zbSBidG4tZGVmYXVsdCcgb25DbGljaz17dGhpcy5zdG9wLmJpbmQodGhpcyl9PjxzcGFuIGNsYXNzTmFtZT0nZ2x5cGhpY29uIGdseXBoaWNvbi1zdG9wJz48L3NwYW4+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICB7JyAgJytNYXRoLmZsb29yKCh0aGlzLnN0YXRlLmR1cmF0aW9uKnRoaXMuc3RhdGUucHJvZ3Jlc3MpLzYwKSsnOicrKCcwMCcrKE1hdGguZmxvb3IoKCh0aGlzLnN0YXRlLmR1cmF0aW9uKnRoaXMuc3RhdGUucHJvZ3Jlc3MpLU1hdGguZmxvb3IoKHRoaXMuc3RhdGUuZHVyYXRpb24qdGhpcy5zdGF0ZS5wcm9ncmVzcykvNjApKjYwKSkpKS5zbGljZSgtMil9XHJcbiAgICAgICAgICAgICAgICB7ICcgLyAnK01hdGguZmxvb3IodGhpcy5zdGF0ZS5kdXJhdGlvbi82MCkrJzonKyh0aGlzLnN0YXRlLmR1cmF0aW9uLU1hdGguZmxvb3IodGhpcy5zdGF0ZS5kdXJhdGlvbi82MCkqNjApIH1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY29sLXhzLTMnPlxyXG4gICAgICAgICAgICAgIDxkaXYgaWQ9J211dGVCdG4nIG9uQ2xpY2s9e3RoaXMubXV0ZS5iaW5kKHRoaXMpfT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17dGhpcy5zdGF0ZS5tdXRlZCA/ICdnbHlwaGljb24gZ2x5cGhpY29uLXZvbHVtZS1vZmYnIDogKCh0aGlzLnN0YXRlLnZvbHVtZTwwLjUpID8gJ2dseXBoaWNvbiBnbHlwaGljb24tdm9sdW1lLWRvd24nIDogJ2dseXBoaWNvbiBnbHlwaGljb24tdm9sdW1lLXVwJyApIH0+PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxpbnB1dCBpZD0ndm9sdW1lQ3RybCcgdHlwZT0ncmFuZ2UnIG1pbj17MH0gbWF4PXsxfSBzdGVwPSdhbnknXHJcbiAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5tdXRlZCA/IDAgOiB0aGlzLnN0YXRlLnZvbHVtZX1cclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnNldFZvbHVtZS5iaW5kKHRoaXMpfSAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG5cclxud2luZG93LlZpZGVvID0gVmlkZW87Il19