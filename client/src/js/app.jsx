class App extends React.Component {
  constructor(props) {
    super(props);
  }

  advanceQueue() {
    return this.refs.queue.advanceQueue();
  }

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
              <div className="panel panel-default">
                <div id="queueHead" className="panel-heading">Queue</div>
                <div className="panel-body">
                  <Queue ref="queue" startVideo={this.startVideo.bind(this)}/>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <Chat/>
          </div>

        </div>
      </div>
    )
  }
}

window.App = App;