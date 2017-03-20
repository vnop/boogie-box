
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
        <h1>Hello {this.props.message}</h1>
        <ReactPlayer ref="player" url="https://soundcloud.com/crystal-castles/vanished" playing controls onDuration={this.setDuration.bind(this)}/>
        <button onClick={() => this.refs.player.seekTo(.5)}>Halfway</button>
      </div>
    );
  }
};

class Add extends React.Component {
//takes in a url to add to queue
};

class Queue extends React.Component {
//manages urls added
};

class QueueElement extends React.Component {
//handles upvote/downvote, queue manipulation
};

class Chat extends React.Component {
//handles chats
};

//AVAIL CLASSES TO WINDOW
window.Video = Video;
window.Add = Add;
window.Queue = Queue;
window.QueueElement = QueueElement;
window.Chat = Chat;