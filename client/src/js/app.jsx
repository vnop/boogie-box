class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="app">
        <Add/>
        <Video/>
        <Queue/>
        <Chat/>
      </div>
    )
  }
}

window.App = App;