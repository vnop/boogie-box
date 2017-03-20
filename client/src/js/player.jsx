
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
  }

  render() {
    return (
      <form onSubmit={function(){return false}}>
        <label>
          Video URL:
          <input type="text" url="name" />
        </label>
        <input type="submit" value="Submit" />
      </form>
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