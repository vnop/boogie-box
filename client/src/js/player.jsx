
//CLASSES
//The Video class controlls the player, possibly changing name to "Audio" to be more accurate
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
      playbackRate: 1.0
    };
  }

  //Audio Controllers
  stop() {
    this.setState({ url: null, playing: false });
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
    var seconds = Math.floor(time.progress*this.state.duration);
    this.setState({ progress: seconds })
    // console.log(this.state.progress, appData.currentTime); //To check my expected outputs
    if (this.state.progress < appData.currentTime-2) {
      //seek to the correct time
    }
    appData.currentTime = time.progress;
  }

  render() {
    return (
      <div>
        <h1>Boogie Time</h1>
        <div id='audio'>
          <ReactPlayer
            ref={player => { this.player = player } }
            url={this.state.url}
            hidden={this.state.hideVid} //hides the video frame by default; can be toggled
            playing={this.state.playing} //automatically starts playback
            volume={this.state.volume}
            onPlay={() => this.setState({ playing: true }) }
            onPause={() => this.setState({ playing: false}) }
            onEnded={() => this.setState({ playing: false}) }
            onDuration={duration => this.setState({ duration }) } //logs the current duration
            onProgress={progress => this.setState({ progress: progress.played }) }
          />
          <div id='visuals'>
            <input type='range' min={0} max={1}
              step='any' value={this.state.progress}/>
            <button id='toggleVideo' onClick={this.toggleVideo.bind(this)}>{this.state.hideVid ? 'Show Video' : 'Hide Video'}</button>
          </div>
          <div id='volume'>
            <input type='range' min={0} max={1} step='any'
              value={this.state.volume}
              onChange={this.setVolume.bind(this)} />
          </div>
          <div id='controls'>
            <button onClick={this.playPause.bind(this)}>{this.state.playing ? 'Pause' : 'Play'}</button>
            <button onClick={this.stop.bind(this)}>Stop</button>
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
    } else {
      console.log('Not a valid youtube link');
      this.refs.addUrlField.style = 'outline: 1px solid red';
      this.setState({
        error: 'Please input a valid Youtube URL'
      });
    }
    console.log('currentUrl', appData.currentUrl);
    this.refs.addUrlField.value = '';
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
            <input type="text" ref="addUrlField"/>
          </label>
          <input type="submit" value="Submit" />
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

//CHAT CONTROLLER
class Chat extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <p>This is the chat</p>
    )
  }
};

//appData for sharing between, mostly for tests before our database hook up
var appData = {
  currentUrl: 'https://www.youtube.com/watch?v=9RHFFeQ2tu4'
};

//AVAIL CLASSES TO WINDOW
window.Video = Video;
window.Add = Add;
window.Queue = Queue;
window.QueueElement = QueueElement;
window.Chat = Chat;