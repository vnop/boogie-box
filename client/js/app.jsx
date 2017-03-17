//add dep
//react
//react-dom

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div><h1>Hello {this.props.message}</h1></div>
    );
  }
}

window.App = App;