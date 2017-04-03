var socket = io();
var adminFlag = false;

ReactDOM.render(<App socket={socket} adminFlag={adminFlag} />, document.getElementById('app'));