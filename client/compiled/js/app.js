"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));
  }

  // Passed to relevant components so that
  // they can manage pulling from the queue
  // and playing new videos.
  // refers to the advanceQueue method in
  // the Queue component


  _createClass(App, [{
    key: "advanceQueue",
    value: function advanceQueue() {
      return this.refs.queue.advanceQueue();
    }

    // Used to start playing a video in the event
    // that the state of the player should go from
    // empty to playing a particular video.
    // refers to the startVideo method in the
    // Video component

  }, {
    key: "startVideo",
    value: function startVideo() {
      this.refs.player.startVideo();
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { id: "app", className: "container" },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "div",
              { id: "titleText", className: "jumbostron text-center" },
              React.createElement(
                "h1",
                null,
                "Boogie-Box"
              ),
              React.createElement(
                "p",
                null,
                "it's boogie time"
              )
            )
          )
        ),
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "col-md-7" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(Video, { advanceQueue: this.advanceQueue.bind(this), socket: this.props.socket, adminFlag: this.props.adminFlag, video: null, ref: "player" })
            ),
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(Queue, { socket: this.props.socket, ref: "queue", startVideo: this.startVideo.bind(this) })
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-5" },
            React.createElement(Chat, { socket: this.props.socket })
          )
        )
      );
    }
  }]);

  return App;
}(React.Component);

window.App = App;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9hcHAuanN4Il0sIm5hbWVzIjpbIkFwcCIsInByb3BzIiwicmVmcyIsInF1ZXVlIiwiYWR2YW5jZVF1ZXVlIiwicGxheWVyIiwic3RhcnRWaWRlbyIsImJpbmQiLCJzb2NrZXQiLCJhZG1pbkZsYWciLCJSZWFjdCIsIkNvbXBvbmVudCIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUFNQSxHOzs7QUFDSixlQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUEscUdBQ1hBLEtBRFc7QUFFbEI7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7bUNBQ2U7QUFDYixhQUFPLEtBQUtDLElBQUwsQ0FBVUMsS0FBVixDQUFnQkMsWUFBaEIsRUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7aUNBQ2E7QUFDWCxXQUFLRixJQUFMLENBQVVHLE1BQVYsQ0FBaUJDLFVBQWpCO0FBQ0Q7Ozs2QkFDUTtBQUNQLGFBQ0U7QUFBQTtBQUFBLFVBQUssSUFBRyxLQUFSLEVBQWMsV0FBVSxXQUF4QjtBQUNFO0FBQUE7QUFBQSxZQUFLLFdBQVUsS0FBZjtBQUNFO0FBQUE7QUFBQSxjQUFLLFdBQVUsV0FBZjtBQUNFO0FBQUE7QUFBQSxnQkFBSyxJQUFHLFdBQVIsRUFBb0IsV0FBVSx3QkFBOUI7QUFDRTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBREY7QUFFRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRkY7QUFERjtBQURGLFNBREY7QUFVRTtBQUFBO0FBQUEsWUFBSyxXQUFVLEtBQWY7QUFDRTtBQUFBO0FBQUEsY0FBSyxXQUFVLFVBQWY7QUFDRTtBQUFBO0FBQUEsZ0JBQUssV0FBVSxLQUFmO0FBQ0Usa0NBQUMsS0FBRCxJQUFPLGNBQWMsS0FBS0YsWUFBTCxDQUFrQkcsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBckIsRUFBbUQsUUFBUSxLQUFLTixLQUFMLENBQVdPLE1BQXRFLEVBQThFLFdBQVcsS0FBS1AsS0FBTCxDQUFXUSxTQUFwRyxFQUErRyxPQUFPLElBQXRILEVBQTRILEtBQUksUUFBaEk7QUFERixhQURGO0FBS0U7QUFBQTtBQUFBLGdCQUFLLFdBQVUsS0FBZjtBQUNFLGtDQUFDLEtBQUQsSUFBTyxRQUFRLEtBQUtSLEtBQUwsQ0FBV08sTUFBMUIsRUFBa0MsS0FBSSxPQUF0QyxFQUE4QyxZQUFZLEtBQUtGLFVBQUwsQ0FBZ0JDLElBQWhCLENBQXFCLElBQXJCLENBQTFEO0FBREY7QUFMRixXQURGO0FBV0U7QUFBQTtBQUFBLGNBQUssV0FBVSxVQUFmO0FBQ0UsZ0NBQUMsSUFBRCxJQUFNLFFBQVEsS0FBS04sS0FBTCxDQUFXTyxNQUF6QjtBQURGO0FBWEY7QUFWRixPQURGO0FBNkJEOzs7O0VBcERlRSxNQUFNQyxTOztBQXVEeEJDLE9BQU9aLEdBQVAsR0FBYUEsR0FBYiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgfVxyXG5cclxuICAvLyBQYXNzZWQgdG8gcmVsZXZhbnQgY29tcG9uZW50cyBzbyB0aGF0XHJcbiAgLy8gdGhleSBjYW4gbWFuYWdlIHB1bGxpbmcgZnJvbSB0aGUgcXVldWVcclxuICAvLyBhbmQgcGxheWluZyBuZXcgdmlkZW9zLlxyXG4gIC8vIHJlZmVycyB0byB0aGUgYWR2YW5jZVF1ZXVlIG1ldGhvZCBpblxyXG4gIC8vIHRoZSBRdWV1ZSBjb21wb25lbnRcclxuICBhZHZhbmNlUXVldWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWZzLnF1ZXVlLmFkdmFuY2VRdWV1ZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gVXNlZCB0byBzdGFydCBwbGF5aW5nIGEgdmlkZW8gaW4gdGhlIGV2ZW50XHJcbiAgLy8gdGhhdCB0aGUgc3RhdGUgb2YgdGhlIHBsYXllciBzaG91bGQgZ28gZnJvbVxyXG4gIC8vIGVtcHR5IHRvIHBsYXlpbmcgYSBwYXJ0aWN1bGFyIHZpZGVvLlxyXG4gIC8vIHJlZmVycyB0byB0aGUgc3RhcnRWaWRlbyBtZXRob2QgaW4gdGhlXHJcbiAgLy8gVmlkZW8gY29tcG9uZW50XHJcbiAgc3RhcnRWaWRlbygpIHtcclxuICAgIHRoaXMucmVmcy5wbGF5ZXIuc3RhcnRWaWRlbygpO1xyXG4gIH1cclxuICByZW5kZXIoKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2IGlkPVwiYXBwXCIgY2xhc3NOYW1lPVwiY29udGFpbmVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLW1kLTEyXCI+XHJcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJ0aXRsZVRleHRcIiBjbGFzc05hbWU9XCJqdW1ib3N0cm9uIHRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgPGgxPkJvb2dpZS1Cb3g8L2gxPlxyXG4gICAgICAgICAgICAgIDxwPml0J3MgYm9vZ2llIHRpbWU8L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC1tZC03XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XHJcbiAgICAgICAgICAgICAgPFZpZGVvIGFkdmFuY2VRdWV1ZT17dGhpcy5hZHZhbmNlUXVldWUuYmluZCh0aGlzKX0gc29ja2V0PXt0aGlzLnByb3BzLnNvY2tldH0gYWRtaW5GbGFnPXt0aGlzLnByb3BzLmFkbWluRmxhZ30gdmlkZW89e251bGx9IHJlZj1cInBsYXllclwiLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxyXG4gICAgICAgICAgICAgIDxRdWV1ZSBzb2NrZXQ9e3RoaXMucHJvcHMuc29ja2V0fSByZWY9XCJxdWV1ZVwiIHN0YXJ0VmlkZW89e3RoaXMuc3RhcnRWaWRlby5iaW5kKHRoaXMpfS8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtbWQtNVwiPlxyXG4gICAgICAgICAgICA8Q2hhdCBzb2NrZXQ9e3RoaXMucHJvcHMuc29ja2V0fS8+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKVxyXG4gIH1cclxufVxyXG5cclxud2luZG93LkFwcCA9IEFwcDsiXX0=