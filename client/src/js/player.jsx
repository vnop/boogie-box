//CLASSES
//The Video class controlls the player
class Video extends React.Component {
  constructor(props) {
    super(props);

    //if a video is not loaded, the url variable will be null. Otherwise, url will be set to the loaded video's url
    if (!this.props.video) {
      var url = null;
    } else {
      var url = this.props.video.videourl;
    }

    this.state = {//default audio states
      video: this.props.video,
      url: url,
      hideVid: false,
      playing: true,
      muted: false,
      volume: 1,
      played: 0,
      loaded: 0,
      duration: 0,
      progress: 0,
      serverData: 0,
      playbackRate: 1.0,
      useSync: true,
      adminFlag: this.props.adminFlag,
      initializedSync: false
    };

    this.props.socket.on('recTime', function (data) {
      // console.log(`data --> ${JSON.stringify(data)}`);
      this.setState({
        serverData: data.time
      });

      this.verifySync();

      // if(!this.state.playing) {
      //   this.playPause();
      // }

      // if(!this.state.adminFlag && !this.state.initializedSync) {
      //   console.log('changing stuff *****************************************');
      //   this.player.seekTo(this.state.serverData.progress);
      //   this.setState({
      //     video: this.state.serverData.video,
      //     url: this.state.serverData.video.videourl,
      //     progress: this.state.serverData.progress,
      //     playing: this.state.serverData.playing,
      //     initializedSync: true
      //   });
      // }
    }.bind(this));

    this.props.socket.on('setAdminFlag', function (data) {
      console.log('adminFlag set to: ', data);
      this.setState({
        adminFlag: true
      });

      if(this.state.adminFlag && !this.state.initializedSync) {
        this.setState({
          initializedSync: true
        });
        this.startVideo();
      }
    }.bind(this));

    this.emitData();
  }

  //Audio Controllers
  stop() {
    this.setState({ url: null, playing: false, progress: 0 });
  }
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
          url: this.state.video.videourl,
          playing: true
        });
      }
    }
  }
  mute() {
    this.setState({ muted: !this.state.muted });
  }
  setVolume(vol) {
    if (this.state.muted) {this.setState({ muted: false })};
    this.setState({ volume: parseFloat(vol.target.value) });
  }
  toggleVideo() {
    this.setState({ hideVid: !this.state.hideVid });
  }

  toggleSync() {
    this.setState({ useSync: !this.state.useSync });
  }

  updateProgress(time) {
    this.setState({ progress: time.played });
  }

  verifySync() {
    if (!this.state.adminFlag && this.state.useSync) {
      var clientTime = Math.floor(this.state.progress*this.state.duration);
      var serverTime = Math.floor(this.state.serverData.progress*this.state.duration);
      if (Math.abs(clientTime - serverTime) >= 4) {
        this.player.seekTo(this.state.serverData.progress);
        this.setState({
          progress: this.state.serverData.progress
        });
      }
      if (this.state.playing !== this.state.serverData.playing) {
        this.playPause();
      }
      if (this.state.video && this.state.serverData.video) {
        if (this.state.video.id !== this.state.serverData.video.id) {
          this.setState({
            video: this.state.serverData.video,
            url: this.state.serverData.video.videourl
          });
        }
      } else if (!this.state.video && this.state.serverData.video) {
        this.setState({
          video: this.state.serverData.video,
          url: this.state.serverData.video.videourl
        });
      } else {
        this.setState({
          video: null,
          url: null
        });
      }
    }
  }

  emitData() {
    if (this.state.adminFlag) {
      var playerData = {
        progress: this.state.progress,
        video: this.state.video,
        playing: this.state.playing
      };
      // console.log('playerData ----->', playerData);
      this.props.socket.emit('setTime', {time: playerData});
    }

    setTimeout(this.emitData.bind(this), 1000);
  }

  startVideo() {
    if(this.state.adminFlag && this.state.video === null && this.state.url === null) {
      this.onVideoEnd();
    }
  }

  onVideoEnd() {
    if (this.state.adminFlag) {
      var newVid = this.props.advanceQueue();

      this.setState({
        url: ''
      });

      if (newVid) {
        console.log ('new video', newVid)
        this.setState({
          video: newVid,
          url: newVid.videourl,
          progress: 0
        });
      } else {
        console.log('no new vid');
        this.setState({
          video: null,
          url: null,
          progress: 0
        });
      }
    }
  }

  render() {
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
                <button className='btn btn-sm btn-default' onClick={this.playPause.bind(this)}><span className={this.state.playing ? 'glyphicon glyphicon-pause' : 'glyphicon glyphicon-play'}></span></button>
                <button className='btn btn-sm btn-default' onClick={this.stop.bind(this)}><span className='glyphicon glyphicon-stop'></span></button>
              </div>

              <div id='progBar'className='progress'>
                <div className='progress-bar progress-bar-striped active'
                  role='progressbar' style={{width: (this.state.progress*100)+'%'}}>
                </div>
                <div id='dispCurTime'>
                  {Math.floor((this.state.duration*this.state.progress)/60)+':'+('00'+(Math.floor(((this.state.duration*this.state.progress)-Math.floor((this.state.duration*this.state.progress)/60)*60)))).slice(-2)}
                </div>
              </div>
            </div>

            <div className='col-xs-1'>
              <div id='dispDuration'>
              { Math.floor(this.state.duration/60)+':'+(this.state.duration-Math.floor(this.state.duration/60)*60) }
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

//appData for sharing between, mostly for tests before our database hook up
window.appData = {
  currentUrl: 'https://www.youtube.com/watch?v=KTvfwd3JZTE',
  currentTime: 0,
  chats: [
    {id: 0, user: 'Phteven', text: 'This is a message!'},
    {id: 1, user: 'Barabus', text: 'This song sucks'},
    {id: 2, user: 'Phteven', text: 'That\'s not very nice barabus'},
    {id: 3, user: 'Gertrude', text: 'Has anyone really been far as decided to use even go want to do look more like?'},
    {id: 4, user: 'Kevin Bacon Himself', text: 'Yes'},
    {id: 5, user: 'Karylon the Deceiver', text: 'Your existence is a mistake'}
  ]
};

//AVAIL CLASSES TO WINDOW
window.Video = Video;