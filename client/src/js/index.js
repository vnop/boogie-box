var socket = io('http://localhost:8082');
var adminFlag = false;

ReactDOM.render(<App socket={socket} adminFlag={adminFlag} />, document.getElementById('app'));