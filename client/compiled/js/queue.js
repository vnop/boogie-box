'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//Component for adding new URLs
var Add = function (_React$Component) {
  _inherits(Add, _React$Component);

  function Add(props) {
    _classCallCheck(this, Add);

    var _this = _possibleConstructorReturn(this, (Add.__proto__ || Object.getPrototypeOf(Add)).call(this, props));

    _this.state = {
      error: ''
    };
    return _this;
  }

  // Pulls input info from the add box in the queue, and pushes
  // a url to the serverside for DB tracking if the url is valid


  _createClass(Add, [{
    key: 'urlSubmit',
    value: function urlSubmit(event) {
      event.preventDefault();
      var inputVal = this.refs.addUrlField.value;
      if (this.validYoutubeUrl(inputVal)) {
        this.refs.addUrlField.style = 'outline: initial';
        this.setState({
          error: ''
        });
        apiHelper.postVideo(inputVal, function () {
          this.props.updateQueue();
        }.bind(this));
        this.refs.addUrlField.value = '';
      } else {
        this.refs.addUrlField.style = 'outline: 1px solid red';
        this.setState({
          error: 'Please input a valid Youtube URL'
        });
      }
    }

    // Dead simple youtube url validator. Back end uses more sophisticated
    // API based validation, but this prunes most nonsense input
    // off the bat.

  }, {
    key: 'validYoutubeUrl',
    value: function validYoutubeUrl(url) {
      var necessaryString0 = 'youtube.com';
      var necessaryString1 = '?v=';
      return url.indexOf(necessaryString0) !== -1 && url.indexOf(necessaryString1) !== -1;
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'span',
          { id: 'qAddText' },
          'Video URL'
        ),
        React.createElement(
          'form',
          { onSubmit: this.urlSubmit.bind(this) },
          React.createElement(
            'label',
            { id: 'vidSubmit' },
            React.createElement('input', { className: 'form-control', id: 'focusedInput', type: 'text', ref: 'addUrlField' })
          ),
          React.createElement('input', { className: 'btn btn-sm btn-primary', type: 'submit', value: 'Submit' })
        ),
        this.state.error
      );
    }
  }]);

  return Add;
}(React.Component);

;

// React Component for rendering each element in the song queue

var QueueElement = function (_React$Component2) {
  _inherits(QueueElement, _React$Component2);

  function QueueElement(props) {
    _classCallCheck(this, QueueElement);

    // These are mostly unused, but helpful for testing
    // some functionalities if you so choose
    var _this2 = _possibleConstructorReturn(this, (QueueElement.__proto__ || Object.getPrototypeOf(QueueElement)).call(this, props));

    _this2.state = {
      downVoted: false,
      upVoted: false,
      downStyle: {},
      upStyle: {}
    };
    return _this2;
  }

  // Gets called on either an upvote or downvote, interacts
  // with the server side to post that vote.


  _createClass(QueueElement, [{
    key: 'vote',
    value: function vote(type) {
      if (!this.props.votedOn[this.props.video.id]) {
        // tell session to save choice with id
        apiHelper.postVote({
          id: this.props.video.id,
          type: type
        }, function (err) {
          if (err) {
            console.error('Error posting like:', err);
          } else {
            console.log('vote posted to session');
          }
        });

        if (type === 'up') {
          apiHelper.vote({ upVote: true }, this.props.video);
        } else if (type === 'down') {
          apiHelper.vote({ downVote: true }, this.props.video);
        }
        this.props.votedOn[this.props.video.id] = type;
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var self = this;
      apiHelper.getVotes(function (err, votes) {
        if (err) {
          console.error('Error getting votes:', err);
        } else {
          _.each(votes, function (vote) {
            self.props.votedOn[vote.id] = vote.type;
          });
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { id: 'qEntry', className: 'container' },
        React.createElement(
          'div',
          { id: 'vidInQ', className: 'col-sm-10' },
          React.createElement(
            'div',
            { id: 'vidTitle' },
            React.createElement(
              'a',
              { href: this.props.video.videourl, target: '_blank' },
              this.props.video.title
            )
          )
        ),
        React.createElement(
          'div',
          { id: 'dwnVoteCol', className: 'col-sm-1' },
          React.createElement(
            'div',
            { id: 'dwnVote' },
            React.createElement(
              'button',
              { className: 'btn btn-md btn-default', onClick: function () {
                  this.vote('down');
                }.bind(this), style: this.props.votedOn[this.props.video.id] === 'down' ? { border: '2px solid red' } : {} },
              React.createElement(
                'span',
                { className: 'glyphicon glyphicon-circle-arrow-down' },
                ' ',
                this.props.video.downVote
              )
            )
          )
        ),
        React.createElement(
          'div',
          { id: 'upVoteCol', className: 'col-sm-1' },
          React.createElement(
            'div',
            { id: 'upVote' },
            React.createElement(
              'button',
              { className: 'btn btn-md btn-default', onClick: function () {
                  this.vote('up');
                }.bind(this), style: this.props.votedOn[this.props.video.id] === 'up' ? { border: '2px solid green' } : {} },
              React.createElement(
                'span',
                { className: 'glyphicon glyphicon-circle-arrow-up' },
                ' ',
                this.props.video.upVote
              )
            )
          )
        )
      );
    }
  }]);

  return QueueElement;
}(React.Component);

;

var Queue = function (_React$Component3) {
  _inherits(Queue, _React$Component3);

  function Queue(props) {
    _classCallCheck(this, Queue);

    var _this3 = _possibleConstructorReturn(this, (Queue.__proto__ || Object.getPrototypeOf(Queue)).call(this, props));

    _this3.state = {
      videoList: [],
      votedOn: {},
      hasVideos: false
    };

    _this3.updateQueue();

    // This is what updates the queue every time you or another user
    // causes any sort of change on the queue. This includes
    // votes, additions, and subtractions.
    _this3.props.socket.on('queueChange', function () {
      this.updateQueue();
    }.bind(_this3));
    return _this3;
  }

  // Updates the queue with all video data, such that votes and
  // songs are all consistently up to date for every user in the
  // boogie box

  // Note: this also sorts the output by vote score (i.e. up - down)


  _createClass(Queue, [{
    key: 'updateQueue',
    value: function updateQueue() {
      var hadVideos = this.state.hasVideos;
      var getVideosCallback = function getVideosCallback(err, data) {
        if (err) {
          console.log('Error on retrieving videos', err);
        } else {
          var hasVideos = data.length > 0;

          data.sort(function (a, b) {
            var bScore = b.upVote - b.downVote;
            var aScore = a.upVote - a.downVote;

            return bScore - aScore;
          });

          this.setState({
            videoList: data,
            hasVideos: hasVideos
          });

          if (!hadVideos && this.state.hasVideos) {
            this.props.startVideo();
          }
        }
      };
      apiHelper.getVideos(getVideosCallback.bind(this));
    }

    // This method is responsible for advancing the queue whenever
    // the current song is done playing. It removes the top song
    // from the queue and returns it so the player can start
    // playing that.

  }, {
    key: 'advanceQueue',
    value: function advanceQueue() {
      if (this.state.hasVideos) {
        var newVid = this.state.videoList[0];

        apiHelper.removeVideo(newVid, function () {
          apiHelper.getVideos(function (err, data) {
            var hasVideos = data.length > 0;
            this.setState({
              videoList: data,
              hasVideos: hasVideos
            });
          }.bind(this));
        }.bind(this));

        return newVid;
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var queueElements = [];
      var votedOn = this.state.votedOn;
      _.each(this.state.videoList, function (video) {
        queueElements.push(React.createElement(QueueElement, { video: video, votedOn: votedOn, key: video.id }));
      });

      return React.createElement(
        'div',
        { id: 'qPanel', className: 'panel panel-default' },
        React.createElement(
          'div',
          { id: 'qPanelHead', className: 'panel-heading' },
          React.createElement(Add, { updateQueue: this.updateQueue.bind(this) })
        ),
        React.createElement(
          'div',
          { id: 'qPanelBody', className: 'panel-body' },
          React.createElement(
            'div',
            { id: 'qTextBody' },
            queueElements
          )
        )
      );
    }
  }]);

  return Queue;
}(React.Component);

;

window.Add = Add;
window.Queue = Queue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9xdWV1ZS5qc3giXSwibmFtZXMiOlsiQWRkIiwicHJvcHMiLCJzdGF0ZSIsImVycm9yIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImlucHV0VmFsIiwicmVmcyIsImFkZFVybEZpZWxkIiwidmFsdWUiLCJ2YWxpZFlvdXR1YmVVcmwiLCJzdHlsZSIsInNldFN0YXRlIiwiYXBpSGVscGVyIiwicG9zdFZpZGVvIiwidXBkYXRlUXVldWUiLCJiaW5kIiwidXJsIiwibmVjZXNzYXJ5U3RyaW5nMCIsIm5lY2Vzc2FyeVN0cmluZzEiLCJpbmRleE9mIiwidXJsU3VibWl0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJRdWV1ZUVsZW1lbnQiLCJkb3duVm90ZWQiLCJ1cFZvdGVkIiwiZG93blN0eWxlIiwidXBTdHlsZSIsInR5cGUiLCJ2b3RlZE9uIiwidmlkZW8iLCJpZCIsInBvc3RWb3RlIiwiZXJyIiwiY29uc29sZSIsImxvZyIsInZvdGUiLCJ1cFZvdGUiLCJkb3duVm90ZSIsInNlbGYiLCJnZXRWb3RlcyIsInZvdGVzIiwiXyIsImVhY2giLCJ2aWRlb3VybCIsInRpdGxlIiwiYm9yZGVyIiwiUXVldWUiLCJ2aWRlb0xpc3QiLCJoYXNWaWRlb3MiLCJzb2NrZXQiLCJvbiIsImhhZFZpZGVvcyIsImdldFZpZGVvc0NhbGxiYWNrIiwiZGF0YSIsImxlbmd0aCIsInNvcnQiLCJhIiwiYiIsImJTY29yZSIsImFTY29yZSIsInN0YXJ0VmlkZW8iLCJnZXRWaWRlb3MiLCJuZXdWaWQiLCJyZW1vdmVWaWRlbyIsInF1ZXVlRWxlbWVudHMiLCJwdXNoIiwid2luZG93Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7SUFDTUEsRzs7O0FBQ0osZUFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBLDBHQUNYQSxLQURXOztBQUVqQixVQUFLQyxLQUFMLEdBQWE7QUFDWEMsYUFBTztBQURJLEtBQWI7QUFGaUI7QUFLbEI7O0FBR0Q7QUFDQTs7Ozs7OEJB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O0FBQXNCa0Q7QUFBdEI7QUFERjtBQUpGLE9BREY7QUFVRDs7OztFQWhHaUI1QyxNQUFNQyxTOztBQWlHekI7O0FBRUQ2QyxPQUFPcEUsR0FBUCxHQUFhQSxHQUFiO0FBQ0FvRSxPQUFPcEIsS0FBUCxHQUFlQSxLQUFmIiwiZmlsZSI6InF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9Db21wb25lbnQgZm9yIGFkZGluZyBuZXcgVVJMc1xuY2xhc3MgQWRkIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGVycm9yOiAnJ1xuICAgIH07XG4gIH1cblxuXG4gIC8vIFB1bGxzIGlucHV0IGluZm8gZnJvbSB0aGUgYWRkIGJveCBpbiB0aGUgcXVldWUsIGFuZCBwdXNoZXNcbiAgLy8gYSB1cmwgdG8gdGhlIHNlcnZlcnNpZGUgZm9yIERCIHRyYWNraW5nIGlmIHRoZSB1cmwgaXMgdmFsaWRcbiAgdXJsU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgaW5wdXRWYWwgPSB0aGlzLnJlZnMuYWRkVXJsRmllbGQudmFsdWU7XG4gICAgaWYgKHRoaXMudmFsaWRZb3V0dWJlVXJsKGlucHV0VmFsKSkge1xuICAgICAgdGhpcy5yZWZzLmFkZFVybEZpZWxkLnN0eWxlID0gJ291dGxpbmU6IGluaXRpYWwnO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGVycm9yOiAnJ1xuICAgICAgfSk7XG4gICAgICBhcGlIZWxwZXIucG9zdFZpZGVvKGlucHV0VmFsLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy51cGRhdGVRdWV1ZSgpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMucmVmcy5hZGRVcmxGaWVsZC52YWx1ZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlZnMuYWRkVXJsRmllbGQuc3R5bGUgPSAnb3V0bGluZTogMXB4IHNvbGlkIHJlZCc7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZXJyb3I6ICdQbGVhc2UgaW5wdXQgYSB2YWxpZCBZb3V0dWJlIFVSTCdcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIERlYWQgc2ltcGxlIHlvdXR1YmUgdXJsIHZhbGlkYXRvci4gQmFjayBlbmQgdXNlcyBtb3JlIHNvcGhpc3RpY2F0ZWRcbiAgLy8gQVBJIGJhc2VkIHZhbGlkYXRpb24sIGJ1dCB0aGlzIHBydW5lcyBtb3N0IG5vbnNlbnNlIGlucHV0XG4gIC8vIG9mZiB0aGUgYmF0LlxuICB2YWxpZFlvdXR1YmVVcmwodXJsKSB7XG4gICAgdmFyIG5lY2Vzc2FyeVN0cmluZzAgPSAneW91dHViZS5jb20nO1xuICAgIHZhciBuZWNlc3NhcnlTdHJpbmcxID0gJz92PSc7XG4gICAgcmV0dXJuIHVybC5pbmRleE9mKG5lY2Vzc2FyeVN0cmluZzApICE9PSAtMSAmJiB1cmwuaW5kZXhPZihuZWNlc3NhcnlTdHJpbmcxKSAhPT0gLTE7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGlkPSdxQWRkVGV4dCc+VmlkZW8gVVJMPC9zcGFuPlxuICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy51cmxTdWJtaXQuYmluZCh0aGlzKX0+XG4gICAgICAgICAgPGxhYmVsIGlkPSd2aWRTdWJtaXQnPlxuICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIGlkPVwiZm9jdXNlZElucHV0XCIgdHlwZT1cInRleHRcIiByZWY9XCJhZGRVcmxGaWVsZFwiLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9J2J0biBidG4tc20gYnRuLXByaW1hcnknIHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT1cIlN1Ym1pdFwiLz5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgICB7dGhpcy5zdGF0ZS5lcnJvcn1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufTtcblxuXG4vLyBSZWFjdCBDb21wb25lbnQgZm9yIHJlbmRlcmluZyBlYWNoIGVsZW1lbnQgaW4gdGhlIHNvbmcgcXVldWVcbmNsYXNzIFF1ZXVlRWxlbWVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgLy8gVGhlc2UgYXJlIG1vc3RseSB1bnVzZWQsIGJ1dCBoZWxwZnVsIGZvciB0ZXN0aW5nXG4gICAgLy8gc29tZSBmdW5jdGlvbmFsaXRpZXMgaWYgeW91IHNvIGNob29zZVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBkb3duVm90ZWQ6IGZhbHNlLFxuICAgICAgdXBWb3RlZDogZmFsc2UsXG4gICAgICBkb3duU3R5bGU6IHt9LFxuICAgICAgdXBTdHlsZToge31cbiAgICB9O1xuICB9XG5cblxuICAvLyBHZXRzIGNhbGxlZCBvbiBlaXRoZXIgYW4gdXB2b3RlIG9yIGRvd252b3RlLCBpbnRlcmFjdHNcbiAgLy8gd2l0aCB0aGUgc2VydmVyIHNpZGUgdG8gcG9zdCB0aGF0IHZvdGUuXG4gIHZvdGUodHlwZSkge1xuICAgIGlmKCEodGhpcy5wcm9wcy52b3RlZE9uW3RoaXMucHJvcHMudmlkZW8uaWRdKSkge1xuICAgICAgLy8gdGVsbCBzZXNzaW9uIHRvIHNhdmUgY2hvaWNlIHdpdGggaWRcbiAgICAgIGFwaUhlbHBlci5wb3N0Vm90ZShcbiAgICAgICAge1xuICAgICAgICAgIGlkOiB0aGlzLnByb3BzLnZpZGVvLmlkLFxuICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcG9zdGluZyBsaWtlOicsIGVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd2b3RlIHBvc3RlZCB0byBzZXNzaW9uJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgaWYgKHR5cGUgPT09ICd1cCcpIHtcbiAgICAgICAgYXBpSGVscGVyLnZvdGUoe3VwVm90ZTogdHJ1ZX0sIHRoaXMucHJvcHMudmlkZW8pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZG93bicpIHtcbiAgICAgICAgYXBpSGVscGVyLnZvdGUoe2Rvd25Wb3RlOiB0cnVlfSwgdGhpcy5wcm9wcy52aWRlbyk7XG4gICAgICB9XG4gICAgICB0aGlzLnByb3BzLnZvdGVkT25bdGhpcy5wcm9wcy52aWRlby5pZF0gPSB0eXBlO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBhcGlIZWxwZXIuZ2V0Vm90ZXMoZnVuY3Rpb24oZXJyLCB2b3Rlcykge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIHZvdGVzOicsIGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfLmVhY2godm90ZXMsIGZ1bmN0aW9uKHZvdGUpIHtcbiAgICAgICAgICBzZWxmLnByb3BzLnZvdGVkT25bdm90ZS5pZF0gPSB2b3RlLnR5cGU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGlkPSdxRW50cnknIGNsYXNzTmFtZT0nY29udGFpbmVyJz5cbiAgICAgICAgPGRpdiBpZD0ndmlkSW5RJyBjbGFzc05hbWU9J2NvbC1zbS0xMCc+XG4gICAgICAgICAgPGRpdiBpZD0ndmlkVGl0bGUnPlxuICAgICAgICAgICAgPGEgaHJlZj17dGhpcy5wcm9wcy52aWRlby52aWRlb3VybH0gdGFyZ2V0PVwiX2JsYW5rXCI+e3RoaXMucHJvcHMudmlkZW8udGl0bGV9PC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGlkPSdkd25Wb3RlQ29sJyBjbGFzc05hbWU9J2NvbC1zbS0xJz5cbiAgICAgICAgICA8ZGl2IGlkPSdkd25Wb3RlJz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLW1kIGJ0bi1kZWZhdWx0JyBvbkNsaWNrPXtmdW5jdGlvbigpIHt0aGlzLnZvdGUoJ2Rvd24nKX0uYmluZCh0aGlzKX0gc3R5bGU9eyh0aGlzLnByb3BzLnZvdGVkT25bdGhpcy5wcm9wcy52aWRlby5pZF0gPT09ICdkb3duJykgPyB7Ym9yZGVyOiAnMnB4IHNvbGlkIHJlZCd9IDoge319PjxzcGFuIGNsYXNzTmFtZT0nZ2x5cGhpY29uIGdseXBoaWNvbi1jaXJjbGUtYXJyb3ctZG93bic+IHt0aGlzLnByb3BzLnZpZGVvLmRvd25Wb3RlfTwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgaWQ9J3VwVm90ZUNvbCcgY2xhc3NOYW1lPSdjb2wtc20tMSc+XG4gICAgICAgICAgPGRpdiBpZD0ndXBWb3RlJz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdidG4gYnRuLW1kIGJ0bi1kZWZhdWx0JyBvbkNsaWNrPXtmdW5jdGlvbigpIHt0aGlzLnZvdGUoJ3VwJyl9LmJpbmQodGhpcyl9IHN0eWxlPXsodGhpcy5wcm9wcy52b3RlZE9uW3RoaXMucHJvcHMudmlkZW8uaWRdID09PSAndXAnKSA/IHtib3JkZXI6ICcycHggc29saWQgZ3JlZW4nfSA6IHt9fT48c3BhbiBjbGFzc05hbWU9J2dseXBoaWNvbiBnbHlwaGljb24tY2lyY2xlLWFycm93LXVwJz4ge3RoaXMucHJvcHMudmlkZW8udXBWb3RlfTwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn07XG5cblxuY2xhc3MgUXVldWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB2aWRlb0xpc3Q6IFtdLFxuICAgICAgdm90ZWRPbjoge30sXG4gICAgICBoYXNWaWRlb3M6IGZhbHNlXG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlUXVldWUoKTtcblxuICAgIC8vIFRoaXMgaXMgd2hhdCB1cGRhdGVzIHRoZSBxdWV1ZSBldmVyeSB0aW1lIHlvdSBvciBhbm90aGVyIHVzZXJcbiAgICAvLyBjYXVzZXMgYW55IHNvcnQgb2YgY2hhbmdlIG9uIHRoZSBxdWV1ZS4gVGhpcyBpbmNsdWRlc1xuICAgIC8vIHZvdGVzLCBhZGRpdGlvbnMsIGFuZCBzdWJ0cmFjdGlvbnMuXG4gICAgdGhpcy5wcm9wcy5zb2NrZXQub24oJ3F1ZXVlQ2hhbmdlJywgZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMudXBkYXRlUXVldWUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9XG5cblxuICAvLyBVcGRhdGVzIHRoZSBxdWV1ZSB3aXRoIGFsbCB2aWRlbyBkYXRhLCBzdWNoIHRoYXQgdm90ZXMgYW5kXG4gIC8vIHNvbmdzIGFyZSBhbGwgY29uc2lzdGVudGx5IHVwIHRvIGRhdGUgZm9yIGV2ZXJ5IHVzZXIgaW4gdGhlXG4gIC8vIGJvb2dpZSBib3hcblxuICAvLyBOb3RlOiB0aGlzIGFsc28gc29ydHMgdGhlIG91dHB1dCBieSB2b3RlIHNjb3JlIChpLmUuIHVwIC0gZG93bilcbiAgdXBkYXRlUXVldWUoKSB7XG4gICAgdmFyIGhhZFZpZGVvcyA9IHRoaXMuc3RhdGUuaGFzVmlkZW9zO1xuICAgIHZhciBnZXRWaWRlb3NDYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igb24gcmV0cmlldmluZyB2aWRlb3MnLCBlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGhhc1ZpZGVvcyA9IGRhdGEubGVuZ3RoID4gMDtcblxuICAgICAgICBkYXRhLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHZhciBiU2NvcmUgPSBiLnVwVm90ZSAtIGIuZG93blZvdGU7XG4gICAgICAgICAgdmFyIGFTY29yZSA9IGEudXBWb3RlIC0gYS5kb3duVm90ZTtcblxuICAgICAgICAgIHJldHVybiBiU2NvcmUgLSBhU2NvcmU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHZpZGVvTGlzdDogZGF0YSxcbiAgICAgICAgICBoYXNWaWRlb3M6IGhhc1ZpZGVvc1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIWhhZFZpZGVvcyAmJiB0aGlzLnN0YXRlLmhhc1ZpZGVvcykge1xuICAgICAgICAgIHRoaXMucHJvcHMuc3RhcnRWaWRlbygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICBhcGlIZWxwZXIuZ2V0VmlkZW9zKGdldFZpZGVvc0NhbGxiYWNrLmJpbmQodGhpcykpO1xuICB9XG5cblxuICAvLyBUaGlzIG1ldGhvZCBpcyByZXNwb25zaWJsZSBmb3IgYWR2YW5jaW5nIHRoZSBxdWV1ZSB3aGVuZXZlclxuICAvLyB0aGUgY3VycmVudCBzb25nIGlzIGRvbmUgcGxheWluZy4gSXQgcmVtb3ZlcyB0aGUgdG9wIHNvbmdcbiAgLy8gZnJvbSB0aGUgcXVldWUgYW5kIHJldHVybnMgaXQgc28gdGhlIHBsYXllciBjYW4gc3RhcnRcbiAgLy8gcGxheWluZyB0aGF0LlxuICBhZHZhbmNlUXVldWUoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuaGFzVmlkZW9zKSB7XG4gICAgICB2YXIgbmV3VmlkID0gdGhpcy5zdGF0ZS52aWRlb0xpc3RbMF07XG5cbiAgICAgIGFwaUhlbHBlci5yZW1vdmVWaWRlbyhuZXdWaWQsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhcGlIZWxwZXIuZ2V0VmlkZW9zKGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgICAgIHZhciBoYXNWaWRlb3MgPSBkYXRhLmxlbmd0aCA+IDA7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2aWRlb0xpc3Q6IGRhdGEsXG4gICAgICAgICAgICBoYXNWaWRlb3M6IGhhc1ZpZGVvc1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgcmV0dXJuIG5ld1ZpZDtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICB2YXIgcXVldWVFbGVtZW50cyA9IFtdO1xuICAgIHZhciB2b3RlZE9uID0gdGhpcy5zdGF0ZS52b3RlZE9uO1xuICAgIF8uZWFjaCh0aGlzLnN0YXRlLnZpZGVvTGlzdCwgZnVuY3Rpb24odmlkZW8pIHtcbiAgICAgIHF1ZXVlRWxlbWVudHMucHVzaCg8UXVldWVFbGVtZW50IHZpZGVvPXt2aWRlb30gdm90ZWRPbj17dm90ZWRPbn0ga2V5PXt2aWRlby5pZH0vPik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBpZD0ncVBhbmVsJyBjbGFzc05hbWU9J3BhbmVsIHBhbmVsLWRlZmF1bHQnPlxuICAgICAgICA8ZGl2IGlkPSdxUGFuZWxIZWFkJyBjbGFzc05hbWU9J3BhbmVsLWhlYWRpbmcnPlxuICAgICAgICAgIDxBZGQgdXBkYXRlUXVldWU9e3RoaXMudXBkYXRlUXVldWUuYmluZCh0aGlzKX0vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBpZD0ncVBhbmVsQm9keScgY2xhc3NOYW1lPSdwYW5lbC1ib2R5Jz5cbiAgICAgICAgICA8ZGl2IGlkPSdxVGV4dEJvZHknPnsgcXVldWVFbGVtZW50cyB9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufTtcblxud2luZG93LkFkZCA9IEFkZDtcbndpbmRvdy5RdWV1ZSA9IFF1ZXVlOyJdfQ==