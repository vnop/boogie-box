//Component for adding new URLs
class Add extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
  }

  urlSubmit(event) {
    event.preventDefault();
    var inputVal = this.refs.addUrlField.value;
    if (this.validYoutubeUrl(inputVal)) {
      this.refs.addUrlField.style = 'outline: initial';
      this.setState({
        error: ''
      });
      apiHelper.postVideo(inputVal, function() {
        this.props.updateQueue();
      }.bind(this));
      this.refs.addUrlField.value = '';
    } else {
      console.log('Not a valid youtube link');
      this.refs.addUrlField.style = 'outline: 1px solid red';
      this.setState({
        error: 'Please input a valid Youtube URL'
      });
    }
    console.log('currentUrl', appData.currentUrl);
  }

  validYoutubeUrl(url) {
    var url1 = 'youtube.com';

    return url.indexOf(url1) !== -1 && url.indexOf('?v=') !== -1;
  }

  render() {
    return (
      <div>
        <span id='qAddText'>Video URL</span>
        <form onSubmit={this.urlSubmit.bind(this)}>
          <label id='vidSubmit'>
            <input className="form-control" id="focusedInput" type="text" ref="addUrlField"/>
          </label>
          <input className='btn btn-sm btn-primary' type="submit" value="Submit"/>
        </form>
        {this.state.error}
      </div>
    )
  }
};

class QueueElement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      upVote: this.props.video.upVote,
      downVote: this.props.video.downVote,
      downVoted: false,
      upVoted: false,
      downStyle: {},
      upStyle: {}
    };
  }

  voteUp() {
    if(this.state.upVoted) {
      console.log('CHECK OUT THESE VOTES', this.props.video.upVote);
      this.setState({
        upVote: this.state.upVote - 1,
        upVoted: false,
        upStyle: {}
      });
    } else if (this.state.downVoted) {
      console.log('CHECK OUT THESE VOTES', this.props.video.upVote);
      this.setState({
        upVote: this.state.upVote + 1,
        upVoted: true,
        upStyle: {border: '2px solid green'},
        downVote: this.state.downVote - 1,
        downVoted: false,
        downStyle: {}
      });
    } else {
      console.log('CHECK OUT THESE VOTES', this.props.video.upVote);
      this.setState({
        upVote: this.state.upVote + 1,
        upVoted: true,
        upStyle: {border: '2px solid green'}
      });
    }
  }

  voteDown() {
    if(this.state.downVoted) {
      this.setState({
        downVote: this.state.downVote - 1,
        downVoted: false,
        downStyle: {}
      });
    } else if (this.state.upVoted) {
      this.setState({
        downVote: this.state.downVote + 1,
        downVoted: true,
        downStyle:  {border: '2px solid red'},
        upVote: this.state.upVote - 1,
        upVoted: false,
        upStyle: {}
      });
    } else {
      this.setState({
        downVote: this.state.downVote + 1,
        downVoted: true,
        downStyle: {border: '2px solid red'}
      });
    }
  }

  render() {
    return (
      <div id='qEntry' className='container'>
        <div id='vidInQ' className='col-sm-10'>
          <div id='vidTitle'>
            <a href={this.props.video.videourl} target="_blank">{this.props.video.title}</a>
          </div>
        </div>

        <div id='dwnVoteCol' className='col-sm-1'>
          <div id='dwnVote'>
            <button className='btn btn-md btn-default' onClick={this.voteDown.bind(this)} style={this.state.downStyle}><span className='glyphicon glyphicon-circle-arrow-down'> {this.state.downVote}</span></button>
          </div>
        </div>
        <div id='upVoteCol' className='col-sm-1'>
          <div id='upVote'>
            <button className='btn btn-md btn-default' onClick={this.voteUp.bind(this)} style={this.state.upStyle}><span className='glyphicon glyphicon-circle-arrow-up'> {this.state.upVote}</span></button>
          </div>
        </div>
      </div>
    )
  }
};


class Queue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      videoList: [],
      hasVideos: false
    };

    this.updateQueue();
  }

  updateQueue() {
    var hadVideos = this.state.hasVideos;
    var getVideosCallback = function(err, data) {
      if (err) {
        console.log('Error on retrieving videos', err);
      } else {
        var hasVideos = data.length > 0;
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

  advanceQueue() {
    if (this.state.hasVideos) {
      var newVid = this.state.videoList[0];

      apiHelper.removeVideo(newVid, function() {
        apiHelper.getVideos(function(err, data) {
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

  render() {
    var queueElements = [];
    _.each(this.state.videoList, function(video) {
      queueElements.push(<QueueElement video={video} key={video.id}/>);
    });

    return (
      <div id='qPanel' className='panel panel-default'>
        <div id='qPanelHead' className='panel-heading'>
          <Add updateQueue={this.updateQueue.bind(this)}/>
        </div>
        <div id='qPanelBody' className='panel-body'>
          <div id='qTextBody'>{ queueElements }</div>
        </div>
      </div>
    );
  }
};

window.Add = Add;
window.Queue = Queue;