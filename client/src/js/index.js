var socket = io(socketAddr);
var adminFlag = false;

ReactDOM.render(<App socket={socket} adminFlag={adminFlag} />, document.getElementById('app'));