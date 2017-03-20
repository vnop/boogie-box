
//CLASSES
class Video extends React.Component {
  constructor(props) {
    super(props);
  }

  setDuration(duration) {
    this.setState({
      duration: duration
    });
  }

  verifySync(playbackTimes) {
    // server time
    // if too different
    // this.refs.player.seekTo(serverTime);
  }

  render() {
    return (
      <div>
        <h1>Boogie Time</h1>
        <ReactPlayer ref="player" url="https://www.youtube.com/watch?v=PZbkF-15ObM" playing controls onDuration={this.setDuration.bind(this)}/>
        <button onClick={() => this.refs.player.seekTo(.5)}>Halfway</button>
      </div>
    );
  }
};

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

class Queue extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <p>This is the Queue</p>
    )
  }
};

class QueueElement extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <p>This is the QueueElement</p>
    )
  }
};

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

var appData = {};//data sharing, mostly for tests
//AVAIL CLASSES TO WINDOW
window.Video = Video;
window.Add = Add;
window.Queue = Queue;
window.QueueElement = QueueElement;
window.Chat = Chat;