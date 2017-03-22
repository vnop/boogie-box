class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="app" className="container">
        <div className="jumbostron text-center" id="titleText">
          <h1>Boogie-Box</h1>
          <p>it's boogie time</p>
        </div>
        <Add/>
        <div className="row">

          <div className="col-md-7">
            <Video socket={this.props.socket} adminFlag={this.props.adminFlag}/>
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

        <Queue/>
      </div>
    )
  }
}

window.App = App;