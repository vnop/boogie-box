class App extends React.Component {
  constructor(props) {
    super(props);
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
            <Add/>
          </div>
        </div>

        <div className="row">
          <div className="col-md-7">
            <div className="row">
              <Video socket={this.props.socket} adminFlag={this.props.adminFlag}/>
            </div>

            <div className="row">
              <div className="panel panel-default">
                <div className="heading">Queue</div>
                <div className="panel-body">
                  <Queue/>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="panel panel-info">
              <div className="panel-heading" id="chatTitle">Boogie-Chat</div>
              <div className="panel-body" id="allChats">
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