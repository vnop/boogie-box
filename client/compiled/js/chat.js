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

        apiHelper.postUserToSession(this.state.name);
      }
      var newMessage = {
        user: this.state.name,
        text: messageText
      };
      this.props.socket.emit('new message', newMessage);
      newMessage.id = this.state.messages.length;

      apiHelper.postChat(newMessage, function () {
        this.props.updateChat();
      });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9jaGF0LmpzeCJdLCJuYW1lcyI6WyJDaGF0SW5wdXQiLCJwcm9wcyIsImNvbnNvbGUiLCJsb2ciLCJzdGF0ZSIsInByZXZOYW1lIiwibmFtZSIsIm1lc3NhZ2VzIiwidHlwaW5nIiwidXBkYXRlQ2hhdCIsInNvY2tldCIsIm9uIiwiZGF0YSIsIm5ld01lc3NhZ2UiLCJ1c2VyIiwidGV4dCIsImlkIiwibGVuZ3RoIiwiYmluZCIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJtZXNzYWdlVGV4dCIsInJlZnMiLCJtZXNzYWdlSW5wdXQiLCJ2YWx1ZSIsInNldFN0YXRlIiwibmFtZUlucHV0IiwiYW5ub3VuY2VOYW1lQ2hhbmdlIiwiZW1pdCIsImFwaUhlbHBlciIsInBvc3RVc2VyVG9TZXNzaW9uIiwicG9zdENoYXQiLCJlbmRUeXBpbmciLCJjaGF0VHlwaW5nIiwidHlwaW5nTm90ZSIsImVuZFR5cGluZ05vdGUiLCJzZXROYW1lIiwiZXJyIiwiZXJyb3IiLCJnZXRVc2VyRnJvbVNlc3Npb24iLCJjaGF0U3VibWl0IiwiY2hhbmdlTmFtZSIsImNoZWNrSW5wdXQiLCJSZWFjdCIsIkNvbXBvbmVudCIsIkNoYXRNZXNzYWdlIiwibWVzc2FnZSIsIkNoYXQiLCJhbm9uTmFtZSIsImdlbkFub25OYW1lIiwidXNlckFjdGl2ZSIsInR5cGluZ1VzZXJzIiwia2V5IiwiT2JqZWN0Iiwia2V5cyIsIm51bSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsIm51bVN0ciIsInN1YnN0cmluZyIsImdldENoYXRDYWxsYmFjayIsImdldENoYXQiLCJub2RlIiwiUmVhY3RET00iLCJmaW5kRE9NTm9kZSIsIm1lc3NhZ2VzRW5kIiwic2Nyb2xsSW50b1ZpZXciLCJibG9jayIsImJlaGF2aW9yIiwidGhvc2VUeXBpbmciLCJqb2luIiwidHJpbSIsInJlcGxhY2UiLCJ0eXBpbmdJbmRpY2F0b3IiLCJjaGF0cyIsIl8iLCJlYWNoIiwicHVzaCIsIndpbmRvdyJd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QURGO0FBRUU7QUFBQTtBQUFBLGNBQUssSUFBRyxhQUFSLEVBQXNCLFdBQVUsWUFBaEM7QUFDRTtBQUFBO0FBQUEsZ0JBQUssSUFBRyxVQUFSO0FBQW9CMkQsbUJBQXBCO0FBQ0U7QUFBQTtBQUFBLGtCQUFLLElBQUcsa0JBQVIsRUFBMkIsV0FBWSxLQUFLdkUsS0FBTCxDQUFXOEMsVUFBWCxHQUF3Qix1QkFBeEIsR0FBa0QsUUFBekY7QUFDRSwyQ0FBRyxXQUFVLGdCQUFiLEVBQThCLGVBQVksTUFBMUMsR0FERjtBQUVHd0I7QUFGSCxlQURGO0FBSUUsMkNBQUssSUFBRyxVQUFSLEVBQW1CLFdBQVUscUJBQTdCO0FBSkY7QUFERixXQUZGO0FBV0U7QUFBQTtBQUFBLGNBQUssSUFBRyxZQUFSLEVBQXFCLFdBQVUsY0FBL0I7QUFDRSxnQ0FBQyxTQUFELElBQVcsVUFBVSxLQUFLdEUsS0FBTCxDQUFXRyxRQUFoQyxFQUEwQyxNQUFNLEtBQUtILEtBQUwsQ0FBVzRDLFFBQTNELEVBQXFFLFlBQVksS0FBS3ZDLFVBQUwsQ0FBZ0JTLElBQWhCLENBQXFCLElBQXJCLENBQWpGLEVBQTZHLFFBQVEsS0FBS2pCLEtBQUwsQ0FBV1MsTUFBaEk7QUFERjtBQVhGO0FBREYsT0FERjtBQW1CRDs7OztFQS9GZ0JpQyxNQUFNQyxTOztBQWdHeEI7QUFDRG1DLE9BQU9oQyxJQUFQLEdBQWNBLElBQWQiLCJmaWxlIjoiY2hhdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJlYWN0IGNvbXBvbmVudCBmb3IgaGFuZGxpbmcgdGhlIHNlbmRpbmcgb2YgbmV3IGNoYXRzXG5jbGFzcyBDaGF0SW5wdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBjb25zb2xlLmxvZyhwcm9wcylcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcHJldk5hbWU6IHRoaXMucHJvcHMubmFtZSxcbiAgICAgIG5hbWU6IHRoaXMucHJvcHMubmFtZSxcbiAgICAgIG1lc3NhZ2VzOiB0aGlzLnByb3BzLm1lc3NhZ2VzLFxuICAgICAgdHlwaW5nOiBmYWxzZVxuICAgIH1cbiAgICAvLyBNZXNzYWdlcyB3aWxsIHJlbmRlciBvbiBsb2FkXG4gICAgdGhpcy5wcm9wcy51cGRhdGVDaGF0KCk7XG4gICAgLy8gSGFuZGxlcyByZWNlaXZpbmcgbmV3IG1lc3NhZ2VzIGZyb20gdGhlIHNvY2tldFxuICAgIC8vIE5vdGU6IE9ubHkgdXNlcnMgd2hvIGRpZG4ndCBzZW5kIHRoZSBtZXNzYWdlIHdpbGxcbiAgICAvLyByZWNlaXZlIHRoaXMuIFRoZSBzZW5kZXIncyBjbGllbnQgd2lsbCB0cmFjayBpdFxuICAgIC8vIGZvciB0aGVtIHNhbnMgc29ja2V0IHRvIGN1dCBkb3duIG9uIHVubmVjZXNzYXJ5XG4gICAgLy8gc29ja2V0IGNvbW11bmljYXRpb25zLlxuICAgIHRoaXMucHJvcHMuc29ja2V0Lm9uKCduZXcgbWVzc2FnZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBuZXdNZXNzYWdlID0ge1xuICAgICAgICB1c2VyOiBkYXRhLnVzZXIsXG4gICAgICAgIHRleHQ6IGRhdGEudGV4dCxcbiAgICAgICAgaWQ6IHRoaXMuc3RhdGUubWVzc2FnZXMubGVuZ3RoXG4gICAgICB9O1xuICAgICAgdGhpcy5wcm9wcy51cGRhdGVDaGF0KCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfVxuICAvLyBIYW5kbGVzIGFsbCBpbmZvIHdoZW4gdGhlIHVzZXIgc3VibWl0cyBhIGNoYXQuXG4gIC8vIFRoaXMgaW5jbHVkZXMgY2hhbmdpbmcgb2YgbmFtZXMsIHN0b3JpbmcgeW91ciBvd25cbiAgLy8gbWVzc2FnZXMsIGV0Yy5cbiAgY2hhdFN1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyIG1lc3NhZ2VUZXh0ID0gdGhpcy5yZWZzLm1lc3NhZ2VJbnB1dC52YWx1ZTtcbiAgICB2YXIgcHJldk5hbWUgPSB0aGlzLnN0YXRlLnByZXZOYW1lO1xuICAgIHRoaXMucmVmcy5tZXNzYWdlSW5wdXQudmFsdWUgPSAnJztcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByZXZOYW1lOiB0aGlzLnJlZnMubmFtZUlucHV0LnZhbHVlXG4gICAgfSk7XG4gICAgaWYocHJldk5hbWUgIT09IHRoaXMuc3RhdGUubmFtZSkge1xuICAgICAgdmFyIGFubm91bmNlTmFtZUNoYW5nZSA9IHtcbiAgICAgICAgdXNlcjogcHJldk5hbWUsXG4gICAgICAgIHRleHQ6ICdJIGNoYW5nZWQgbXkgbmFtZSB0byBcXCcnICsgdGhpcy5zdGF0ZS5uYW1lICsgJ1xcJydcbiAgICAgIH07XG4gICAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCduZXcgbWVzc2FnZScsIGFubm91bmNlTmFtZUNoYW5nZSk7XG4gICAgICBhbm5vdW5jZU5hbWVDaGFuZ2UuaWQ9dGhpcy5zdGF0ZS5tZXNzYWdlcy5sZW5ndGg7XG5cbiAgICAgIGFwaUhlbHBlci5wb3N0VXNlclRvU2Vzc2lvbih0aGlzLnN0YXRlLm5hbWUpO1xuICAgIH1cbiAgICB2YXIgbmV3TWVzc2FnZSA9IHtcbiAgICAgIHVzZXI6IHRoaXMuc3RhdGUubmFtZSxcbiAgICAgIHRleHQ6IG1lc3NhZ2VUZXh0XG4gICAgfTtcbiAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCduZXcgbWVzc2FnZScsIG5ld01lc3NhZ2UpO1xuICAgIG5ld01lc3NhZ2UuaWQgPSB0aGlzLnN0YXRlLm1lc3NhZ2VzLmxlbmd0aDtcblxuICAgIGFwaUhlbHBlci5wb3N0Q2hhdChuZXdNZXNzYWdlLCBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucHJvcHMudXBkYXRlQ2hhdCgpO1xuICAgIH0pO1xuICAgIHRoaXMuZW5kVHlwaW5nKCk7XG4gIH1cbiAgLy9XaGVuZXZlciB0aGUgdGhlIGNoYXQgaW5wdXQgY2hhbmdlcywgd2hpY2ggaXMgdG8gc2F5IHdoZW5ldmVyIGEgdXNlciBhZGRzIG9yIHJlbW92ZXMgYSBjaGFyYWN0ZXIgZnJvbSB0aGUgbWVzc2FnZSBpbnB1dCwgdGhpcyBjaGVja3MgdG8gc2VlIGlmIHRoZSBzdHJpbmcgaXMgZW1wdHkgb3Igbm90LiBJZiBpdCBpcywgYW55IHR5cGluZyBub3RpZmljYXRpb24gaXMgcmVtb3ZlZC4gQ29udmVyc2VseSwgaWYgdGhlIHVzZXIgaXMgdHlwaW5nLCB0aGUgdHlwaW5nIG5vdGlmaWNhdGlvbiBpcyBkaXNwbGF5ZWQgdG8gb3RoZXIgdXNlcnMuXG4gIGNoZWNrSW5wdXQoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5yZWZzLm1lc3NhZ2VJbnB1dC52YWx1ZSkge1xuICAgICAgICB0aGlzLmNoYXRUeXBpbmcoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbmRUeXBpbmcoKTtcbiAgICB9XG4gIH1cbiAgLy9JZiB1c2VyIGlzIHR5cGluZywgdGhpcyBzZW5kcyB0aGUgdXNlcm5hbWUgdG8gdGhlIHR5cGluZyBldmVudCBsaXN0ZW5lciBpbiB0aGUgc2VydmVyIHRvIGRpc3BsYXkgdG8gb3RoZXIgdXNlcnMgYSB0eXBpbmcgaW5kaWNhdG9yLlxuICBjaGF0VHlwaW5nKGV2ZW50KSB7XG4gICAgdmFyIHR5cGluZ05vdGUgPSB7XG4gICAgICB1c2VyOiB0aGlzLnN0YXRlLm5hbWVcbiAgICB9XG4gICAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCd0eXBpbmcnLCB0eXBpbmdOb3RlKVxuICB9XG4gIC8vVGVsbHMgc2VydmVyIHRoYXQgdGhlIHVzZXIgaXMgZG9uZSB0eXBpbmcgYnkgcGFja2luZyBncmFiYmluZyB0aGUgbmFtZSBvZiB0aGUgc3RhdGUgb2JqZWN0IGFuZCBzZW5kaW5nIGl0IHRvIHRoZSAnZW5kIHR5cGluZycgZXZlbnQgbGlzdGVuZXIgaW4gdGhlIHNlcnZlci5cbiAgZW5kVHlwaW5nKGV2ZW50KSB7XG4gICAgdmFyIGVuZFR5cGluZ05vdGUgPSB7XG4gICAgICB1c2VyOiB0aGlzLnN0YXRlLm5hbWVcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5zb2NrZXQuZW1pdCgnZW5kIHR5cGluZycsIGVuZFR5cGluZ05vdGUpXG4gIH1cbiAgLy8gVGhpcyBqdXN0IGtlZXBzIHRyYWNrIG9mIHdoYXQgbmlja25hbWUgdGhlIHVzZXJcbiAgLy8gaGFzIGNob3NlbiB0byB1c2VcbiAgY2hhbmdlTmFtZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG5hbWU6IHRoaXMucmVmcy5uYW1lSW5wdXQudmFsdWVcbiAgICB9KTtcbiAgfVxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB2YXIgc2V0TmFtZSA9IGZ1bmN0aW9uKGVyciwgbmFtZSkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBwcmV2TmFtZTogbmFtZSxcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcbiAgICBhcGlIZWxwZXIuZ2V0VXNlckZyb21TZXNzaW9uKHNldE5hbWUpO1xuICB9XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGZvcm0gaWQ9J2FsbENoYXRJbnB1dHMnIG9uU3VibWl0PXt0aGlzLmNoYXRTdWJtaXQuYmluZCh0aGlzKX0+XG4gICAgICAgIDxpbnB1dCBpZD0ndXNlcklkQm94JyB0eXBlPSd0ZXh0JyByZWY9J25hbWVJbnB1dCcgdmFsdWU9e3RoaXMuc3RhdGUubmFtZX0gb25DaGFuZ2U9e3RoaXMuY2hhbmdlTmFtZS5iaW5kKHRoaXMpfT48L2lucHV0PlxuICAgICAgICA8aW5wdXQgaWQ9J2NoYXRJbnB1dEJveCcgdHlwZT0ndGV4dCcgcmVmPSdtZXNzYWdlSW5wdXQnIG9uQ2hhbmdlPXt0aGlzLmNoZWNrSW5wdXQuYmluZCh0aGlzKX0+PC9pbnB1dD5cbiAgICAgICAgPGJ1dHRvbiBpZD0nY2hhdFN1Ym1pdEJ0bicgY2xhc3NOYW1lPSdidG4gYnRuLXNtIGJ0bi1kZWZhdWx0JyB0eXBlPSdzdWJtaXQnPlNlbmQ8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICApO1xuICB9XG59O1xuY2xhc3MgQ2hhdE1lc3NhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSdjaGF0TWVzc2FnZSc+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nY2hhdE1lc3NhZ2VVc2VyJyBjbGFzc05hbWU9J2xhYmVsIGxhYmVsLXByaW1hcnknPnt0aGlzLnByb3BzLm1lc3NhZ2UudXNlcn06PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2NoYXRNZXNzYWdlVGV4dCc+IHt0aGlzLnByb3BzLm1lc3NhZ2UudGV4dH0gPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufTtcbmNsYXNzIENoYXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbWVzc2FnZXM6IFtdLFxuICAgICAgYW5vbk5hbWU6IHRoaXMuZ2VuQW5vbk5hbWUoKSxcbiAgICAgIHVzZXJBY3RpdmU6IGZhbHNlLFxuICAgICAgdHlwaW5nVXNlcnM6IHt9XG4gICAgfVxuICAgIHRoaXMucHJvcHMuc29ja2V0Lm9uKCd0eXBpbmcnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzW2RhdGEudXNlcl0gPSAhdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdID8gdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdIDogdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdKys7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgdXNlckFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgdHlwaW5nVXNlcnM6IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNcbiAgICAgIH0pXG4gICAgfS5iaW5kKHRoaXMpKVxuICAgIHRoaXMucHJvcHMuc29ja2V0Lm9uKCdlbmQgdHlwaW5nJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuc3RhdGUudHlwaW5nVXNlcnMpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gZGF0YS51c2VyKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuc3RhdGUudHlwaW5nVXNlcnNba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHR5cGluZ1VzZXJzOiB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnR5cGluZ1VzZXJzKS5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVzZXJBY3RpdmU6IGZhbHNlXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LmJpbmQodGhpcykpO1xuICB9XG4gIC8vIFRoaXMganVzdCBnZW5lcmF0ZXMgYSByYW5kb20gbmFtZSBvZiB0aGUgZm9ybVxuICAvLyBBbm9ueHh4IHdoZXJlIHh4eCBpcyBhIHJhbmRvbSwgdGhyZWUgZGlnaXQgbnVtYmVyXG4gIGdlbkFub25OYW1lKCkge1xuICAgIHZhciBudW0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwKTtcbiAgICB2YXIgbnVtU3RyID0gJzAwMCcgKyBudW07XG4gICAgbnVtU3RyID0gbnVtU3RyLnN1YnN0cmluZyhudW1TdHIubGVuZ3RoIC0gMyk7XG4gICAgdmFyIG5hbWUgPSAnQW5vbicgKyBudW1TdHI7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cbiAgLy8gSnVzdCBmb3IgdXRpbGl0eSBpbiB1cGRhdGluZyB0aGUgY2hhdCBjb3JyZWN0bHlcbiAgLy8gd2l0aCB0aGUgbW9zdCB1cCB0byBkYXRlIGluZm9ybWF0aW9uXG4gIHVwZGF0ZUNoYXQoKSB7XG4gICAgdmFyIGdldENoYXRDYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igb24gcmV0cmlldmluZyBjaGF0JywgZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIG1lc3NhZ2VzOiBkYXRhXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgYXBpSGVscGVyLmdldENoYXQoZ2V0Q2hhdENhbGxiYWNrLmJpbmQodGhpcykpO1xuICB9XG4gIC8vIHRvIHNjcm9sbCB0byB0aGUgYm90dG9tIG9mIHRoZSBjaGF0XG4gIHNjcm9sbFRvQm90dG9tKCkge1xuICAgIHZhciBub2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5tZXNzYWdlc0VuZCk7XG4gICAgbm9kZS5zY3JvbGxJbnRvVmlldyh7YmxvY2s6IFwiZW5kXCIsIGJlaGF2aW9yOiBcInNtb290aFwifSk7XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xuICB9XG4gIC8vIHdoZW4gdGhlIGNoYXQgdXBkYXRlcywgc2Nyb2xsIHRvIHRoZSBib3R0b20gdG8gZGlzcGxheSB0aGUgbW9zdCByZWNlbnQgY2hhdFxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgLy8gdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xuICB9XG4gIHJlbmRlcigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLnR5cGluZ1VzZXJzKVxuICAgIHZhciB0aG9zZVR5cGluZyA9IChPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnR5cGluZ1VzZXJzKS5qb2luKCcsICcpLnRyaW0oKS5yZXBsYWNlKC9eLC8sICcnKSlcbiAgICB2YXIgdHlwaW5nSW5kaWNhdG9yID0gYCR7dGhvc2VUeXBpbmd9IC4gLiAuYDtcbiAgICB2YXIgY2hhdHMgPSBbXTtcbiAgICBfLmVhY2godGhpcy5zdGF0ZS5tZXNzYWdlcywgZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgY2hhdHMucHVzaCg8Q2hhdE1lc3NhZ2UgbWVzc2FnZT17bWVzc2FnZX0ga2V5PXttZXNzYWdlLmlkfS8+KTtcbiAgICB9KVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXRCb3hcIj5cbiAgICAgICAgPGRpdiBpZD0nY2hhdFBhbmVsJyBjbGFzc05hbWU9J3BhbmVsIHBhbmVsLWluZm8nPlxuICAgICAgICAgIDxkaXYgaWQ9J2NoYXRUaXRsZScgY2xhc3NOYW1lPSdwYW5lbC1oZWFkaW5nJz5Cb29naWUtQ2hhdDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2NoYXRQYW5Cb2R5JyBjbGFzc05hbWU9J3BhbmVsLWJvZHknPlxuICAgICAgICAgICAgPGRpdiBpZD0ndGV4dEJvZHknPntjaGF0c31cbiAgICAgICAgICAgICAgPGRpdiBpZD0ndHlwaW5nLWluZGljYXRvcicgY2xhc3NOYW1lPXsodGhpcy5zdGF0ZS51c2VyQWN0aXZlID8gJ3R5cGluZy1pbmRpY2F0b3Igc2hvdycgOiAnaGlkZGVuJyl9PlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWNvbW1lbnRzXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxuICAgICAgICAgICAgICAgIHt0eXBpbmdJbmRpY2F0b3J9PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgaWQ9J2lzVHlwaW5nJyBjbGFzc05hbWU9J3R5cGluZy1ub3RpZmljYXRpb24nPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2NoYXRQYW5GdHInIGNsYXNzTmFtZT0ncGFuZWwtZm9vdGVyJz5cbiAgICAgICAgICAgIDxDaGF0SW5wdXQgbWVzc2FnZXM9e3RoaXMuc3RhdGUubWVzc2FnZXN9IG5hbWU9e3RoaXMuc3RhdGUuYW5vbk5hbWV9IHVwZGF0ZUNoYXQ9e3RoaXMudXBkYXRlQ2hhdC5iaW5kKHRoaXMpfSBzb2NrZXQ9e3RoaXMucHJvcHMuc29ja2V0fS8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59O1xud2luZG93LkNoYXQgPSBDaGF0OyJdfQ==