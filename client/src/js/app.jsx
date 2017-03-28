class App extends React.Component {
  constructor(props) {
    super(props);
  }

  // Passed to relevant components so that
  // they can manage pulling from the queue
  // and playing new videos.
  // refers to the advanceQueue method in
  // the Queue component
  advanceQueue() {
    return this.refs.queue.advanceQueue();
  }

  // Used to start playing a video in the event
  // that the state of the player should go from
  // empty to playing a particular video.
  // refers to the startVideo method in the
  // Video component
  startVideo() {
    this.refs.player.startVideo();
  }
  render() {
    return (
      <div id="app" className="container">
        <div className="row">
          <div className="col-md-12">
            <div id="titleText" className="jumbostron text-center">
              <h1>Boogie-Box</h1>
              <p>it's boogie time</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-7">
            <div className="row">
              <Video advanceQueue={this.advanceQueue.bind(this)} socket={this.props.socket} adminFlag={this.props.adminFlag} video={null} ref="player"/>
            </div>

            <div className="row">
              <Queue socket={this.props.socket} ref="queue" startVideo={this.startVideo.bind(this)}/>
            </div>
          </div>

          <div className="col-md-5">
            <Chat socket={this.props.socket}/>
          </div>

        </div>
      </div>
    )
  }
}

window.App = App;