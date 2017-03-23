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
      muted: false,
      volume: 1,
      played: 0,
      loaded: 0,
      duration: 0,
      progress: 0,
      serverTime: 0,
      playbackRate: 1.0,
      useSync: true,
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
    this.setState({ useSync: !this.state.useSync })
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
      <div id='audioPanel' className='container-fluid' className="panel panel-info">
        <div id='plyrPnlHeading' className="panel-heading">
          <div id='hideVidBtn' data-toggle='tooltip' title='Toggle video' onClick={this.toggleVideo.bind(this)}><span className={this.state.hideVid ? 'glyphicon glyphicon-eye-close' : 'glyphicon glyphicon-eye-open'}></span></div>
          <div id='useSyncBtn' data-toggle='tooltip' title='Toggle sync' onClick={this.toggleSync.bind(this)}><span className={this.state.useSync ? 'glyphicon glyphicon-transfer' : 'glyphicon glyphicon-headphones'}></span></div>
          <div id='audioTitle'>Song Title</div>
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
                onEnded={() => this.setState({ playing: false, progress: 0}) }
                onDuration={duration => this.setState({ duration }) } //logs the overall video duration
                onProgress={this.verifySync.bind(this)}
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
                  {Math.floor((this.state.duration*this.state.progress)/60)+':'+Math.floor(((this.state.duration*this.state.progress)-Math.floor((this.state.duration*this.state.progress)/60)*60))}
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
      apiHelper.postVideo(inputVal);
      this.props.updateQueue();
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
            <p> {this.props.video.videourl} </p>
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

    this.state = {
      videoList: []
    };

    this.updateQueue();
  }

  updateQueue() {
    var getVideosCallback = function(err, data) {
      if (err) {
        console.log('Error on retrieving videos', err);
      } else {
        this.setState({
          videoList: data
        });
      }
    };

    apiHelper.getVideos(getVideosCallback.bind(this));
  }

  render() {
    var queueElements = [];
    _.each(this.state.videoList, function(video) {
      queueElements.push(<QueueElement video={video} key={video.id}/>);
    });

    return (
      <div>
        <p className="queueHeading">Video Queue</p>
        { queueElements }
      </div>
    );
  }
};

class ChatInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevName: this.props.name,
      name: this.props.name
    }
  }

  chatSubmit(event) {
    event.preventDefault();
    var messageText = this.refs.messageInput.value;
    var prevName = this.state.prevName;
    this.refs.messageInput.value = '';

    this.setState({
      prevName: this.refs.nameInput.value
    });

    //test version until chat DB is up
    var messageID;
    if(prevName !== this.state.name) {
      messageID = appData.chats[appData.chats.length - 1].id + 1;
      appData.chats.push({
        id: messageID,
        user: prevName,
        text: 'I changed my name to \'' + this.state.name + '\''
      });
    }

    messageID = appData.chats[appData.chats.length - 1].id + 1;
    appData.chats.push({
      id: messageID,
      user: this.state.name,
      text: messageText
    });
    // end test code

    this.props.updateChat();
  }

  changeName() {
    this.setState({
      name: this.refs.nameInput.value
    });
  }

  render() {
    return (
      <form onSubmit={this.chatSubmit.bind(this)}>
        <input type="text" ref="nameInput" value={this.state.name} onChange={this.changeName.bind(this)}></input>
        <input type="text" ref="messageInput"></input>
        <button type="submit">Send</button>
      </form>
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

};

//CHAT CONTROLLER
class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: appData.chats,
      anonName: this.genAnonName()
    }
  }

  genAnonName() {
    var num = Math.floor(Math.random() * 1000);
    var numStr = '000' + num;
    numStr = numStr.substring(numStr.length - 3);
    var name = 'Anon' + numStr;
    return name;
  }

  updateChat() {
    this.setState({
      messages: appData.chats
    });
  }

  render() {
    var chats = [];
    _.each(this.state.messages, function(message) {
      chats.push(<ChatMessage message={message} key={message.id}/>);
    })


    return (
      <div className="chatBox">
        {chats}
        <div>
          <ChatInput name={this.state.anonName} updateChat={this.updateChat.bind(this)}/>
        </div>
      </div>
    )
  }
};

//appData for sharing between, mostly for tests before our database hook up
var appData = {
  currentUrl: 'https://www.youtube.com/watch?v=UbQgXeY_zi4',
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
window.Add = Add;
window.Queue = Queue;
window.QueueElement = QueueElement;
window.Chat = Chat;