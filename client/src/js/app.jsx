class App extends React.Component {
  constructor(props) {
    super(props);
  }

  updateQueue() {
    this.refs.queue.updateQueue();
  }

  render() {
    return (
      <div id="app" className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="jumbostron text-center" id="titleText">
              <h1>Boogie-Box</h1>
              <p>it's boogie time</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Add updateQueue={this.updateQueue.bind(this)}/>
          </div>
        </div>

        <div className="row">
          <div className="col-md-7">
            <div className="row">
              <Video socket={this.props.socket} adminFlag={this.props.adminFlag}/>
            </div>

            <div className="row">
              <div className="panel panel-default">
                <div id="queueHead" className="panel-heading">Queue</div>
                <div className="panel-body">
                  <Queue ref="queue"/>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div id="chatPanel" className="panel panel-info">
              <div id="chatTitle" className="panel-heading">Boogie-Chat</div>
              <div id="chatPanBody" className="panel-body">
                <Chat/>
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }
}

window.App = App;