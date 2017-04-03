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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9jaGF0LmpzeCJdLCJuYW1lcyI6WyJDaGF0SW5wdXQiLCJwcm9wcyIsImNvbnNvbGUiLCJsb2ciLCJzdGF0ZSIsInByZXZOYW1lIiwibmFtZSIsIm1lc3NhZ2VzIiwidHlwaW5nIiwidXBkYXRlQ2hhdCIsInNvY2tldCIsIm9uIiwiZGF0YSIsIm5ld01lc3NhZ2UiLCJ1c2VyIiwidGV4dCIsImlkIiwibGVuZ3RoIiwiYmluZCIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJtZXNzYWdlVGV4dCIsInJlZnMiLCJtZXNzYWdlSW5wdXQiLCJ2YWx1ZSIsInNldFN0YXRlIiwibmFtZUlucHV0IiwiYW5ub3VuY2VOYW1lQ2hhbmdlIiwiZW1pdCIsInB1c2giLCJhcGlIZWxwZXIiLCJwb3N0VXNlclRvU2Vzc2lvbiIsInBvc3RDaGF0IiwiZW5kVHlwaW5nIiwiY2hhdFR5cGluZyIsInR5cGluZ05vdGUiLCJlbmRUeXBpbmdOb3RlIiwic2V0TmFtZSIsImVyciIsImVycm9yIiwiZ2V0VXNlckZyb21TZXNzaW9uIiwiY2hhdFN1Ym1pdCIsImNoYW5nZU5hbWUiLCJjaGVja0lucHV0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJDaGF0TWVzc2FnZSIsIm1lc3NhZ2UiLCJDaGF0IiwiYW5vbk5hbWUiLCJnZW5Bbm9uTmFtZSIsInVzZXJBY3RpdmUiLCJ0eXBpbmdVc2VycyIsImtleSIsIk9iamVjdCIsImtleXMiLCJudW0iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJudW1TdHIiLCJzdWJzdHJpbmciLCJnZXRDaGF0Q2FsbGJhY2siLCJnZXRDaGF0Iiwibm9kZSIsIlJlYWN0RE9NIiwiZmluZERPTU5vZGUiLCJtZXNzYWdlc0VuZCIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJiZWhhdmlvciIsInRob3NlVHlwaW5nIiwiam9pbiIsInRyaW0iLCJyZXBsYWNlIiwidHlwaW5nSW5kaWNhdG9yIiwiY2hhdHMiLCJfIiwiZWFjaCIsIndpbmRvdyJd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QUFDRCxPQUZEO0FBR0EsYUFDRTtBQUFBO0FBQUEsVUFBSyxXQUFVLFNBQWY7QUFDRTtBQUFBO0FBQUEsWUFBSyxJQUFHLFdBQVIsRUFBb0IsV0FBVSxrQkFBOUI7QUFDRTtBQUFBO0FBQUEsY0FBSyxJQUFHLFdBQVIsRUFBb0IsV0FBVSxlQUE5QjtBQUFBO0FBQUEsV0FERjtBQUVFO0FBQUE7QUFBQSxjQUFLLElBQUcsYUFBUixFQUFzQixXQUFVLFlBQWhDO0FBQ0U7QUFBQTtBQUFBLGdCQUFLLElBQUcsVUFBUjtBQUFvQjRELG1CQUFwQjtBQUNFO0FBQUE7QUFBQSxrQkFBSyxJQUFHLGtCQUFSLEVBQTJCLFdBQVksS0FBS3hFLEtBQUwsQ0FBVytDLFVBQVgsR0FBd0IsdUJBQXhCLEdBQWtELFFBQXpGO0FBQ0UsMkNBQUcsV0FBVSxnQkFBYixFQUE4QixlQUFZLE1BQTFDLEdBREY7QUFFR3dCO0FBRkgsZUFERjtBQUlFLDJDQUFLLElBQUcsVUFBUixFQUFtQixXQUFVLHFCQUE3QjtBQUpGO0FBREYsV0FGRjtBQVdFO0FBQUE7QUFBQSxjQUFLLElBQUcsWUFBUixFQUFxQixXQUFVLGNBQS9CO0FBQ0UsZ0NBQUMsU0FBRCxJQUFXLFVBQVUsS0FBS3ZFLEtBQUwsQ0FBV0csUUFBaEMsRUFBMEMsTUFBTSxLQUFLSCxLQUFMLENBQVc2QyxRQUEzRCxFQUFxRSxZQUFZLEtBQUt4QyxVQUFMLENBQWdCUyxJQUFoQixDQUFxQixJQUFyQixDQUFqRixFQUE2RyxRQUFRLEtBQUtqQixLQUFMLENBQVdTLE1BQWhJO0FBREY7QUFYRjtBQURGLE9BREY7QUFtQkQ7Ozs7RUEvRmdCa0MsTUFBTUMsUzs7QUFnR3hCO0FBQ0RrQyxPQUFPL0IsSUFBUCxHQUFjQSxJQUFkIiwiZmlsZSI6ImNoYXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBSZWFjdCBjb21wb25lbnQgZm9yIGhhbmRsaW5nIHRoZSBzZW5kaW5nIG9mIG5ldyBjaGF0c1xuY2xhc3MgQ2hhdElucHV0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc29sZS5sb2cocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHByZXZOYW1lOiB0aGlzLnByb3BzLm5hbWUsXG4gICAgICBuYW1lOiB0aGlzLnByb3BzLm5hbWUsXG4gICAgICBtZXNzYWdlczogdGhpcy5wcm9wcy5tZXNzYWdlcyxcbiAgICAgIHR5cGluZzogZmFsc2VcbiAgICB9XG4gICAgLy8gTWVzc2FnZXMgd2lsbCByZW5kZXIgb24gbG9hZFxuICAgIHRoaXMucHJvcHMudXBkYXRlQ2hhdCgpO1xuICAgIC8vIEhhbmRsZXMgcmVjZWl2aW5nIG5ldyBtZXNzYWdlcyBmcm9tIHRoZSBzb2NrZXRcbiAgICAvLyBOb3RlOiBPbmx5IHVzZXJzIHdobyBkaWRuJ3Qgc2VuZCB0aGUgbWVzc2FnZSB3aWxsXG4gICAgLy8gcmVjZWl2ZSB0aGlzLiBUaGUgc2VuZGVyJ3MgY2xpZW50IHdpbGwgdHJhY2sgaXRcbiAgICAvLyBmb3IgdGhlbSBzYW5zIHNvY2tldCB0byBjdXQgZG93biBvbiB1bm5lY2Vzc2FyeVxuICAgIC8vIHNvY2tldCBjb21tdW5pY2F0aW9ucy5cbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbignbmV3IG1lc3NhZ2UnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgbmV3TWVzc2FnZSA9IHtcbiAgICAgICAgdXNlcjogZGF0YS51c2VyLFxuICAgICAgICB0ZXh0OiBkYXRhLnRleHQsXG4gICAgICAgIGlkOiB0aGlzLnN0YXRlLm1lc3NhZ2VzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIHRoaXMucHJvcHMudXBkYXRlQ2hhdCgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH1cbiAgLy8gSGFuZGxlcyBhbGwgaW5mbyB3aGVuIHRoZSB1c2VyIHN1Ym1pdHMgYSBjaGF0LlxuICAvLyBUaGlzIGluY2x1ZGVzIGNoYW5naW5nIG9mIG5hbWVzLCBzdG9yaW5nIHlvdXIgb3duXG4gIC8vIG1lc3NhZ2VzLCBldGMuXG4gIGNoYXRTdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciBtZXNzYWdlVGV4dCA9IHRoaXMucmVmcy5tZXNzYWdlSW5wdXQudmFsdWU7XG4gICAgdmFyIHByZXZOYW1lID0gdGhpcy5zdGF0ZS5wcmV2TmFtZTtcbiAgICB0aGlzLnJlZnMubWVzc2FnZUlucHV0LnZhbHVlID0gJyc7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwcmV2TmFtZTogdGhpcy5yZWZzLm5hbWVJbnB1dC52YWx1ZVxuICAgIH0pO1xuICAgIGlmKHByZXZOYW1lICE9PSB0aGlzLnN0YXRlLm5hbWUpIHtcbiAgICAgIHZhciBhbm5vdW5jZU5hbWVDaGFuZ2UgPSB7XG4gICAgICAgIHVzZXI6IHByZXZOYW1lLFxuICAgICAgICB0ZXh0OiAnSSBjaGFuZ2VkIG15IG5hbWUgdG8gXFwnJyArIHRoaXMuc3RhdGUubmFtZSArICdcXCcnXG4gICAgICB9O1xuICAgICAgdGhpcy5wcm9wcy5zb2NrZXQuZW1pdCgnbmV3IG1lc3NhZ2UnLCBhbm5vdW5jZU5hbWVDaGFuZ2UpO1xuICAgICAgYW5ub3VuY2VOYW1lQ2hhbmdlLmlkPXRoaXMuc3RhdGUubWVzc2FnZXMubGVuZ3RoO1xuICAgICAgdGhpcy5zdGF0ZS5tZXNzYWdlcy5wdXNoKGFubm91bmNlTmFtZUNoYW5nZSk7XG4gICAgICBhcGlIZWxwZXIucG9zdFVzZXJUb1Nlc3Npb24odGhpcy5zdGF0ZS5uYW1lKTtcbiAgICB9XG4gICAgdmFyIG5ld01lc3NhZ2UgPSB7XG4gICAgICB1c2VyOiB0aGlzLnN0YXRlLm5hbWUsXG4gICAgICB0ZXh0OiBtZXNzYWdlVGV4dFxuICAgIH07XG4gICAgdGhpcy5wcm9wcy5zb2NrZXQuZW1pdCgnbmV3IG1lc3NhZ2UnLCBuZXdNZXNzYWdlKTtcbiAgICBuZXdNZXNzYWdlLmlkPXRoaXMuc3RhdGUubWVzc2FnZXMubGVuZ3RoO1xuXG4gICAgYXBpSGVscGVyLnBvc3RDaGF0KG5ld01lc3NhZ2UpO1xuXG4gICAgdGhpcy5zdGF0ZS5tZXNzYWdlcy5wdXNoKG5ld01lc3NhZ2UpO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBtZXNzYWdlczogdGhpcy5zdGF0ZS5tZXNzYWdlcyB9KTtcbiAgICB0aGlzLnByb3BzLnVwZGF0ZUNoYXQoKTtcbiAgICB0aGlzLmVuZFR5cGluZygpO1xuICB9XG4gIC8vV2hlbmV2ZXIgdGhlIHRoZSBjaGF0IGlucHV0IGNoYW5nZXMsIHdoaWNoIGlzIHRvIHNheSB3aGVuZXZlciBhIHVzZXIgYWRkcyBvciByZW1vdmVzIGEgY2hhcmFjdGVyIGZyb20gdGhlIG1lc3NhZ2UgaW5wdXQsIHRoaXMgY2hlY2tzIHRvIHNlZSBpZiB0aGUgc3RyaW5nIGlzIGVtcHR5IG9yIG5vdC4gSWYgaXQgaXMsIGFueSB0eXBpbmcgbm90aWZpY2F0aW9uIGlzIHJlbW92ZWQuIENvbnZlcnNlbHksIGlmIHRoZSB1c2VyIGlzIHR5cGluZywgdGhlIHR5cGluZyBub3RpZmljYXRpb24gaXMgZGlzcGxheWVkIHRvIG90aGVyIHVzZXJzLlxuICBjaGVja0lucHV0KGV2ZW50KSB7XG4gICAgaWYgKHRoaXMucmVmcy5tZXNzYWdlSW5wdXQudmFsdWUpIHtcbiAgICAgICAgdGhpcy5jaGF0VHlwaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5kVHlwaW5nKCk7XG4gICAgfVxuICB9XG4gIC8vSWYgdXNlciBpcyB0eXBpbmcsIHRoaXMgc2VuZHMgdGhlIHVzZXJuYW1lIHRvIHRoZSB0eXBpbmcgZXZlbnQgbGlzdGVuZXIgaW4gdGhlIHNlcnZlciB0byBkaXNwbGF5IHRvIG90aGVyIHVzZXJzIGEgdHlwaW5nIGluZGljYXRvci5cbiAgY2hhdFR5cGluZyhldmVudCkge1xuICAgIHZhciB0eXBpbmdOb3RlID0ge1xuICAgICAgdXNlcjogdGhpcy5zdGF0ZS5uYW1lXG4gICAgfVxuICAgICAgdGhpcy5wcm9wcy5zb2NrZXQuZW1pdCgndHlwaW5nJywgdHlwaW5nTm90ZSlcbiAgfVxuICAvL1RlbGxzIHNlcnZlciB0aGF0IHRoZSB1c2VyIGlzIGRvbmUgdHlwaW5nIGJ5IHBhY2tpbmcgZ3JhYmJpbmcgdGhlIG5hbWUgb2YgdGhlIHN0YXRlIG9iamVjdCBhbmQgc2VuZGluZyBpdCB0byB0aGUgJ2VuZCB0eXBpbmcnIGV2ZW50IGxpc3RlbmVyIGluIHRoZSBzZXJ2ZXIuXG4gIGVuZFR5cGluZyhldmVudCkge1xuICAgIHZhciBlbmRUeXBpbmdOb3RlID0ge1xuICAgICAgdXNlcjogdGhpcy5zdGF0ZS5uYW1lXG4gICAgfVxuICAgIHRoaXMucHJvcHMuc29ja2V0LmVtaXQoJ2VuZCB0eXBpbmcnLCBlbmRUeXBpbmdOb3RlKVxuICB9XG4gIC8vIFRoaXMganVzdCBrZWVwcyB0cmFjayBvZiB3aGF0IG5pY2tuYW1lIHRoZSB1c2VyXG4gIC8vIGhhcyBjaG9zZW4gdG8gdXNlXG4gIGNoYW5nZU5hbWUoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBuYW1lOiB0aGlzLnJlZnMubmFtZUlucHV0LnZhbHVlXG4gICAgfSk7XG4gIH1cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdmFyIHNldE5hbWUgPSBmdW5jdGlvbihlcnIsIG5hbWUpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcHJldk5hbWU6IG5hbWUsXG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcyk7XG4gICAgYXBpSGVscGVyLmdldFVzZXJGcm9tU2Vzc2lvbihzZXROYW1lKTtcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxmb3JtIGlkPSdhbGxDaGF0SW5wdXRzJyBvblN1Ym1pdD17dGhpcy5jaGF0U3VibWl0LmJpbmQodGhpcyl9PlxuICAgICAgICA8aW5wdXQgaWQ9J3VzZXJJZEJveCcgdHlwZT0ndGV4dCcgcmVmPSduYW1lSW5wdXQnIHZhbHVlPXt0aGlzLnN0YXRlLm5hbWV9IG9uQ2hhbmdlPXt0aGlzLmNoYW5nZU5hbWUuYmluZCh0aGlzKX0+PC9pbnB1dD5cbiAgICAgICAgPGlucHV0IGlkPSdjaGF0SW5wdXRCb3gnIHR5cGU9J3RleHQnIHJlZj0nbWVzc2FnZUlucHV0JyBvbkNoYW5nZT17dGhpcy5jaGVja0lucHV0LmJpbmQodGhpcyl9PjwvaW5wdXQ+XG4gICAgICAgIDxidXR0b24gaWQ9J2NoYXRTdWJtaXRCdG4nIGNsYXNzTmFtZT0nYnRuIGJ0bi1zbSBidG4tZGVmYXVsdCcgdHlwZT0nc3VibWl0Jz5TZW5kPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxufTtcbmNsYXNzIENoYXRNZXNzYWdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0nY2hhdE1lc3NhZ2UnPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2NoYXRNZXNzYWdlVXNlcicgY2xhc3NOYW1lPSdsYWJlbCBsYWJlbC1wcmltYXJ5Jz57dGhpcy5wcm9wcy5tZXNzYWdlLnVzZXJ9Ojwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdjaGF0TWVzc2FnZVRleHQnPiB7dGhpcy5wcm9wcy5tZXNzYWdlLnRleHR9IDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn07XG5jbGFzcyBDaGF0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1lc3NhZ2VzOiBbXSxcbiAgICAgIGFub25OYW1lOiB0aGlzLmdlbkFub25OYW1lKCksXG4gICAgICB1c2VyQWN0aXZlOiBmYWxzZSxcbiAgICAgIHR5cGluZ1VzZXJzOiB7fVxuICAgIH1cbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbigndHlwaW5nJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdID0gIXRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSA/IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSA6IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSsrO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHVzZXJBY3RpdmU6IHRydWUsXG4gICAgICAgIHR5cGluZ1VzZXJzOiB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzXG4gICAgICB9KVxuICAgIH0uYmluZCh0aGlzKSlcbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbignZW5kIHR5cGluZycsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzKSB7XG4gICAgICAgIGlmIChrZXkgPT09IGRhdGEudXNlcikge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB0eXBpbmdVc2VyczogdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghT2JqZWN0LmtleXModGhpcy5zdGF0ZS50eXBpbmdVc2VycykubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1c2VyQWN0aXZlOiBmYWxzZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfVxuICAvLyBUaGlzIGp1c3QgZ2VuZXJhdGVzIGEgcmFuZG9tIG5hbWUgb2YgdGhlIGZvcm1cbiAgLy8gQW5vbnh4eCB3aGVyZSB4eHggaXMgYSByYW5kb20sIHRocmVlIGRpZ2l0IG51bWJlclxuICBnZW5Bbm9uTmFtZSgpIHtcbiAgICB2YXIgbnVtID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCk7XG4gICAgdmFyIG51bVN0ciA9ICcwMDAnICsgbnVtO1xuICAgIG51bVN0ciA9IG51bVN0ci5zdWJzdHJpbmcobnVtU3RyLmxlbmd0aCAtIDMpO1xuICAgIHZhciBuYW1lID0gJ0Fub24nICsgbnVtU3RyO1xuICAgIHJldHVybiBuYW1lO1xuICB9XG4gIC8vIEp1c3QgZm9yIHV0aWxpdHkgaW4gdXBkYXRpbmcgdGhlIGNoYXQgY29ycmVjdGx5XG4gIC8vIHdpdGggdGhlIG1vc3QgdXAgdG8gZGF0ZSBpbmZvcm1hdGlvblxuICB1cGRhdGVDaGF0KCkge1xuICAgIHZhciBnZXRDaGF0Q2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIG9uIHJldHJpZXZpbmcgY2hhdCcsIGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBtZXNzYWdlczogZGF0YVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFwaUhlbHBlci5nZXRDaGF0KGdldENoYXRDYWxsYmFjay5iaW5kKHRoaXMpKTtcbiAgfVxuICAvLyB0byBzY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgY2hhdFxuICBzY3JvbGxUb0JvdHRvbSgpIHtcbiAgICB2YXIgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMubWVzc2FnZXNFbmQpO1xuICAgIG5vZGUuc2Nyb2xsSW50b1ZpZXcoe2Jsb2NrOiBcImVuZFwiLCBiZWhhdmlvcjogXCJzbW9vdGhcIn0pO1xuICB9XG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIC8vIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuICAvLyB3aGVuIHRoZSBjaGF0IHVwZGF0ZXMsIHNjcm9sbCB0byB0aGUgYm90dG9tIHRvIGRpc3BsYXkgdGhlIG1vc3QgcmVjZW50IGNoYXRcbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIC8vIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuICByZW5kZXIoKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5zdGF0ZS50eXBpbmdVc2VycylcbiAgICB2YXIgdGhvc2VUeXBpbmcgPSAoT2JqZWN0LmtleXModGhpcy5zdGF0ZS50eXBpbmdVc2Vycykuam9pbignLCAnKS50cmltKCkucmVwbGFjZSgvXiwvLCAnJykpXG4gICAgdmFyIHR5cGluZ0luZGljYXRvciA9IGAke3Rob3NlVHlwaW5nfSAuIC4gLmA7XG4gICAgdmFyIGNoYXRzID0gW107XG4gICAgXy5lYWNoKHRoaXMuc3RhdGUubWVzc2FnZXMsIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGNoYXRzLnB1c2goPENoYXRNZXNzYWdlIG1lc3NhZ2U9e21lc3NhZ2V9IGtleT17bWVzc2FnZS5pZH0vPik7XG4gICAgfSlcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGF0Qm94XCI+XG4gICAgICAgIDxkaXYgaWQ9J2NoYXRQYW5lbCcgY2xhc3NOYW1lPSdwYW5lbCBwYW5lbC1pbmZvJz5cbiAgICAgICAgICA8ZGl2IGlkPSdjaGF0VGl0bGUnIGNsYXNzTmFtZT0ncGFuZWwtaGVhZGluZyc+Qm9vZ2llLUNoYXQ8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdjaGF0UGFuQm9keScgY2xhc3NOYW1lPSdwYW5lbC1ib2R5Jz5cbiAgICAgICAgICAgIDxkaXYgaWQ9J3RleHRCb2R5Jz57Y2hhdHN9XG4gICAgICAgICAgICAgIDxkaXYgaWQ9J3R5cGluZy1pbmRpY2F0b3InIGNsYXNzTmFtZT17KHRoaXMuc3RhdGUudXNlckFjdGl2ZSA/ICd0eXBpbmctaW5kaWNhdG9yIHNob3cnIDogJ2hpZGRlbicpfT5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1jb21tZW50c1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cbiAgICAgICAgICAgICAgICB7dHlwaW5nSW5kaWNhdG9yfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGlkPSdpc1R5cGluZycgY2xhc3NOYW1lPSd0eXBpbmctbm90aWZpY2F0aW9uJz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGlkPSdjaGF0UGFuRnRyJyBjbGFzc05hbWU9J3BhbmVsLWZvb3Rlcic+XG4gICAgICAgICAgICA8Q2hhdElucHV0IG1lc3NhZ2VzPXt0aGlzLnN0YXRlLm1lc3NhZ2VzfSBuYW1lPXt0aGlzLnN0YXRlLmFub25OYW1lfSB1cGRhdGVDaGF0PXt0aGlzLnVwZGF0ZUNoYXQuYmluZCh0aGlzKX0gc29ja2V0PXt0aGlzLnByb3BzLnNvY2tldH0vPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufTtcbndpbmRvdy5DaGF0ID0gQ2hhdDsiXX0=