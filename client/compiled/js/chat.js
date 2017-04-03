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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9jaGF0LmpzeCJdLCJuYW1lcyI6WyJDaGF0SW5wdXQiLCJwcm9wcyIsImNvbnNvbGUiLCJsb2ciLCJzdGF0ZSIsInByZXZOYW1lIiwibmFtZSIsIm1lc3NhZ2VzIiwidHlwaW5nIiwidXBkYXRlQ2hhdCIsInNvY2tldCIsIm9uIiwiZGF0YSIsIm5ld01lc3NhZ2UiLCJ1c2VyIiwidGV4dCIsImlkIiwibGVuZ3RoIiwiYXBpSGVscGVyIiwicG9zdENoYXQiLCJiaW5kIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsIm1lc3NhZ2VUZXh0IiwicmVmcyIsIm1lc3NhZ2VJbnB1dCIsInZhbHVlIiwic2V0U3RhdGUiLCJuYW1lSW5wdXQiLCJhbm5vdW5jZU5hbWVDaGFuZ2UiLCJlbWl0IiwicHVzaCIsInBvc3RVc2VyVG9TZXNzaW9uIiwiY29uY2F0IiwiZW5kVHlwaW5nIiwiY2hhdFR5cGluZyIsInR5cGluZ05vdGUiLCJlbmRUeXBpbmdOb3RlIiwic2V0TmFtZSIsImVyciIsImVycm9yIiwiZ2V0VXNlckZyb21TZXNzaW9uIiwiY2hhdFN1Ym1pdCIsImNoYW5nZU5hbWUiLCJjaGVja0lucHV0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJDaGF0TWVzc2FnZSIsIm1lc3NhZ2UiLCJDaGF0IiwiYW5vbk5hbWUiLCJnZW5Bbm9uTmFtZSIsInVzZXJBY3RpdmUiLCJ0eXBpbmdVc2VycyIsImtleSIsIk9iamVjdCIsImtleXMiLCJudW0iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJudW1TdHIiLCJzdWJzdHJpbmciLCJnZXRDaGF0Q2FsbGJhY2siLCJnZXRDaGF0Iiwibm9kZSIsIlJlYWN0RE9NIiwiZmluZERPTU5vZGUiLCJtZXNzYWdlc0VuZCIsInNjcm9sbEludG9WaWV3IiwiYmxvY2siLCJiZWhhdmlvciIsInRob3NlVHlwaW5nIiwiam9pbiIsInRyaW0iLCJyZXBsYWNlIiwidHlwaW5nSW5kaWNhdG9yIiwiY2hhdHMiLCJfIiwiZWFjaCIs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QVEsS0FBS25CLEtBQUwsQ0FBV1MsTUFBaEk7QUFERjtBQWJGO0FBREYsT0FERjtBQXFCRDs7OztFQWpIZ0JtQyxNQUFNQyxTOztBQWtIeEI7O0FBSURxQyxPQUFPbEMsSUFBUCxHQUFjQSxJQUFkIiwiZmlsZSI6ImNoYXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIFJlYWN0IGNvbXBvbmVudCBmb3IgaGFuZGxpbmcgdGhlIHNlbmRpbmcgb2YgbmV3IGNoYXRzXG5jbGFzcyBDaGF0SW5wdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBjb25zb2xlLmxvZyhwcm9wcylcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcHJldk5hbWU6IHRoaXMucHJvcHMubmFtZSxcbiAgICAgIG5hbWU6IHRoaXMucHJvcHMubmFtZSxcbiAgICAgIG1lc3NhZ2VzOiB0aGlzLnByb3BzLm1lc3NhZ2VzLFxuICAgICAgdHlwaW5nOiBmYWxzZVxuICAgIH1cblxuICAgIC8vIE1lc3NhZ2VzIHdpbGwgcmVuZGVyIG9uIGxvYWRcbiAgICB0aGlzLnByb3BzLnVwZGF0ZUNoYXQoKTtcblxuICAgIC8vIEhhbmRsZXMgcmVjZWl2aW5nIG5ldyBtZXNzYWdlcyBmcm9tIHRoZSBzb2NrZXRcbiAgICAvLyBOb3RlOiBPbmx5IHVzZXJzIHdobyBkaWRuJ3Qgc2VuZCB0aGUgbWVzc2FnZSB3aWxsXG4gICAgLy8gcmVjZWl2ZSB0aGlzLiBUaGUgc2VuZGVyJ3MgY2xpZW50IHdpbGwgdHJhY2sgaXRcbiAgICAvLyBmb3IgdGhlbSBzYW5zIHNvY2tldCB0byBjdXQgZG93biBvbiB1bm5lY2Vzc2FyeVxuICAgIC8vIHNvY2tldCBjb21tdW5pY2F0aW9ucy5cbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbignbmV3IG1lc3NhZ2UnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgbmV3TWVzc2FnZSA9IHtcbiAgICAgICAgdXNlcjogZGF0YS51c2VyLFxuICAgICAgICB0ZXh0OiBkYXRhLnRleHQsXG4gICAgICAgIGlkOiB0aGlzLnN0YXRlLm1lc3NhZ2VzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGFwaUhlbHBlci5wb3N0Q2hhdChuZXdNZXNzYWdlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy51cGRhdGVDaGF0KCk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgfVxuXG4gIC8vIEhhbmRsZXMgYWxsIGluZm8gd2hlbiB0aGUgdXNlciBzdWJtaXRzIGEgY2hhdC5cbiAgLy8gVGhpcyBpbmNsdWRlcyBjaGFuZ2luZyBvZiBuYW1lcywgc3RvcmluZyB5b3VyIG93blxuICAvLyBtZXNzYWdlcywgZXRjLlxuICBjaGF0U3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgbWVzc2FnZVRleHQgPSB0aGlzLnJlZnMubWVzc2FnZUlucHV0LnZhbHVlO1xuICAgIHZhciBwcmV2TmFtZSA9IHRoaXMuc3RhdGUucHJldk5hbWU7XG4gICAgdGhpcy5yZWZzLm1lc3NhZ2VJbnB1dC52YWx1ZSA9ICcnO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwcmV2TmFtZTogdGhpcy5yZWZzLm5hbWVJbnB1dC52YWx1ZVxuICAgIH0pO1xuXG4gICAgaWYocHJldk5hbWUgIT09IHRoaXMuc3RhdGUubmFtZSkge1xuICAgICAgdmFyIGFubm91bmNlTmFtZUNoYW5nZSA9IHtcbiAgICAgICAgdXNlcjogcHJldk5hbWUsXG4gICAgICAgIHRleHQ6ICdJIGNoYW5nZWQgbXkgbmFtZSB0byBcXCcnICsgdGhpcy5zdGF0ZS5uYW1lICsgJ1xcJydcbiAgICAgIH07XG4gICAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCduZXcgbWVzc2FnZScsIGFubm91bmNlTmFtZUNoYW5nZSk7XG4gICAgICBhbm5vdW5jZU5hbWVDaGFuZ2UuaWQ9dGhpcy5zdGF0ZS5tZXNzYWdlcy5sZW5ndGg7XG4gICAgICB0aGlzLnN0YXRlLm1lc3NhZ2VzLnB1c2goYW5ub3VuY2VOYW1lQ2hhbmdlKTtcblxuICAgICAgYXBpSGVscGVyLnBvc3RVc2VyVG9TZXNzaW9uKHRoaXMuc3RhdGUubmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIG5ld01lc3NhZ2UgPSB7XG4gICAgICB1c2VyOiB0aGlzLnN0YXRlLm5hbWUsXG4gICAgICB0ZXh0OiBtZXNzYWdlVGV4dFxuICAgIH07XG4gICAgdGhpcy5wcm9wcy5zb2NrZXQuZW1pdCgnbmV3IG1lc3NhZ2UnLCBuZXdNZXNzYWdlKTtcbiAgICBuZXdNZXNzYWdlLmlkPXRoaXMuc3RhdGUubWVzc2FnZXMubGVuZ3RoO1xuXG4gICAgLy8gSSBjYW4ndCB0ZWxsIGlmIGVpdGhlciBvZiB0aGVzZSBpcyBhY3R1YWxseSBkb2luZyBhbnl0aGluZ1xuICAgIC8vIEZpcnN0IGxpbmUgd2FzIGFsd2F5cyBoZXJlLiBJIGFkZGVkIHRoZSBzZWNvbmQgb25lXG4gICAgdGhpcy5zdGF0ZS5tZXNzYWdlcy5jb25jYXQobmV3TWVzc2FnZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2VzOiB0aGlzLnN0YXRlLm1lc3NhZ2VzIH0pO1xuXG4gICAgdGhpcy5wcm9wcy51cGRhdGVDaGF0KCk7XG4gICAgdGhpcy5lbmRUeXBpbmcoKTtcbiAgfVxuXG4gIC8vV2hlbmV2ZXIgdGhlIHRoZSBjaGF0IGlucHV0IGNoYW5nZXMsIHdoaWNoIGlzIHRvIHNheSB3aGVuZXZlciBhIHVzZXIgYWRkcyBvciByZW1vdmVzIGEgY2hhcmFjdGVyIGZyb20gdGhlIG1lc3NhZ2UgaW5wdXQsIHRoaXMgY2hlY2tzIHRvIHNlZSBpZiB0aGUgc3RyaW5nIGlzIGVtcHR5IG9yIG5vdC4gSWYgaXQgaXMsIGFueSB0eXBpbmcgbm90aWZpY2F0aW9uIGlzIHJlbW92ZWQuIENvbnZlcnNlbHksIGlmIHRoZSB1c2VyIGlzIHR5cGluZywgdGhlIHR5cGluZyBub3RpZmljYXRpb24gaXMgZGlzcGxheWVkIHRvIG90aGVyIHVzZXJzLlxuICBjaGVja0lucHV0KGV2ZW50KSB7XG4gICAgaWYgKHRoaXMucmVmcy5tZXNzYWdlSW5wdXQudmFsdWUpIHtcbiAgICAgICAgdGhpcy5jaGF0VHlwaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5kVHlwaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgLy9JZiB1c2VyIGlzIHR5cGluZywgdGhpcyBzZW5kcyB0aGUgdXNlcm5hbWUgdG8gdGhlIHR5cGluZyBldmVudCBsaXN0ZW5lciBpbiB0aGUgc2VydmVyIHRvIGRpc3BsYXkgdG8gb3RoZXIgdXNlcnMgYSB0eXBpbmcgaW5kaWNhdG9yLlxuICBjaGF0VHlwaW5nKGV2ZW50KSB7XG4gICAgdmFyIHR5cGluZ05vdGUgPSB7XG4gICAgICB1c2VyOiB0aGlzLnN0YXRlLm5hbWVcbiAgICB9XG4gICAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCd0eXBpbmcnLCB0eXBpbmdOb3RlKVxuICB9XG5cbiAgLy9UZWxscyBzZXJ2ZXIgdGhhdCB0aGUgdXNlciBpcyBkb25lIHR5cGluZyBieSBwYWNraW5nIGdyYWJiaW5nIHRoZSBuYW1lIG9mIHRoZSBzdGF0ZSBvYmplY3QgYW5kIHNlbmRpbmcgaXQgdG8gdGhlICdlbmQgdHlwaW5nJyBldmVudCBsaXN0ZW5lciBpbiB0aGUgc2VydmVyLlxuICBlbmRUeXBpbmcoZXZlbnQpIHtcbiAgICB2YXIgZW5kVHlwaW5nTm90ZSA9IHtcbiAgICAgIHVzZXI6IHRoaXMuc3RhdGUubmFtZVxuICAgIH1cbiAgICB0aGlzLnByb3BzLnNvY2tldC5lbWl0KCdlbmQgdHlwaW5nJywgZW5kVHlwaW5nTm90ZSlcbiAgfVxuXG4gIC8vIFRoaXMganVzdCBrZWVwcyB0cmFjayBvZiB3aGF0IG5pY2tuYW1lIHRoZSB1c2VyXG4gIC8vIGhhcyBjaG9zZW4gdG8gdXNlXG4gIGNoYW5nZU5hbWUoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBuYW1lOiB0aGlzLnJlZnMubmFtZUlucHV0LnZhbHVlXG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB2YXIgc2V0TmFtZSA9IGZ1bmN0aW9uKGVyciwgbmFtZSkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBwcmV2TmFtZTogbmFtZSxcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIGFwaUhlbHBlci5nZXRVc2VyRnJvbVNlc3Npb24oc2V0TmFtZSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxmb3JtIGlkPSdhbGxDaGF0SW5wdXRzJyBvblN1Ym1pdD17dGhpcy5jaGF0U3VibWl0LmJpbmQodGhpcyl9PlxuICAgICAgICA8aW5wdXQgaWQ9J3VzZXJJZEJveCcgdHlwZT0ndGV4dCcgcmVmPSduYW1lSW5wdXQnIHZhbHVlPXt0aGlzLnN0YXRlLm5hbWV9IG9uQ2hhbmdlPXt0aGlzLmNoYW5nZU5hbWUuYmluZCh0aGlzKX0+PC9pbnB1dD5cbiAgICAgICAgPGlucHV0IGlkPSdjaGF0SW5wdXRCb3gnIHR5cGU9J3RleHQnIHJlZj0nbWVzc2FnZUlucHV0JyBvbkNoYW5nZT17dGhpcy5jaGVja0lucHV0LmJpbmQodGhpcyl9PjwvaW5wdXQ+XG4gICAgICAgIDxidXR0b24gaWQ9J2NoYXRTdWJtaXRCdG4nIGNsYXNzTmFtZT0nYnRuIGJ0bi1zbSBidG4tZGVmYXVsdCcgdHlwZT0nc3VibWl0Jz5TZW5kPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxufTtcblxuY2xhc3MgQ2hhdE1lc3NhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0nY2hhdE1lc3NhZ2UnPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2NoYXRNZXNzYWdlVXNlcicgY2xhc3NOYW1lPSdsYWJlbCBsYWJlbC1wcmltYXJ5Jz57dGhpcy5wcm9wcy5tZXNzYWdlLnVzZXJ9Ojwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdjaGF0TWVzc2FnZVRleHQnPiB7dGhpcy5wcm9wcy5tZXNzYWdlLnRleHR9IDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufTtcblxuXG5jbGFzcyBDaGF0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbWVzc2FnZXM6IFtdLFxuICAgICAgYW5vbk5hbWU6IHRoaXMuZ2VuQW5vbk5hbWUoKSxcbiAgICAgIHVzZXJBY3RpdmU6IGZhbHNlLFxuICAgICAgdHlwaW5nVXNlcnM6IHt9XG4gICAgfVxuXG5cbiAgICB0aGlzLnByb3BzLnNvY2tldC5vbigndHlwaW5nJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1tkYXRhLnVzZXJdID0gIXRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSA/IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSA6IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNbZGF0YS51c2VyXSsrO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHVzZXJBY3RpdmU6IHRydWUsXG4gICAgICAgIHR5cGluZ1VzZXJzOiB0aGlzLnN0YXRlLnR5cGluZ1VzZXJzXG4gICAgICB9KVxuICAgIH0uYmluZCh0aGlzKSlcblxuXG4gICAgdGhpcy5wcm9wcy5zb2NrZXQub24oJ2VuZCB0eXBpbmcnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5zdGF0ZS50eXBpbmdVc2Vycykge1xuICAgICAgICBpZiAoa2V5ID09PSBkYXRhLnVzZXIpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5zdGF0ZS50eXBpbmdVc2Vyc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgdHlwaW5nVXNlcnM6IHRoaXMuc3RhdGUudHlwaW5nVXNlcnNcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHRoaXMuc3RhdGUudHlwaW5nVXNlcnMpLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXNlckFjdGl2ZTogZmFsc2VcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgfVxuXG5cbiAgLy8gVGhpcyBqdXN0IGdlbmVyYXRlcyBhIHJhbmRvbSBuYW1lIG9mIHRoZSBmb3JtXG4gIC8vIEFub254eHggd2hlcmUgeHh4IGlzIGEgcmFuZG9tLCB0aHJlZSBkaWdpdCBudW1iZXJcbiAgZ2VuQW5vbk5hbWUoKSB7XG4gICAgdmFyIG51bSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDApO1xuICAgIHZhciBudW1TdHIgPSAnMDAwJyArIG51bTtcbiAgICBudW1TdHIgPSBudW1TdHIuc3Vic3RyaW5nKG51bVN0ci5sZW5ndGggLSAzKTtcbiAgICB2YXIgbmFtZSA9ICdBbm9uJyArIG51bVN0cjtcbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuXG5cbiAgLy8gSnVzdCBmb3IgdXRpbGl0eSBpbiB1cGRhdGluZyB0aGUgY2hhdCBjb3JyZWN0bHlcbiAgLy8gd2l0aCB0aGUgbW9zdCB1cCB0byBkYXRlIGluZm9ybWF0aW9uXG4gIHVwZGF0ZUNoYXQoKSB7XG4gICAgdmFyIGdldENoYXRDYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igb24gcmV0cmlldmluZyBjaGF0JywgZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIG1lc3NhZ2VzOiBkYXRhXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgYXBpSGVscGVyLmdldENoYXQoZ2V0Q2hhdENhbGxiYWNrLmJpbmQodGhpcykpO1xuICB9XG5cbiAgLy8gdG8gc2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIGNoYXRcbiAgc2Nyb2xsVG9Cb3R0b20oKSB7XG4gICAgdmFyIG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLm1lc3NhZ2VzRW5kKTtcbiAgICBub2RlLnNjcm9sbEludG9WaWV3KHtibG9jazogXCJlbmRcIiwgYmVoYXZpb3I6IFwic21vb3RoXCJ9KTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIC8vIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuXG4gIC8vIHdoZW4gdGhlIGNoYXQgdXBkYXRlcywgc2Nyb2xsIHRvIHRoZSBib3R0b20gdG8gZGlzcGxheSB0aGUgbW9zdCByZWNlbnQgY2hhdFxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgLy8gdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xuICB9XG5cblxuICByZW5kZXIoKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5zdGF0ZS50eXBpbmdVc2VycylcbiAgICB2YXIgdGhvc2VUeXBpbmcgPSAoT2JqZWN0LmtleXModGhpcy5zdGF0ZS50eXBpbmdVc2Vycykuam9pbignLCAnKS50cmltKCkucmVwbGFjZSgvXiwvLCAnJykpXG4gICAgdmFyIHR5cGluZ0luZGljYXRvciA9IGAke3Rob3NlVHlwaW5nfSAuIC4gLmA7XG4gICAgdmFyIGNoYXRzID0gW107XG5cbiAgICBfLmVhY2godGhpcy5zdGF0ZS5tZXNzYWdlcywgZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgY2hhdHMucHVzaCg8Q2hhdE1lc3NhZ2UgbWVzc2FnZT17bWVzc2FnZX0ga2V5PXttZXNzYWdlLmlkfS8+KTtcbiAgICB9KVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXRCb3hcIj5cbiAgICAgICAgPGRpdiBpZD0nY2hhdFBhbmVsJyBjbGFzc05hbWU9J3BhbmVsIHBhbmVsLWluZm8nPlxuICAgICAgICAgIDxkaXYgaWQ9J2NoYXRUaXRsZScgY2xhc3NOYW1lPSdwYW5lbC1oZWFkaW5nJz5Cb29naWUtQ2hhdDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2NoYXRQYW5Cb2R5JyBjbGFzc05hbWU9J3BhbmVsLWJvZHknPlxuICAgICAgICAgICAgPGRpdiBpZD0ndGV4dEJvZHknPntjaGF0c31cbiAgICAgICAgICAgICAgPGRpdiBzdHlsZSA9IHt7ZmxvYXQ6IFwibGVmdFwiLCBjbGVhcjogXCJib3RoXCJ9fSByZWY9eyhlbCkgPT4geyB0aGlzLm1lc3NhZ2VzRW5kID0gZWw7IH19PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBpZD0ndHlwaW5nLWluZGljYXRvcicgY2xhc3NOYW1lPXsodGhpcy5zdGF0ZS51c2VyQWN0aXZlID8gJ3R5cGluZy1pbmRpY2F0b3Igc2hvdycgOiAnaGlkZGVuJyl9PlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWNvbW1lbnRzXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxuICAgICAgICAgICAgICAgIHt0eXBpbmdJbmRpY2F0b3J9PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgaWQ9J2lzVHlwaW5nJyBjbGFzc05hbWU9J3R5cGluZy1ub3RpZmljYXRpb24nPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2NoYXRQYW5GdHInIGNsYXNzTmFtZT0ncGFuZWwtZm9vdGVyJz5cbiAgICAgICAgICAgIDxDaGF0SW5wdXQgbWVzc2FnZXM9e3RoaXMuc3RhdGUubWVzc2FnZXN9IG5hbWU9e3RoaXMuc3RhdGUuYW5vbk5hbWV9IHVwZGF0ZUNoYXQ9e3RoaXMudXBkYXRlQ2hhdC5iaW5kKHRoaXMpfSBzb2NrZXQ9e3RoaXMucHJvcHMuc29ja2V0fS8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59O1xuXG5cblxud2luZG93LkNoYXQgPSBDaGF0OyJdfQ==