class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="app" className="container">

        <div className="jumbostron text-center">
          <h1>Boogie-Box</h1>
          <p>it's boogie time</p>
        </div>

        <Add/>
        <div className="row">
          <div className="col-md-7">
            <Video/>
          </div>
          <div className="col-md-5">
            <Chat/>
          </div>
        </div>

        <Queue/>
      </div>
    )
  }
}

window.App = App;