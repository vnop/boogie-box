'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// React component for handling the sending of new chats
var ChatInput = function (_React$Component) {
  _inherits(ChatInput, _React$Component);

  function ChatInput(props) {
    _classCallCheck(this, ChatInput);

    var _this = _possibleConstructorReturn(this, (ChatInput.__proto__ || Object.getPrototypeOf(ChatInput)).call(this, props));

    console.log(props);
    _this.state = {
      prevName: _this.props.name,
      name: _this.props.name,
      messages: _this.props.messages,
      typing: false
    };

    // Messages will render on load
    _this.props.updateChat();

    // Handles receiving new messages from the socket
    // Note: Only users who didn't send the message will
    // receive this. The sender's client will track it
    // for them sans socket to cut down on unnecessary
    // socket communications.
    _this.props.socket.on('new message', function (data) {
      var newMessage = {
        user: data.user,
        text: data.text,
        id: this.state.messages.length
      };
      apiHelper.postChat(newMessage, function () {
        this.props.updateChat();
      }.bind(this));
    }.bind(_this));

    return _this;
  }

  // Handles all info when the user submits a chat.
  // This includes changing of names, storing your own
  // messages, etc.


  _createClass(ChatInput, [{
    key: 'chatSubmit',
    value: function chatSubmit(event) {
      event.preventDefault();
      var messageText = this.refs.messageInput.value;
      var prevName = this.state.prevName;
      this.refs.messageInput.value = '';

      this.setState({
        prevName: this.refs.nameInput.value
      });

      if (prevName !== this.state.name) {
        var announceNameChange = {
          user: prevName,
          text: 'I changed my name to \'' + this.state.name + '\''
        };
        this.props.socket.emit('new message', announceNameChange);
        announceNameChange.id = this.state.messages.length;
        this.state.messages.push(announceNameChange);

        apiHelper.postUserToSession(this.state.name);
      }

      var newMessage = {
        user: this.state.name,
        text: messageText
      };
      this.props.socket.emit('new message', newMessage);
      newMessage.id = this.state.messages.length;

      // I can't tell if either of these is actually doing anything
      // First line was always here. I added the second one
      this.state.messages.concat(newMessage);
      this.setState({ messages: this.state.messages });

      this.props.updateChat();
      this.endTyping();
    }

    //Whenever the the chat input changes, which is to say whenever a user adds or removes a character from the message input, this checks to see if the string is empty or not. If it is, any typing notification is removed. Conversely, if the user is typing, the typing notification is displayed to other users.

  }, {
    key: 'checkInput',
    value: function checkInput(event) {
      if (this.refs.messageInput.value) {
        this.chatTyping();
      } else {
        this.endTyping();
      }
    }

    //If user is typing, this sends the username to the typing event listener in the server to display to other users a typing indicator.

  }, {
    key: 'chatTyping',
    value: function chatTyping(event) {
      var typingNote = {
        user: this.state.name
      };
      this.props.socket.emit('typing', typingNote);
    }

    //Tells server that the user is done typing by packing grabbing the name of the state object and sending it to the 'end typing' event listener in the server.

  }, {
    key: 'endTyping',
    value: function endTyping(event) {
      var endTypingNote = {
        user: this.state.name
      };
      this.props.socket.emit('end typing', endTypingNote);
    }

    // This just keeps track of what nickname the user
    // has chosen to use

  }, {
    key: 'changeName',
    value: function changeName() {
      this.setState({
        name: this.refs.nameInput.value
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var setName = function (err, name) {
        if (err) {
          console.error(err);
        } else {
          this.setState({
            prevName: name,
            name: name
          });
        }
      }.bind(this);

      apiHelper.getUserFromSession(setName);
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'form',
        { id: 'allChatInputs', onSubmit: this.chatSubmit.bind(this) },
        React.createElement('input', { id: 'userIdBox', type: 'text', ref: 'nameInput', value: this.state.name, onChange: this.changeName.bind(this) }),
        React.createElement('input', { id: 'chatInputBox', type: 'text', ref: 'messageInput', onChange: this.checkInput.bind(this) }),
        React.createElement(
          'button',
          { id: 'chatSubmitBtn', className: 'btn btn-sm btn-default', type: 'submit' },
          'Send'
        )
      );
    }
  }]);

  return ChatInput;
}(React.Component);

;

var ChatMessage = function (_React$Component2) {
  _inherits(ChatMessage, _React$Component2);

  function ChatMessage(props) {
    _classCallCheck(this, ChatMessage);

    return _possibleConstructorReturn(this, (ChatMessage.__proto__ || Object.getPrototypeOf(ChatMessage)).call(this, props));
  }

  _createClass(ChatMessage, [{
    key: 'render',
    value: function render() {

      return React.createElement(
        'div',
        { className: 'chatMessage' },
        React.createElement(
          'span',
          _defineProperty({ className: 'chatMessageUser' }, 'className', 'label label-primary'),
          this.props.message.user,
          ':'
        ),
        React.createElement(
          'span',
          { className: 'chatMessageText' },
          ' ',
          this.props.message.text,
          ' '
        )
      );
    }
  }]);

  return ChatMessage;
}(React.Component);

;

var Chat = function (_React$Component3) {
  _inherits(Chat, _React$Component3);

  function Chat(props) {
    _classCallCheck(this, Chat);

    var _this3 = _possibleConstructorReturn(this, (Chat.__proto__ || Object.getPrototypeOf(Chat)).call(this, props));

    _this3.state = {
      messages: [],
      anonName: _this3.genAnonName(),
      userActive: false,
      typingUsers: {}
    };

    _this3.props.socket.on('typing', function (data) {
      this.state.typingUsers[data.user] = !this.state.typingUsers[data.user] ? this.state.typingUsers[data.user] : this.state.typingUsers[data.user]++;
      this.setState({
        userActive: true,
        typingUsers: this.state.typingUsers
      });
    }.bind(_this3));

    _this3.props.socket.on('end typing', function (data) {
      for (var key in this.state.typingUsers) {
        if (key === data.user) {
          delete this.state.typingUsers[key];
        }
      }
      this.setState({
        typingUsers: this.state.typingUsers
      }, function () {
        if (!Object.keys(this.state.typingUsers).length) {
          this.setState({
            userActive: false
          });
        }
      });
    }.bind(_this3));

    return _this3;
  }

  // This just generates a random name of the form
  // Anonxxx where xxx is a random, three digit number


  _createClass(Chat, [{
    key: 'genAnonName',
    value: function genAnonName() {
      var num = Math.floor(Math.random() * 1000);
      var numStr = '000' + num;
      numStr = numStr.substring(numStr.length - 3);
      var name = 'Anon' + numStr;
      return name;
    }

    // Just for utility in updating the chat correctly
    // with the most up to date information

  }, {
    key: 'updateChat',
    value: function updateChat() {
      var getChatCallback = function getChatCallback(err, data) {
        if (err) {
          console.log('Error on retrieving chat', err);
        } else {
          this.setState({
            messages: data
          });
        }
      };
      apiHelper.getChat(getChatCallback.bind(this));
    }

    // to scroll to the bottom of the chat

  }, {
    key: 'scrollToBottom',
    value: function scrollToBottom() {
      var node = ReactDOM.findDOMNode(this.messagesEnd);
      node.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.scrollToBottom();
    }

    // when the chat updates, scroll to the bottom to display the most recent chat

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.scrollToBottom();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      console.log(this.state.typingUsers);
      var thoseTyping = Object.keys(this.state.typingUsers).join(', ').trim().replace(/^,/, '');
      var typingIndicator = thoseTyping + ' . . .';
      var chats = [];

      _.each(this.state.messages, function (message) {
        chats.push(React.createElement(ChatMessage, { message: message, key: message.id }));
      });
      return React.createElement(
        'div',
        { className: 'chatBox' },
        React.createElement(
          'div',
          { id: 'chatPanel', className: 'panel panel-info' },
          React.createElement(
            'div',
            { id: 'chatTitle', className: 'panel-heading' },
            'Boogie-Chat'
          ),
          React.createElement(
            'div',
            { id: 'chatPanBody', className: 'panel-body' },
            React.createElement(
              'div',
              { id: 'textBody' },
              chats,
              React.createElement('div', { style: { float: "left", clear: "both" }, ref: function ref(el) {
                  _this4.messagesEnd = el;
                } }),
              React.createElement(
                'div',
                { id: 'typing-indicator', className: this.state.userActive ? 'typing-indicator show' : 'hidden' },
                React.createElement('i', { className: 'fa fa-comments', 'aria-hidden': 'true' }),
                typingIndicator
              ),
              React.createElement('div', { id: 'isTyping', className: 'typing-notification' })
            )
          ),
          React.createElement(
            'div',
            { id: 'chatPanFtr', className: 'panel-footer' },
            React.createElement(ChatInput, { messages: this.state.messages, name: this.state.anonName, updateChat: this.updateChat.bind(this), socket: this.props.socket })
          )
        )
      );
    }
  }]);

  return Chat;
}(React.Component);

;

window.Chat = Chat;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9jaGF0LmpzeCJdLCJuYW1lcyI6WyJDaGF0SW5wdXQiLCJwcm9wcyIsImNvbnNvbGUiLCJsb2ciLCJzdGF0ZSIsInByZXZOYW1lIiwibmFtZSIsIm1lc3NhZ2VzIiwidHlwaW5nIiwidXBkYXRlQ2hhdCIsInNvY2tldCIsIm9uIiwiZGF0YSIsIm5ld01lc3NhZ2UiLCJ1c2VyIiwidGV4dCIsImlkIiwibGVuZ3RoIiwiYXBpSGVscGVyIiwicG9zdENoYXQiLCJiaW5kIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsIm1lc3NhZ2VUZXh0IiwicmVmcyIsIm1lc3NhZ2VJbnB1dCIsInZhbHVlIiwic2V0U3RhdGUiLCJuYW1lSW5wdXQiLCJhbm5vdW5jZU5hbWVDaGFuZ2UiLCJlbWl0IiwicHVzaCIsInBvc3RVc2VyVG9TZXNzaW9uIiwiY29uY2F0IiwiZW5kVHlwaW5nIiwiY2hhdFR5cGluZyIsInR5cGluZ05vdGUiLCJlbmRUeXBpbmdOb3RlIiwic2V0TmFtZSIsImVyciIsImVycm9yIiwiZ2V0VXNlckZyb21TZXNzaW9uIiwiY2hhdFN1Ym1pdCIsImNoYW5nZU5hbWUiLCJjaGVja0lucHV0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJDaGF0TWVzc2FnZSIsIm1lc3NhZ2UiLCJDaGF0IiwiYW5vbk5hbWUiLCJnZW5Bbm9uTmFtZSIsInVzZXJBY3RpdmUiLCJ0eXBpbmdVc2VycyIsImtleSIsIk9iamVjdCIsImtleXMiLCJudW0iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJudW1TdHIiLCJzdWJzdHJpbmciLCJnZXRDaGF0Q2FsbGJhY2siLCJnZXRDaGF0Iiwibm9kZSIsIlJlYWN0RE9NIiwiZmluZERPTU5vZGUiLCJtZXNzYWdlc0VuZCIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJiZWhhdmlvciIsInNjcm9sbFRvQm90dG9tIiwidGhvc2VUeXBpbmciLCJqb2luIiwidHJpbSIsInJlcGxhY2UiLCJ0eXBpbmdJbmRpY2F0b3IiLCJj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QUFnQlcsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBakYsRUFBNkcsUUFBUSxLQUFLbkIsS0FBTCxDQUFXUyxNQUFoSTtBQURGO0FBYkY7QUFERixPQURGO0FBcUJEOzs7O0VBakhnQm1DLE1BQU1DLFM7O0FBa0h4Qjs7QUFJRHNDLE9BQU9uQyxJQUFQLEdBQWNBLElBQWQiLCJmaWxlIjoiY2hhdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gUmVhY3QgY29tcG9uZW50IGZvciBoYW5kbGluZyB0aGUgc2VuZGluZyBvZiBuZXcgY2hhdHNcbmNsYXNzIENoYXRJbnB1dCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIGNvbnNvbGUubG9nKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBwcmV2TmFtZTogdGhpcy5wcm9wcy5uYW1lLFxuICAgICAgbmFtZTogdGhpcy5wcm9wcy5uYW1lLFxuICAgICAgbWVzc2FnZXM6IHRoaXMucHJvcHMubWVzc2FnZXMsXG4gICAgICB0eXBpbmc6IGZhbHNlXG4gICAgfVxuXG4gICAgLy8gTWVzc2FnZXMgd2lsbCByZW5kZXIgb24gbG9hZFxuICAgIHRoaXMucHJvcHMudXBkYXRlQ2hhdCgpO1xuXG4gICAgLy8gSGFuZGxlcyByZWNlaXZpbmcgbmV3IG1lc3NhZ2VzIGZyb20gdGhlIHNvY2tldFxuICAgIC8vIE5vdGU6IE9ubHkgdXNlcnMgd2hvIGRpZG4ndCBzZW5kIHRoZSBtZXNzYWdlIHdpbGxcbiAgICAvLyByZWNlaXZlIHRoaXMuIFRoZSBzZW5kZXIncyBjbGllbnQgd2lsbCB0cmFjayBpdFxuICAgIC8vIGZvciB0aGVtIHNhbnMgc29ja2V0IHRvIGN1dCBkb3duIG9uIHVubmVjZXNzYXJ5XG4gICAgLy8gc29ja2V0IGNvbW11bmljYXRpb25zLlxuICAgIHRoaXMucHJvcHMuc29ja2V0Lm9uKCduZXcgbWVzc2FnZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBuZXdNZXNzYWdlID0ge1xuICAgICAgICB1c2VyOiBkYXRhLnVzZXIsXG4gICAgICAgIHRleHQ6IGRhdGEudGV4dCxcbiAgICAgICAgaWQ6IHRoaXMuc3RhdGUubWVzc2FnZXMubGVuZ3RoXG4gICAgICB9O1xuICAgICAgYXBpSGVscGVyLnBvc3RDaGF0KG5ld01lc3NhZ2UsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnByb3BzLnVwZGF0ZUNoYXQoKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICB9XG5cbiAgLy8gSGFuZGxlcyBhbGwgaW5mbyB3aGVuIHRoZSB1c2VyIHN1Ym1pdHMgYSBjaGF0LlxuICAvLyBUaGlzIGluY2x1ZGVzIGNoYW5naW5nIG9mIG5hbWVzLCBzdG9yaW5nIHlvdXIgb3duXG4gIC8vIG1lc3NhZ2VzLCBldGMuXG4gIGNoYXRTdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBtZXNzYWdlVGV4dCA9IHRoaXMucmVmcy5tZXNzYWdlSW5wdXQudmFsdWU7XG4gICAgdmFyIHByZXZOYW1lID0gdGhpcy5zdGF0ZS5wcmV2TmFtZTtcbiAgICB0aGlzLnJlZnMubWVzc2FnZUlucHV0LnZhbHVlID0gJyc7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByZXZOYW1lOiB0aGlzLnJlZnMubmFtZUlucHV0LnZhbHVlXG4gICAgfSk7XG5cbiAgICBpZihwcmV2TmFtZSAhPT0gdGhpcy5zdGF0ZS5uYW1lKSB7XG4gICAgICB2YXIgYW5ub3VuY2VOYW1lQ2hhbmdlID0ge1xuICAgICAgICB1c2VyOiBwcmV2TmFtZSxcbiAgICAgICAgdGV4dDogJ0kgY2hhbmdlZCBteSBuYW1lIHRvIFxcJycgKyB0aGlzLnN0YXRlLm5hbWUgKyAnXFwnJ1xuICAgICAgfTtcbiAgICAgIHRoaXMucHJvcHMuc29ja2V0LmVtaXQoJ25ldyBtZXNzYWdlJywgYW5ub3VuY2VOYW1lQ2hhbmdlKTtcbiAgICAgIGFubm91bmNlTmFtZUNoYW5nZS5pZD10aGlzLnN0YXRlLm1lc3NhZ2VzLmxlbmd0aDtcbiAgICAgIHRoaXMuc3RhdGUubWVzc2FnZXMucHVzaChhbm5vdW5jZU5hbWVDaGFuZ2UpO1xuXG4gICAgICBhcGlIZWxwZXIucG9zdFVzZXJUb1Nlc3Npb24odGhpcy5zdGF0ZS5uYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TWVzc2FnZSA9IHtcbiAgICAgIHVzZXI6IHRoaXMuc3RhdGUubmFtZSxcbiAgICAgIHRleHQ6IG1lc3NhZ2VUZXh0XG4gICAgfTtcbiAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCduZXcgbWVzc2FnZScsIG5ld01lc3NhZ2UpO1xuICAgIG5ld01lc3NhZ2UuaWQ9dGhpcy5zdGF0ZS5tZXNzYWdlcy5sZW5ndGg7XG5cbiAgICAvLyBJIGNhbid0IHRlbGwgaWYgZWl0aGVyIG9mIHRoZXNlIGlzIGFjdHVhbGx5IGRvaW5nIGFueXRoaW5nXG4gICAgLy8gRmlyc3QgbGluZSB3YXMgYWx3YXlzIGhlcmUuIEkgYWRkZWQgdGhlIHNlY29uZCBvbmVcbiAgICB0aGlzLnN0YXRlLm1lc3NhZ2VzLmNvbmNhdChuZXdNZXNzYWdlKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZXM6IHRoaXMuc3RhdGUubWVzc2FnZXMgfSk7XG5cbiAgICB0aGlzLnByb3BzLnVwZGF0ZUNoYXQoKTtcbiAgICB0aGlzLmVuZFR5cGluZygpO1xuICB9XG5cbiAgLy9XaGVuZXZlciB0aGUgdGhlIGNoYXQgaW5wdXQgY2hhbmdlcywgd2hpY2ggaXMgdG8gc2F5IHdoZW5ldmVyIGEgdXNlciBhZGRzIG9yIHJlbW92ZXMgYSBjaGFyYWN0ZXIgZnJvbSB0aGUgbWVzc2FnZSBpbnB1dCwgdGhpcyBjaGVja3MgdG8gc2VlIGlmIHRoZSBzdHJpbmcgaXMgZW1wdHkgb3Igbm90LiBJZiBpdCBpcywgYW55IHR5cGluZyBub3RpZmljYXRpb24gaXMgcmVtb3ZlZC4gQ29udmVyc2VseSwgaWYgdGhlIHVzZXIgaXMgdHlwaW5nLCB0aGUgdHlwaW5nIG5vdGlmaWNhdGlvbiBpcyBkaXNwbGF5ZWQgdG8gb3RoZXIgdXNlcnMuXG4gIGNoZWNrSW5wdXQoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5yZWZzLm1lc3NhZ2VJbnB1dC52YWx1ZSkge1xuICAgICAgICB0aGlzLmNoYXRUeXBpbmcoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbmRUeXBpbmcoKTtcbiAgICB9XG4gIH1cblxuICAvL0lmIHVzZXIgaXMgdHlwaW5nLCB0aGlzIHNlbmRzIHRoZSB1c2VybmFtZSB0byB0aGUgdHlwaW5nIGV2ZW50IGxpc3RlbmVyIGluIHRoZSBzZXJ2ZXIgdG8gZGlzcGxheSB0byBvdGhlciB1c2VycyBhIHR5cGluZyBpbmRpY2F0b3IuXG4gIGNoYXRUeXBpbmcoZXZlbnQpIHtcbiAgICB2YXIgdHlwaW5nTm90ZSA9IHtcbiAgICAgIHVzZXI6IHRoaXMuc3RhdGUubmFtZVxuICAgIH1cbiAgICAgIHRoaXMucHJvcHMuc29ja2V0LmVtaXQoJ3R5cGluZycsIHR5cGluZ05vdGUpXG4gIH1cblxuICAvL1RlbGxzIHNlcnZlciB0aGF0IHRoZSB1c2VyIGlzIGRvbmUgdHlwaW5nIGJ5IHBhY2tpbmcgZ3JhYmJpbmcgdGhlIG5hbWUgb2YgdGhlIHN0YXRlIG9iamVjdCBhbmQgc2VuZGluZyBpdCB0byB0aGUgJ2VuZCB0eXBpbmcnIGV2ZW50IGxpc3RlbmVyIGluIHRoZSBzZXJ2ZXIuXG4gIGVuZFR5cGluZyhldmVudCkge1xuICAgIHZhciBlbmRUeXBpbmdOb3RlID0ge1xuICAgICAgdXNlcjogdGhpcy5zdGF0ZS5uYW1lXG4gICAgfVxuICAgIHRoaXMucHJvcHMuc29ja2V0LmVtaXQoJ2VuZCB0eXBpbmcnLCBlbmRUeXBpbmdOb3RlKVxuICB9XG5cbiAgLy8gVGhpcyBqdXN0IGtlZXBzIHRyYWNrIG9mIHdoYXQgbmlja25hbWUgdGhlIHVzZXJcbiAgLy8gaGFzIGNob3NlbiB0byB1c2VcbiAgY2hhbmdlTmFtZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG5hbWU6IHRoaXMucmVmcy5uYW1lSW5wdXQudmFsdWVcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHZhciBzZXROYW1lID0gZnVuY3Rpb24oZXJyLCBuYW1lKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHByZXZOYW1lOiBuYW1lLFxuICAgICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgYXBpSGVscGVyLmdldFVzZXJGcm9tU2Vzc2lvbihzZXROYW1lKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGZvcm0gaWQ9J2FsbENoYXRJbnB1dHMnIG9uU3VibWl0PXt0aGlzLmNoYXRTdWJtaXQuYmluZCh0aGlzKX0+XG4gICAgICAgIDxpbnB1dCBpZD0ndXNlcklkQm94JyB0eXBlPSd0ZXh0JyByZWY9J25hbWVJbnB1dCcgdmFsdWU9e3RoaXMuc3RhdGUubmFtZX0gb25DaGFuZ2U9e3RoaXMuY2hhbmdlTmFtZS5iaW5kKHRoaXMpfT48L2lucHV0PlxuICAgICAgICA8aW5wdXQgaWQ9J2NoYXRJbnB1dEJveCcgdHlwZT0ndGV4dCcgcmVmPSdtZXNzYWdlSW5wdXQnIG9uQ2hhbmdlPXt0aGlzLmNoZWNrSW5wdXQuYmluZCh0aGlzKX0+PC9pbnB1dD5cbiAgICAgICAgPGJ1dHRvbiBpZD0nY2hhdFN1Ym1pdEJ0bicgY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1kZWZhdWx0JyB0eXBlPSdzdWJtaXQnPlNlbmQ8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICApO1xuICB9XG59O1xuXG5jbGFzcyBDaGF0TWVzc2FnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdjaGF0TWVzc2FnZSc+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nY2hhdE1lc3NhZ2VVc2VyJyBjbGFzc05hbWU9J2xhYmVsIGxhYmVsLXByaW1hcnknPnt0aGlzLnByb3BzLm1lc3NhZ2UudXNlcn06PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2NoYXRNZXNzYWdlVGV4dCc+IHt0aGlzLnByb3BzLm1lc3NhZ2UudGV4dH0gPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59O1xuXG5cbmNsYXNzIENoYXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBtZXNzYWdlczogW10sXG4gICAgICBhbm9uTmFtZTogdGhpcy5nZW5Bbm9uTmFtZSgpLFxuICAgICAgdXNlckFjdGl2ZTogZmFsc2UsXG4gICAgICB0eXBpbmdVc2Vyczoge31cbiAgICB9XG5cblxuICAgIHRoaXMucHJvcHMuc29ja2V0Lm9uKCd0eXBpbmcnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzW2RhdGEudXNlcl0gPSAhdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdID8gdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdIDogdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdKys7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgdXNlckFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgdHlwaW5nVXNlcnM6IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNcbiAgICAgIH0pXG4gICAgfS5iaW5kKHRoaXMpKVxuXG5cbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbignZW5kIHR5cGluZycsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzKSB7XG4gICAgICAgIGlmIChrZXkgPT09IGRhdGEudXNlcikge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB0eXBpbmdVc2VyczogdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghT2JqZWN0LmtleXModGhpcy5zdGF0ZS50eXBpbmdVc2VycykubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1c2VyQWN0aXZlOiBmYWxzZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICB9XG5cblxuICAvLyBUaGlzIGp1c3QgZ2VuZXJhdGVzIGEgcmFuZG9tIG5hbWUgb2YgdGhlIGZvcm1cbiAgLy8gQW5vbnh4eCB3aGVyZSB4eHggaXMgYSByYW5kb20sIHRocmVlIGRpZ2l0IG51bWJlclxuICBnZW5Bbm9uTmFtZSgpIHtcbiAgICB2YXIgbnVtID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCk7XG4gICAgdmFyIG51bVN0ciA9ICcwMDAnICsgbnVtO1xuICAgIG51bVN0ciA9IG51bVN0ci5zdWJzdHJpbmcobnVtU3RyLmxlbmd0aCAtIDMpO1xuICAgIHZhciBuYW1lID0gJ0Fub24nICsgbnVtU3RyO1xuICAgIHJldHVybiBuYW1lO1xuICB9XG5cblxuICAvLyBKdXN0IGZvciB1dGlsaXR5IGluIHVwZGF0aW5nIHRoZSBjaGF0IGNvcnJlY3RseVxuICAvLyB3aXRoIHRoZSBtb3N0IHVwIHRvIGRhdGUgaW5mb3JtYXRpb25cbiAgdXBkYXRlQ2hhdCgpIHtcbiAgICB2YXIgZ2V0Q2hhdENhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciBvbiByZXRyaWV2aW5nIGNoYXQnLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbWVzc2FnZXM6IGRhdGFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBhcGlIZWxwZXIuZ2V0Q2hhdChnZXRDaGF0Q2FsbGJhY2suYmluZCh0aGlzKSk7XG4gIH1cblxuICAvLyB0byBzY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgY2hhdFxuICBzY3JvbGxUb0JvdHRvbSgpIHtcbiAgICB2YXIgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMubWVzc2FnZXNFbmQpO1xuICAgIG5vZGUuc2Nyb2xsSW50b1ZpZXcoe2Jsb2NrOiBcImVuZFwiLCBiZWhhdmlvcjogXCJzbW9vdGhcIn0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xuICB9XG5cbiAgLy8gd2hlbiB0aGUgY2hhdCB1cGRhdGVzLCBzY3JvbGwgdG8gdGhlIGJvdHRvbSB0byBkaXNwbGF5IHRoZSBtb3N0IHJlY2VudCBjaGF0XG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XG4gIH1cblxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLnR5cGluZ1VzZXJzKVxuICAgIHZhciB0aG9zZVR5cGluZyA9IChPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnR5cGluZ1VzZXJzKS5qb2luKCcsICcpLnRyaW0oKS5yZXBsYWNlKC9eLC8sICcnKSlcbiAgICB2YXIgdHlwaW5nSW5kaWNhdG9yID0gYCR7dGhvc2VUeXBpbmd9IC4gLiAuYDtcbiAgICB2YXIgY2hhdHMgPSBbXTtcblxuICAgIF8uZWFjaCh0aGlzLnN0YXRlLm1lc3NhZ2VzLCBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICBjaGF0cy5wdXNoKDxDaGF0TWVzc2FnZSBtZXNzYWdlPXttZXNzYWdlfSBrZXk9e21lc3NhZ2UuaWR9Lz4pO1xuICAgIH0pXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhdEJveFwiPlxuICAgICAgICA8ZGl2IGlkPSdjaGF0UGFuZWwnIGNsYXNzTmFtZT0ncGFuZWwgcGFuZWwtaW5mbyc+XG4gICAgICAgICAgPGRpdiBpZD0nY2hhdFRpdGxlJyBjbGFzc05hbWU9J3BhbmVsLWhlYWRpbmcnPkJvb2dpZS1DaGF0PC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nY2hhdFBhbkJvZHknIGNsYXNzTmFtZT0ncGFuZWwtYm9keSc+XG4gICAgICAgICAgICA8ZGl2IGlkPSd0ZXh0Qm9keSc+e2NoYXRzfVxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlID0ge3tmbG9hdDogXCJsZWZ0XCIsIGNsZWFyOiBcImJvdGhcIn19IHJlZj17KGVsKSA9PiB7IHRoaXMubWVzc2FnZXNFbmQgPSBlbDsgfX0+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGlkPSd0eXBpbmctaW5kaWNhdG9yJyBjbGFzc05hbWU9eyh0aGlzLnN0YXRlLnVzZXJBY3RpdmUgPyAndHlwaW5nLWluZGljYXRvciBzaG93JyA6ICdoaWRkZW4nKX0+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtY29tbWVudHNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+XG4gICAgICAgICAgICAgICAge3R5cGluZ0luZGljYXRvcn08L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBpZD0naXNUeXBpbmcnIGNsYXNzTmFtZT0ndHlwaW5nLW5vdGlmaWNhdGlvbic+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBpZD0nY2hhdFBhbkZ0cicgY2xhc3NOYW1lPSdwYW5lbC1mb290ZXInPlxuICAgICAgICAgICAgPENoYXRJbnB1dCBtZXNzYWdlcz17dGhpcy5zdGF0ZS5tZXNzYWdlc30gbmFtZT17dGhpcy5zdGF0ZS5hbm9uTmFtZX0gdXBkYXRlQ2hhdD17dGhpcy51cGRhdGVDaGF0LmJpbmQodGhpcyl9IHNvY2tldD17dGhpcy5wcm9wcy5zb2NrZXR9Lz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn07XG5cblxuXG53aW5kb3cuQ2hhdCA9IENoYXQ7Il19