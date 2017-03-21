var socket = io('http://localhost:8081');
var adminFlag = false;

ReactDOM.render(<App socket={socket} adminFlag={adminFlag} />, document.getElementById('app'));