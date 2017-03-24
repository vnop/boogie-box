class ChatInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevName: this.props.name,
      name: this.props.name,
      messages: this.props.messages
    }

    this.props.socket.on('new message', function(data) {
      console.log('got emit');
      var newMessage = {
        user: data.user,
        text: data.text,
        id: this.state.messages.length
      };
      this.state.messages.push(newMessage);
      this.props.updateChat();
    }.bind(this));

  }

  chatSubmit(event) {
    event.preventDefault();
    var messageText = this.refs.messageInput.value;
    var prevName = this.state.prevName;
    this.refs.messageInput.value = '';

    this.setState({
      prevName: this.refs.nameInput.value
    });

    //test version until chat DB is up
    if(prevName !== this.state.name) {
      var announceNameChange = {
        user: prevName,
        text: 'I changed my name to \'' + this.state.name + '\''
      };
      this.props.socket.emit('new message', announceNameChange);
      announceNameChange.id=this.state.messages.length;
      this.state.messages.push(announceNameChange);
    }

    var newMessage = {
      user: this.state.name,
      text: messageText
    };
    this.props.socket.emit('new message', newMessage);
    newMessage.id=this.state.messages.length;
    this.state.messages.push(newMessage);
    this.props.updateChat();
  }

  changeName() {
    this.setState({
      name: this.refs.nameInput.value
    });
  }

  render() {
    return (
      <form id='allChatInputs' onSubmit={this.chatSubmit.bind(this)}>
        <input id='userIdBox' type='text' ref='nameInput' value={this.state.name} onChange={this.changeName.bind(this)}></input>
        <input id='chatInputBox' type='text' ref='messageInput'></input>
        <button id='chatSubmitBtn' className='btn btn-sm btn-default' type='submit'>Send</button>
      </form>
    );
  }
};

class ChatMessage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className='chatMessage'>
        <span className='chatMessageUser' className='label label-primary'>{this.props.message.user}:</span>
        <span className='chatMessageText'> {this.props.message.text} </span>
      </div>
    );
  }

};

//CHAT CONTROLLER
class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      anonName: this.genAnonName()
    }
  }

  genAnonName() {
    var num = Math.floor(Math.random() * 1000);
    var numStr = '000' + num;
    numStr = numStr.substring(numStr.length - 3);
    var name = 'Anon' + numStr;
    return name;
  }

  updateChat() {
    this.forceUpdate();
  }

  render() {
    var chats = [];
    _.each(this.state.messages, function(message) {
      console.log(message);
      chats.push(<ChatMessage message={message} key={message.id}/>);
    })


    return (
      <div className="chatBox">
        <div id='chatPanel' className='panel panel-info'>
          <div id='chatTitle' className='panel-heading'>Boogie-Chat</div>
          <div id='chatPanBody' className='panel-body'>
            <div id='textBody'>{chats}</div>
          </div>
          <div id='chatPanFtr' className='panel-footer'>
            <ChatInput messages={this.state.messages} name={this.state.anonName} updateChat={this.updateChat.bind(this)} socket={this.props.socket}/>
          </div>
        </div>
      </div>
    )
  }
};

window.Chat = Chat;