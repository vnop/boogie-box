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
      this.props.updateChat();
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

      apiHelper.postChat(newMessage);
      this.state.messages.push(newMessage);
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
    value: function componentDidMount() {}
    // this.scrollToBottom();

    // when the chat updates, scroll to the bottom to display the most recent chat

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // this.scrollToBottom();
    }
  }, {
    key: 'render',
    value: function render() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9jaGF0LmpzeCJdLCJuYW1lcyI6WyJDaGF0SW5wdXQiLCJwcm9wcyIsImNvbnNvbGUiLCJsb2ciLCJzdGF0ZSIsInByZXZOYW1lIiwibmFtZSIsIm1lc3NhZ2VzIiwidHlwaW5nIiwidXBkYXRlQ2hhdCIsInNvY2tldCIsIm9uIiwiZGF0YSIsIm5ld01lc3NhZ2UiLCJ1c2VyIiwidGV4dCIsImlkIiwibGVuZ3RoIiwiYmluZCIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJtZXNzYWdlVGV4dCIsInJlZnMiLCJtZXNzYWdlSW5wdXQiLCJ2YWx1ZSIsInNldFN0YXRlIiwibmFtZUlucHV0IiwiYW5ub3VuY2VOYW1lQ2hhbmdlIiwiZW1pdCIsInB1c2giLCJhcGlIZWxwZXIiLCJwb3N0VXNlclRvU2Vzc2lvbiIsInBvc3RDaGF0IiwiZW5kVHlwaW5nIiwiY2hhdFR5cGluZyIsInR5cGluZ05vdGUiLCJlbmRUeXBpbmdOb3RlIiwic2V0TmFtZSIsImVyciIsImVycm9yIiwiZ2V0VXNlckZyb21TZXNzaW9uIiwiY2hhdFN1Ym1pdCIsImNoYW5nZU5hbWUiLCJjaGVja0lucHV0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJDaGF0TWVzc2FnZSIsIm1lc3NhZ2UiLCJDaGF0IiwiYW5vbk5hbWUiLCJnZW5Bbm9uTmFtZSIsInVzZXJBY3RpdmUiLCJ0eXBpbmdVc2VycyIsImtleSIsIk9iamVjdCIsImtleXMiLCJudW0iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJudW1TdHIiLCJzdWJzdHJpbmciLCJnZXRDaGF0Q2FsbGJhY2siLCJnZXRDaGF0Iiwibm9kZSIsIlJlYWN0RE9NIiwiZmluZERPTU5vZGUiLCJtZXNzYWdlc0VuZCIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJiZWhhdmlvciIsInRob3NlVHlwaW5nIiwiam9pbiIsInRyaW0iLCJyZXBsYWNlIiwidHlwaW5nSW5kaWNhdG9yIiwiY2hhdHMiLCJfIiwiZWFjaCIsIndpbmRvdyJd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QUNELE9BRkQ7QUFHQSxhQUNFO0FBQUE7QUFBQSxVQUFLLFdBQVUsU0FBZjtBQUNFO0FBQUE7QUFBQSxZQUFLLElBQUcsV0FBUixFQUFvQixXQUFVLGtCQUE5QjtBQUNFO0FBQUE7QUFBQSxjQUFLLElBQUcsV0FBUixFQUFvQixXQUFVLGVBQTlCO0FBQUE7QUFBQSxXQURGO0FBRUU7QUFBQTtBQUFBLGNBQUssSUFBRyxhQUFSLEVBQXNCLFdBQVUsWUFBaEM7QUFDRTtBQUFBO0FBQUEsZ0JBQUssSUFBRyxVQUFSO0FBQW9CNEQsbUJBQXBCO0FBQ0U7QUFBQTtBQUFBLGtCQUFLLElBQUcsa0JBQVIsRUFBMkIsV0FBWSxLQUFLeEUsS0FBTCxDQUFXK0MsVUFBWCxHQUF3Qix1QkFBeEIsR0FBa0QsUUFBekY7QUFDRSwyQ0FBRyxXQUFVLGdCQUFiLEVBQThCLGVBQVksTUFBMUMsR0FERjtBQUVHd0I7QUFGSCxlQURGO0FBSUUsMkNBQUssSUFBRyxVQUFSLEVBQW1CLFdBQVUscUJBQTdCO0FBSkY7QUFERixXQUZGO0FBV0U7QUFBQTtBQUFBLGNBQUssSUFBRyxZQUFSLEVBQXFCLFdBQVUsY0FBL0I7QUFDRSxnQ0FBQyxTQUFELElBQVcsVUFBVSxLQUFLdkUsS0FBTCxDQUFXRyxRQUFoQyxFQUEwQyxNQUFNLEtBQUtILEtBQUwsQ0FBVzZDLFFBQTNELEVBQXFFLFlBQVksS0FBS3hDLFVBQUwsQ0FBZ0JTLElBQWhCLENBQXFCLElBQXJCLENBQWpGLEVBQTZHLFFBQVEsS0FBS2pCLEtBQUwsQ0FBV1MsTUFBaEk7QUFERjtBQVhGO0FBREYsT0FERjtBQW1CRDs7OztFQS9GZ0JrQyxNQUFNQyxTOztBQWdHeEI7QUFDRGtDLE9BQU8vQixJQUFQLEdBQWNBLElBQWQiLCJmaWxlIjoiY2hhdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJlYWN0IGNvbXBvbmVudCBmb3IgaGFuZGxpbmcgdGhlIHNlbmRpbmcgb2YgbmV3IGNoYXRzXG5jbGFzcyBDaGF0SW5wdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBjb25zb2xlLmxvZyhwcm9wcylcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcHJldk5hbWU6IHRoaXMucHJvcHMubmFtZSxcbiAgICAgIG5hbWU6IHRoaXMucHJvcHMubmFtZSxcbiAgICAgIG1lc3NhZ2VzOiB0aGlzLnByb3BzLm1lc3NhZ2VzLFxuICAgICAgdHlwaW5nOiBmYWxzZVxuICAgIH1cbiAgICAvLyBNZXNzYWdlcyB3aWxsIHJlbmRlciBvbiBsb2FkXG4gICAgdGhpcy5wcm9wcy51cGRhdGVDaGF0KCk7XG4gICAgLy8gSGFuZGxlcyByZWNlaXZpbmcgbmV3IG1lc3NhZ2VzIGZyb20gdGhlIHNvY2tldFxuICAgIC8vIE5vdGU6IE9ubHkgdXNlcnMgd2hvIGRpZG4ndCBzZW5kIHRoZSBtZXNzYWdlIHdpbGxcbiAgICAvLyByZWNlaXZlIHRoaXMuIFRoZSBzZW5kZXIncyBjbGllbnQgd2lsbCB0cmFjayBpdFxuICAgIC8vIGZvciB0aGVtIHNhbnMgc29ja2V0IHRvIGN1dCBkb3duIG9uIHVubmVjZXNzYXJ5XG4gICAgLy8gc29ja2V0IGNvbW11bmljYXRpb25zLlxuICAgIHRoaXMucHJvcHMuc29ja2V0Lm9uKCduZXcgbWVzc2FnZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBuZXdNZXNzYWdlID0ge1xuICAgICAgICB1c2VyOiBkYXRhLnVzZXIsXG4gICAgICAgIHRleHQ6IGRhdGEudGV4dCxcbiAgICAgICAgaWQ6IHRoaXMuc3RhdGUubWVzc2FnZXMubGVuZ3RoXG4gICAgICB9O1xuICAgICAgdGhpcy5wcm9wcy51cGRhdGVDaGF0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfVxuICAvLyBIYW5kbGVzIGFsbCBpbmZvIHdoZW4gdGhlIHVzZXIgc3VibWl0cyBhIGNoYXQuXG4gIC8vIFRoaXMgaW5jbHVkZXMgY2hhbmdpbmcgb2YgbmFtZXMsIHN0b3JpbmcgeW91ciBvd25cbiAgLy8gbWVzc2FnZXMsIGV0Yy5cbiAgY2hhdFN1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIG1lc3NhZ2VUZXh0ID0gdGhpcy5yZWZzLm1lc3NhZ2VJbnB1dC52YWx1ZTtcbiAgICB2YXIgcHJldk5hbWUgPSB0aGlzLnN0YXRlLnByZXZOYW1lO1xuICAgIHRoaXMucmVmcy5tZXNzYWdlSW5wdXQudmFsdWUgPSAnJztcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByZXZOYW1lOiB0aGlzLnJlZnMubmFtZUlucHV0LnZhbHVlXG4gICAgfSk7XG4gICAgaWYocHJldk5hbWUgIT09IHRoaXMuc3RhdGUubmFtZSkge1xuICAgICAgdmFyIGFubm91bmNlTmFtZUNoYW5nZSA9IHtcbiAgICAgICAgdXNlcjogcHJldk5hbWUsXG4gICAgICAgIHRleHQ6ICdJIGNoYW5nZWQgbXkgbmFtZSB0byBcXCcnICsgdGhpcy5zdGF0ZS5uYW1lICsgJ1xcJydcbiAgICAgIH07XG4gICAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCduZXcgbWVzc2FnZScsIGFubm91bmNlTmFtZUNoYW5nZSk7XG4gICAgICBhbm5vdW5jZU5hbWVDaGFuZ2UuaWQ9dGhpcy5zdGF0ZS5tZXNzYWdlcy5sZW5ndGg7XG4gICAgICB0aGlzLnN0YXRlLm1lc3NhZ2VzLnB1c2goYW5ub3VuY2VOYW1lQ2hhbmdlKTtcbiAgICAgIGFwaUhlbHBlci5wb3N0VXNlclRvU2Vzc2lvbih0aGlzLnN0YXRlLm5hbWUpO1xuICAgIH1cbiAgICB2YXIgbmV3TWVzc2FnZSA9IHtcbiAgICAgIHVzZXI6IHRoaXMuc3RhdGUubmFtZSxcbiAgICAgIHRleHQ6IG1lc3NhZ2VUZXh0XG4gICAgfTtcbiAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCduZXcgbWVzc2FnZScsIG5ld01lc3NhZ2UpO1xuICAgIG5ld01lc3NhZ2UuaWQ9dGhpcy5zdGF0ZS5tZXNzYWdlcy5sZW5ndGg7XG5cbiAgICBhcGlIZWxwZXIucG9zdENoYXQobmV3TWVzc2FnZSk7XG4gICAgdGhpcy5zdGF0ZS5tZXNzYWdlcy5wdXNoKG5ld01lc3NhZ2UpO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBtZXNzYWdlczogdGhpcy5zdGF0ZS5tZXNzYWdlcyB9KTtcbiAgICB0aGlzLnByb3BzLnVwZGF0ZUNoYXQoKTtcbiAgICB0aGlzLmVuZFR5cGluZygpO1xuICB9XG4gIC8vV2hlbmV2ZXIgdGhlIHRoZSBjaGF0IGlucHV0IGNoYW5nZXMsIHdoaWNoIGlzIHRvIHNheSB3aGVuZXZlciBhIHVzZXIgYWRkcyBvciByZW1vdmVzIGEgY2hhcmFjdGVyIGZyb20gdGhlIG1lc3NhZ2UgaW5wdXQsIHRoaXMgY2hlY2tzIHRvIHNlZSBpZiB0aGUgc3RyaW5nIGlzIGVtcHR5IG9yIG5vdC4gSWYgaXQgaXMsIGFueSB0eXBpbmcgbm90aWZpY2F0aW9uIGlzIHJlbW92ZWQuIENvbnZlcnNlbHksIGlmIHRoZSB1c2VyIGlzIHR5cGluZywgdGhlIHR5cGluZyBub3RpZmljYXRpb24gaXMgZGlzcGxheWVkIHRvIG90aGVyIHVzZXJzLlxuICBjaGVja0lucHV0KGV2ZW50KSB7XG4gICAgaWYgKHRoaXMucmVmcy5tZXNzYWdlSW5wdXQudmFsdWUpIHtcbiAgICAgICAgdGhpcy5jaGF0VHlwaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5kVHlwaW5nKCk7XG4gICAgfVxuICB9XG4gIC8vSWYgdXNlciBpcyB0eXBpbmcsIHRoaXMgc2VuZHMgdGhlIHVzZXJuYW1lIHRvIHRoZSB0eXBpbmcgZXZlbnQgbGlzdGVuZXIgaW4gdGhlIHNlcnZlciB0byBkaXNwbGF5IHRvIG90aGVyIHVzZXJzIGEgdHlwaW5nIGluZGljYXRvci5cbiAgY2hhdFR5cGluZyhldmVudCkge1xuICAgIHZhciB0eXBpbmdOb3RlID0ge1xuICAgICAgdXNlcjogdGhpcy5zdGF0ZS5uYW1lXG4gICAgfVxuICAgICAgdGhpcy5wcm9wcy5zb2NrZXQuZW1pdCgndHlwaW5nJywgdHlwaW5nTm90ZSlcbiAgfVxuICAvL1RlbGxzIHNlcnZlciB0aGF0IHRoZSB1c2VyIGlzIGRvbmUgdHlwaW5nIGJ5IHBhY2tpbmcgZ3JhYmJpbmcgdGhlIG5hbWUgb2YgdGhlIHN0YXRlIG9iamVjdCBhbmQgc2VuZGluZyBpdCB0byB0aGUgJ2VuZCB0eXBpbmcnIGV2ZW50IGxpc3RlbmVyIGluIHRoZSBzZXJ2ZXIuXG4gIGVuZFR5cGluZyhldmVudCkge1xuICAgIHZhciBlbmRUeXBpbmdOb3RlID0ge1xuICAgICAgdXNlcjogdGhpcy5zdGF0ZS5uYW1lXG4gICAgfVxuICAgIHRoaXMucHJvcHMuc29ja2V0LmVtaXQoJ2VuZCB0eXBpbmcnLCBlbmRUeXBpbmdOb3RlKVxuICB9XG4gIC8vIFRoaXMganVzdCBrZWVwcyB0cmFjayBvZiB3aGF0IG5pY2tuYW1lIHRoZSB1c2VyXG4gIC8vIGhhcyBjaG9zZW4gdG8gdXNlXG4gIGNoYW5nZU5hbWUoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBuYW1lOiB0aGlzLnJlZnMubmFtZUlucHV0LnZhbHVlXG4gICAgfSk7XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHNldE5hbWUgPSBmdW5jdGlvbihlcnIsIG5hbWUpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcHJldk5hbWU6IG5hbWUsXG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcyk7XG4gICAgYXBpSGVscGVyLmdldFVzZXJGcm9tU2Vzc2lvbihzZXROYW1lKTtcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxmb3JtIGlkPSdhbGxDaGF0SW5wdXRzJyBvblN1Ym1pdD17dGhpcy5jaGF0U3VibWl0LmJpbmQodGhpcyl9PlxuICAgICAgICA8aW5wdXQgaWQ9J3VzZXJJZEJveCcgdHlwZT0ndGV4dCcgcmVmPSduYW1lSW5wdXQnIHZhbHVlPXt0aGlzLnN0YXRlLm5hbWV9IG9uQ2hhbmdlPXt0aGlzLmNoYW5nZU5hbWUuYmluZCh0aGlzKX0+PC9pbnB1dD5cbiAgICAgICAgPGlucHV0IGlkPSdjaGF0SW5wdXRCb3gnIHR5cGU9J3RleHQnIHJlZj0nbWVzc2FnZUlucHV0JyBvbkNoYW5nZT17dGhpcy5jaGVja0lucHV0LmJpbmQodGhpcyl9PjwvaW5wdXQ+XG4gICAgICAgIDxidXR0b24gaWQ9J2NoYXRTdWJtaXRCdG4nIGNsYXNzTmFtZT0nYnRuIGJ0bi1zbSBidG4tZGVmYXVsdCcgdHlwZT0nc3VibWl0Jz5TZW5kPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxufTtcbmNsYXNzIENoYXRNZXNzYWdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0nY2hhdE1lc3NhZ2UnPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2NoYXRNZXNzYWdlVXNlcicgY2xhc3NOYW1lPSdsYWJlbCBsYWJlbC1wcmltYXJ5Jz57dGhpcy5wcm9wcy5tZXNzYWdlLnVzZXJ9Ojwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdjaGF0TWVzc2FnZVRleHQnPiB7dGhpcy5wcm9wcy5tZXNzYWdlLnRleHR9IDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn07XG5jbGFzcyBDaGF0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1lc3NhZ2VzOiBbXSxcbiAgICAgIGFub25OYW1lOiB0aGlzLmdlbkFub25OYW1lKCksXG4gICAgICB1c2VyQWN0aXZlOiBmYWxzZSxcbiAgICAgIHR5cGluZ1VzZXJzOiB7fVxuICAgIH1cbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbigndHlwaW5nJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdID0gIXRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSA/IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSA6IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSsrO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHVzZXJBY3RpdmU6IHRydWUsXG4gICAgICAgIHR5cGluZ1VzZXJzOiB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzXG4gICAgICB9KVxuICAgIH0uYmluZCh0aGlzKSlcbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbignZW5kIHR5cGluZycsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzKSB7XG4gICAgICAgIGlmIChrZXkgPT09IGRhdGEudXNlcikge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB0eXBpbmdVc2VyczogdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghT2JqZWN0LmtleXModGhpcy5zdGF0ZS50eXBpbmdVc2VycykubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1c2VyQWN0aXZlOiBmYWxzZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfVxuICAvLyBUaGlzIGp1c3QgZ2VuZXJhdGVzIGEgcmFuZG9tIG5hbWUgb2YgdGhlIGZvcm1cbiAgLy8gQW5vbnh4eCB3aGVyZSB4eHggaXMgYSByYW5kb20sIHRocmVlIGRpZ2l0IG51bWJlclxuICBnZW5Bbm9uTmFtZSgpIHtcbiAgICB2YXIgbnVtID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCk7XG4gICAgdmFyIG51bVN0ciA9ICcwMDAnICsgbnVtO1xuICAgIG51bVN0ciA9IG51bVN0ci5zdWJzdHJpbmcobnVtU3RyLmxlbmd0aCAtIDMpO1xuICAgIHZhciBuYW1lID0gJ0Fub24nICsgbnVtU3RyO1xuICAgIHJldHVybiBuYW1lO1xuICB9XG4gIC8vIEp1c3QgZm9yIHV0aWxpdHkgaW4gdXBkYXRpbmcgdGhlIGNoYXQgY29ycmVjdGx5XG4gIC8vIHdpdGggdGhlIG1vc3QgdXAgdG8gZGF0ZSBpbmZvcm1hdGlvblxuICB1cGRhdGVDaGF0KCkge1xuICAgIHZhciBnZXRDaGF0Q2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIG9uIHJldHJpZXZpbmcgY2hhdCcsIGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBtZXNzYWdlczogZGF0YVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFwaUhlbHBlci5nZXRDaGF0KGdldENoYXRDYWxsYmFjay5iaW5kKHRoaXMpKTtcbiAgfVxuICAvLyB0byBzY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgY2hhdFxuICBzY3JvbGxUb0JvdHRvbSgpIHtcbiAgICB2YXIgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMubWVzc2FnZXNFbmQpO1xuICAgIG5vZGUuc2Nyb2xsSW50b1ZpZXcoe2Jsb2NrOiBcImVuZFwiLCBiZWhhdmlvcjogXCJzbW9vdGhcIn0pO1xuICB9XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIC8vIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuICAvLyB3aGVuIHRoZSBjaGF0IHVwZGF0ZXMsIHNjcm9sbCB0byB0aGUgYm90dG9tIHRvIGRpc3BsYXkgdGhlIG1vc3QgcmVjZW50IGNoYXRcbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIC8vIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5zdGF0ZS50eXBpbmdVc2VycylcbiAgICB2YXIgdGhvc2VUeXBpbmcgPSAoT2JqZWN0LmtleXModGhpcy5zdGF0ZS50eXBpbmdVc2Vycykuam9pbignLCAnKS50cmltKCkucmVwbGFjZSgvXiwvLCAnJykpXG4gICAgdmFyIHR5cGluZ0luZGljYXRvciA9IGAke3Rob3NlVHlwaW5nfSAuIC4gLmA7XG4gICAgdmFyIGNoYXRzID0gW107XG4gICAgXy5lYWNoKHRoaXMuc3RhdGUubWVzc2FnZXMsIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGNoYXRzLnB1c2goPENoYXRNZXNzYWdlIG1lc3NhZ2U9e21lc3NhZ2V9IGtleT17bWVzc2FnZS5pZH0vPik7XG4gICAgfSlcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGF0Qm94XCI+XG4gICAgICAgIDxkaXYgaWQ9J2NoYXRQYW5lbCcgY2xhc3NOYW1lPSdwYW5lbCBwYW5lbC1pbmZvJz5cbiAgICAgICAgICA8ZGl2IGlkPSdjaGF0VGl0bGUnIGNsYXNzTmFtZT0ncGFuZWwtaGVhZGluZyc+Qm9vZ2llLUNoYXQ8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdjaGF0UGFuQm9keScgY2xhc3NOYW1lPSdwYW5lbC1ib2R5Jz5cbiAgICAgICAgICAgIDxkaXYgaWQ9J3RleHRCb2R5Jz57Y2hhdHN9XG4gICAgICAgICAgICAgIDxkaXYgaWQ9J3R5cGluZy1pbmRpY2F0b3InIGNsYXNzTmFtZT17KHRoaXMuc3RhdGUudXNlckFjdGl2ZSA/ICd0eXBpbmctaW5kaWNhdG9yIHNob3cnIDogJ2hpZGRlbicpfT5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1jb21tZW50c1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cbiAgICAgICAgICAgICAgICB7dHlwaW5nSW5kaWNhdG9yfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGlkPSdpc1R5cGluZycgY2xhc3NOYW1lPSd0eXBpbmctbm90aWZpY2F0aW9uJz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdjaGF0UGFuRnRyJyBjbGFzc05hbWU9J3BhbmVsLWZvb3Rlcic+XG4gICAgICAgICAgICA8Q2hhdElucHV0IG1lc3NhZ2VzPXt0aGlzLnN0YXRlLm1lc3NhZ2VzfSBuYW1lPXt0aGlzLnN0YXRlLmFub25OYW1lfSB1cGRhdGVDaGF0PXt0aGlzLnVwZGF0ZUNoYXQuYmluZCh0aGlzKX0gc29ja2V0PXt0aGlzLnByb3BzLnNvY2tldH0vPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufTtcbndpbmRvdy5DaGF0ID0gQ2hhdDsiXX0=