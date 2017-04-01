//CLASSES
//The Video class controlls the player
class Video extends React.Component {
  constructor(props) {
    super(props);
    //if a video is not loaded, the url variable will be null. Otherwise, url will be set to the loaded video's url
    if (!this.props.video) {
      var url = null;
      var setPlay = false;
    } else {
      var url = this.props.video.videourl;
      var setPlay = true;
    }

    this.state = {
    //default audio states
      video: this.props.video, //reference state that allows us to access the video URL as well as its title
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
      adminFlag: this.props.adminFlag, //state given to the first person to connect to the session. Playback sync is matched to their current playback time.
      initializedSync: false
    };

    this.props.socket.on('recTime', function (data) {
      this.setState({serverData: data.time});
      this.verifySync();
    }.bind(this));

    //When the setAdminFlag event occurs, the setAdmin flag is also assigned in the component's states
    this.props.socket.on('setAdminFlag', function (data) {
      this.setState({adminFlag: true});

      //if the user is the admin and their Sync hasn't already been initialized, it will force that initializtion
      //this is important for when admin roles are handed off, such as when an admin disconnects
      if(this.state.adminFlag && !this.state.initializedSync) {
        this.setState({
          initializedSync: true
        });
        this.startVideo();//ensures that the video playback automatically begins
      }
    }.bind(this));

    this.emitData();
  }

  //AUDIO CONTROLLERS
  //stop button's controls
  stop() {
    this.setState({ url: null, playing: false, progress: 0 });
  }
  //toggle for playing or pause
  playPause() {
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
  mute() {
    this.setState({ muted: !this.state.muted });
  }
  //sets the volume based on the position of the slider. See the HTML controls in the JSX below
  setVolume(vol) {
    if (this.state.muted) {this.setState({ muted: false })};
    this.setState({ volume: parseFloat(vol.target.value) });
  }
  //toggles video visibility on the page. Audio plays regardless
  toggleVideo() {
    this.setState({ hideVid: !this.state.hideVid });
  }

  //optional toggle sync button. When useSync is false, playback ignores the state of the current admin
  toggleSync() {
    this.setState({ useSync: !this.state.useSync });
  }

  //updates the current progress time
  updateProgress(time) {
    this.setState({ progress: time.played });
  }

  //method to compare syncronization of all connected users
  verifySync() {
    if (!this.state.adminFlag && this.state.useSync) { //if user is NOT the admin and the useSync button is ON
      var clientTime = Math.floor(this.state.progress*this.state.duration);//variable to hold the USER's playback progress (in the form of seconds, rather than decimals)
      var serverTime = Math.floor(this.state.serverData.progress*this.state.duration);//variable to hold the SERVER's playback progress (in the form of seconds, rather than decimals)
      if (Math.abs(clientTime - serverTime) >= 4) {//this will check if a connected user is above or below 4 seconds away from the admin's current playback time, and if they are...
        this.player.seekTo(this.state.serverData.progress); //force the user's playback time to match the admin's playback time
        this.setState({//sets the 'progress' state to match the recently adjusted playback time
          progress: this.state.serverData.progress
        });
      }
      //The follow code will force synchronization of Player component states
      if (this.state.playing !== this.state.serverData.playing) {//if the user's 'playing' does not match the admin's 'playing' state, toggles playPause on the video
        this.playPause();
      }
      if (this.state.video && this.state.serverData.video) {//if the user's loaded video doesn't match the admin's video, force it to match
        if (this.state.video.id !== this.state.serverData.video.id) {
          this.setState({
            video: this.state.serverData.video,
            url: this.state.serverData.video.videourl
          });
        }
      } else if (!this.state.video && this.state.serverData.video) {//if a video had not been loaded for the user, force the current video that the admin has loaded to become loaded for the user
        this.setState({
          video: this.state.serverData.video,
          url: this.state.serverData.video.videourl
        });
      } else {//if no other syncronization is necessary, set video and url to null, rendering an empty video frame
        this.setState({
          video: null,
          url: null
        });
      }
    }
  }

  emitData() {//if the user is the admin, emit the following data
    if (this.state.adminFlag) {
      var playerData = {
        progress: this.state.progress, //what the current playback time is
        video: this.state.video,  //what the current video playing should be
        playing: this.state.playing //what the current playing 'state' (paused or playing) is
      };
      this.props.socket.emit('setTime', {time: playerData}); //emits the data to all connected users using socket
    }

    setTimeout(this.emitData.bind(this), 1000);//repeat this method every 1 second
  }

  startVideo() {//method to be run when a attempting to start a video
    if(this.state.adminFlag && this.state.video === null && this.state.url === null) {//if the user is admin and there isn't a video loaded as well as no url has been assigned...
      this.onVideoEnd();//run the video end method, detailed below
    }
  }

  onVideoEnd() {
    if (this.state.adminFlag) {//if the user is the admin...
      var newVid = this.props.advanceQueue();//sets the newVid variable to the next video in the queue

      this.setState({//clears the last url that was used
        url: ''
      });

      if (newVid) {//if a new video has been set...
        this.setState({
          video: newVid, //set the new video's data
          url: newVid.videourl, //set the new video's URL
          progress: 0, //set its playback time to the start (zero)
          hideVid: false
        });
      } else { //ortherwise use empty data, as no video exists to be played
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



  render() { //render the video panel using bootstrap
    return (
      <div id='audioPanel' className='container-fluid' className="panel panel-info">
        <div id='plyrPnlHeading' className="panel-heading">
          <div id='hideVidBtn' data-toggle='tooltip' title='Toggle video' onClick={this.toggleVideo.bind(this)}><span className={this.state.hideVid ? 'glyphicon glyphicon-eye-close' : 'glyphicon glyphicon-eye-open'}></span></div>
          <div id='useSyncBtn' data-toggle='tooltip' title='Toggle sync' onClick={this.toggleSync.bind(this)}><span className={this.state.useSync ? 'glyphicon glyphicon-transfer' : 'glyphicon glyphicon-headphones'}></span></div>
          <div id='audioTitle'>{(!this.state.video) ? 'Find a boogie!' : this.state.video.title}</div>
        </div>

        <div className="panel-body">
          <div className='row'>
            <div className='col-md-12'>
              <ReactPlayer
                ref={player => { this.player = player } }
                url={this.state.url}
                width='100%'
                height='480px'
                hidden={this.state.hideVid} //hides the video frame by default; can be toggled
                playing={this.state.playing} //controls playback
                //volume={this.state.volume}
                volume={this.state.muted ? 0 : this.state.volume}
                onPlay={() => this.setState({ playing: true }) }
                onPause={() => this.setState({ playing: false}) }
                onEnded={this.onVideoEnd.bind(this)}
                onError={this.onVideoEnd.bind(this)}
                onDuration={duration => this.setState({ duration }) } //logs the overall video duration
                onProgress={this.updateProgress.bind(this)}
              />
            </div>
          </div>


          <div id='allCtrls' className='row'>
            <div className='col-xs-8'>
              <div className='videoCtrl'>
                <button className='btn btn-sm btn-default' onClick={this.playPause.bind(this)} disabled={!this.state.video}><span className={this.state.playing ? 'glyphicon glyphicon-pause' : 'glyphicon glyphicon-play'}></span></button>
                <button className='btn btn-sm btn-default' onClick={this.stop.bind(this)}><span className='glyphicon glyphicon-stop'></span></button>
              </div>

              <div id='progBar'className='progress'>
                <div className='progress-bar progress-bar-striped active'
                  role='progressbar' style={{width: (this.state.progress*100)+'%'}}>
                </div>
              </div>
            </div>
          </div>
          <div id='allCtrls' className='row'>
            <div className='col-xs-9'>
              <div className='videoCtrl'>
                <button className='btn btn-sm btn-default' onClick={this.playPause.bind(this)}><span className={this.state.playing ? 'glyphicon glyphicon-pause' : 'glyphicon glyphicon-play'}></span></button>
                <button className='btn btn-sm btn-default' onClick={this.stop.bind(this)}><span className='glyphicon glyphicon-stop'></span></button>
                {'  '+Math.floor((this.state.duration*this.state.progress)/60)+':'+('00'+(Math.floor(((this.state.duration*this.state.progress)-Math.floor((this.state.duration*this.state.progress)/60)*60)))).slice(-2)}
                { ' / '+Math.floor(this.state.duration/60)+':'+(this.state.duration-Math.floor(this.state.duration/60)*60) }
              </div>
            </div>

            <div className='col-xs-3'>
              <div id='muteBtn' onClick={this.mute.bind(this)}>
                <span className={this.state.muted ? 'glyphicon glyphicon-volume-off' : ((this.state.volume<0.5) ? 'glyphicon glyphicon-volume-down' : 'glyphicon glyphicon-volume-up' ) }></span>
              </div>
              <input id='volumeCtrl' type='range' min={0} max={1} step='any'
                value={this.state.muted ? 0 : this.state.volume}
                onChange={this.setVolume.bind(this)} />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

window.Video = Video;