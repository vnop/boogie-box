//CLASSES
//The Video class controlls the player
class Video extends React.Component {
  constructor(props) {
    super(props);
    //default audio states
    this.state = {
      url: appData.currentUrl,
      hideVid: false,
      playing: true,
      volume: 1,
      played: 0,
      loaded: 0,
      duration: 0,
      progress: 0,
      serverTime: 0,
      playbackRate: 1.0,
      adminFlag: this.props.adminFlag
    };

    this.props.socket.on('recTime', function (data) {
      console.log(`data --> ${JSON.stringify(data)}`);
      this.setState({
        serverTime: data.time
      });
    }.bind(this));

    this.props.socket.on('setAdminFlag', function (data) {
      console.log('adminFlag set to: ', data);
      this.setState({
        adminFlag: true
      })
    }.bind(this));
  }

  //Audio Controllers
  stop() {
    this.setState({ url: null, playing: false, progress: 0 });
  }
  playPause() {
    if (this.state.url) {
      this.setState({ playing: !this.state.playing });
    } else {
      this.setState({ url: appData.currentUrl, playing: true });
    }
  }
  setVolume(vol) {
    this.setState({ volume: parseFloat(vol.target.value) });
  }
  toggleVideo() {
    this.setState({ hideVid: !this.state.hideVid });
  }

  verifySync(time) {
    this.setState({ progress: time.played });
    var clientTime = Math.floor(this.state.progress*this.state.duration);
    var serverTime = Math.floor(this.state.serverTime*this.state.duration);
    if (Math.abs(clientTime - serverTime) >= 4 && !this.state.adminFlag) {
      this.player.seekTo(this.state.serverTime);
      this.setState({
        progress: this.state.serverTime
      });
    }
    if (this.state.adminFlag) {
      this.props.socket.emit('setTime', {time: this.state.progress});
    }
  }

  render() {
    return (
      <div>
        <div id='audio'>
          <ReactPlayer
            ref={player => { this.player = player } }
            url={this.state.url}
            hidden={this.state.hideVid} //hides the video frame by default; can be toggled
            playing={this.state.playing} //controls playback
            volume={this.state.volume}
            onPlay={() => this.setState({ playing: true }) }
            onPause={() => this.setState({ playing: false}) }
            onEnded={() => this.setState({ playing: false, progress: 0}) }
            onDuration={duration => this.setState({ duration }) } //logs the overall video duration
            onProgress={this.verifySync.bind(this)}
          />
          <div className='container'>

            <div className='row' id='visuals'>
              <div className='col-sm-4'>
                 <div className="progress">
                  <div className="progress-bar progress-bar-striped active"
                    role="progressbar" style={{width: (this.state.progress*100)+'%'}}>
                    <center>{Math.floor(this.state.progress*this.state.duration)}</center>
                  </div>
                </div>
              </div>
              <div className='col-sm-4'>
                <button data-toggle='tooltip' title='Toggle video' className='btn btn-xs' onClick={this.toggleVideo.bind(this)}><span className={this.state.hideVid ? 'glyphicon glyphicon-eye-open' : 'glyphicon glyphicon-eye-close'}></span></button>
              </div>
            </div>

            <div className='row' id='audioCtrl'>
              <div className='col-sm-2'>
                <div className='row'>
                  <span className='col-sm-4' className="glyphicon glyphicon-volume-down"></span>
                  <input className='col-sm-4' id='volumeCtrl' type='range' min={0} max={1} step='any'
                    value={this.state.volume}
                    onChange={this.setVolume.bind(this)} />
                  <span className='col-sm-4' className="glyphicon glyphicon-volume-up"></span>
                </div>
              </div>
              <div className='col-sm-2'>
                <button className='btn btn-sm btn-success' onClick={this.playPause.bind(this)}><span className={this.state.playing ? 'glyphicon glyphicon-pause' : 'glyphicon glyphicon-play'}></span></button>
                <button className='btn btn-sm btn-danger' onClick={this.stop.bind(this)}><span className='glyphicon glyphicon-stop'></span></button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
};

//Component for adding new URLs
class Add extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
  }

  urlSubmit(event) {
    event.preventDefault();
    var inputVal = this.refs.addUrlField.value;
    if (this.validYoutubeUrl(inputVal)) {
      this.refs.addUrlField.style = 'outline: initial';
      this.setState({
        error: ''
      });
      appData.currentUrl = inputVal;
      this.refs.addUrlField.value = '';
    } else {
      console.log('Not a valid youtube link');
      this.refs.addUrlField.style = 'outline: 1px solid red';
      this.setState({
        error: 'Please input a valid Youtube URL'
      });
    }
    console.log('currentUrl', appData.currentUrl);
  }

  validYoutubeUrl(url) {
    var url1 = 'youtube.com';
    var url2 = 'youtu.be';

    return url.indexOf(url1) !== -1 || url.indexOf(url2) !== -1;
  }

  render() {
    return (
      <div>
        <form onSubmit={this.urlSubmit.bind(this)}>
          <label>
            Video URL:
            <input className="form-control" id="focusedInput" type="text" ref="addUrlField"/>
          </label>
          <input className='btn btn-sm btn-primary' type="submit" value="Submit"/>
        </form>
        {this.state.error}
      </div>
    )
  }
};

class QueueElement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      upVote: this.props.video.upVote,
      downVote: this.props.video.downVote,
      downVoted: false,
      upVoted: false,
      downStyle: {},
      upStyle: {}
    };
  }

  voteUp() {
    if(this.state.upVoted) {
      this.setState({
        upVote: this.state.upVote - 1,
        upVoted: false,
        upStyle: {}
      });
    } else if (this.state.downVoted) {
      this.setState({
        upVote: this.state.upVote + 1,
        upVoted: true,
        upStyle: {border: '1px solid green'},
        downVote: this.state.downVote - 1,
        downVoted: false,
        downStyle: {}
      });
    } else {
      this.setState({
        upVote: this.state.upVote + 1,
        upVoted: true,
        upStyle: {border: '1px solid green'}
      });
    }
  }

  voteDown() {
    if(this.state.downVoted) {
      this.setState({
        downVote: this.state.downVote - 1,
        downVoted: false,
        downStyle: {}
      });
    } else if (this.state.upVoted) {
      this.setState({
        downVote: this.state.downVote + 1,
        downVoted: true,
        downStyle:  {border: '1px solid red'},
        upVote: this.state.upVote - 1,
        upVoted: false,
        upStyle: {}
      });
    } else {
      this.setState({
        downVote: this.state.downVote + 1,
        downVoted: true,
        downStyle: {border: '1px solid red'}
      });
    }
  }

  render() {
    return (
      <table>
        <tr>
          <td>
            <p> {this.props.video.title} </p>
            <p> {this.props.video.videoUrl} </p>
          </td>

          <td>
            <button onClick={this.voteUp.bind(this)} style={this.state.upStyle}> ^ </button>
            <span> {this.state.upVote} </span>
          </td>

          <td>
            <button onClick={this.voteDown.bind(this)} style={this.state.downStyle}> v </button>
            <span> {this.state.downVote} </span>
          </td>
        </tr>
      </table>
    )
  }
};

class Queue extends React.Component {
  constructor(props) {
    super(props);

    var dummyData = [
      {id: 0, videoUrl: 'https://www.youtube.com/watch?v=laNCDelVXpk', title: 'Lucian ft. Olivera - Sober Heart', upVote: 10, downVote: 0},
      {id: 1, videoUrl: 'https://www.youtube.com/watch?v=A8jXapCG0VQ', title: 'Futuristik ft. Miyoki - Waterborne', upVote: 3, downVote: 3},
      {id: 2, videoUrl: 'https://www.youtube.com/watch?v=PZbkF-15ObM', title: 'C2C - Delta (official Video)', upVote: 284, downVote: 23},
      {id: 3, videoUrl: 'https://www.youtube.com/watch?v=Wga5A6R9BJg', title: 'Slightly Left of Centre - Love The Way You Move (LTWYM) Official Music Video', upVote: 4, downVote: 8}
    ];

    this.state = {
      videoList: dummyData
    };
  }

  render() {
    var queueElements = [];
    _.each(this.state.videoList, function(video) {
      queueElements.push(<QueueElement video={video} key={video.id}/>);
    });

    return (
      <div>
        { queueElements }
      </div>
    );
  }
};

class ChatMessage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="chatMessage">
        <span className="chatMessageUser"> {this.props.message.user}: </span>
        <span className="chatMessageText"> {this.props.message.text} </span>
      </div>
    );
  }

}

//CHAT CONTROLLER
class Chat extends React.Component {
  constructor(props) {
    super(props);

    var dummyData = [
      {id: 0, user: 'Phteven', text: 'This is a message!'},
      {id: 1, user: 'Barabus', text: 'This song sucks'},
      {id: 2, user: 'Phteven', text: 'That\'s not very nice barabus'},
      {id: 3, user: 'Gertrude', text: 'Has anyone really been far as decided to use even go want to do look more like?'},
      {id: 4, user: 'Kevin Bacon Himself', text: 'Yes'},
      {id: 5, user: 'Karylon the Deceiver', text: 'Your existence is a mistake'}
    ];

    this.state = {
      messages: dummyData
    }
  }

  render() {
    var chats = [];
    _.each(this.state.messages, function(message) {
      chats.push(<ChatMessage message={message} key={message.id}/>);
    })


    return (
      <div className="chatBox">
        {chats}
      </div>
    )
  }
};

//appData for sharing between, mostly for tests before our database hook up
var appData = {
  currentUrl: 'https://www.youtube.com/watch?v=vSkb0kDacjs',
  currentTime: 0
};

//AVAIL CLASSES TO WINDOW
window.Video = Video;
window.Add = Add;
window.Queue = Queue;
window.QueueElement = QueueElement;
window.Chat = Chat;