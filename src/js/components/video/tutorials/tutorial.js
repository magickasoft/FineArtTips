/**
 * Created by developercomputer on 27.10.15.
 */
var React = require("react"),
    Store = require("./../../../stores/store"),
    app = require("./../../../f7init/f7init"),
    YouTubeApi = require("./../../../api/youtube"),
    words = require("./../../../words");

class TutorialList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this._renderElements = this._renderElements.bind(this);
    this.fetchVideos = this.fetchVideos.bind(this);
  }

  componentDidMount() {
    Store.bind("fetchVideos", this.fetchVideos);
  }

  componentDidUpdate() {
    $$(`[data-page="videoTutorials-tutorials"]>.page-content`).scrollTo(0,0);
  }

  fetchVideos() {
    this.setState({ items: [] });
    return $$.getJSON(YouTubeApi.getVideos(Store.tutorialsId), data => {
      this.setState({ items: data.items });
    });
  }

  showVideo() {
    //if(screen && screen.lockOrientation) {
    //  screen.lockOrientation('landscape');
    //}
    var browser = app.f7.photoBrowser({
      photos: [
        {
          html: `<iframe src="https://www.youtube.com/embed/${this.videoId}/?autoplay=1&controls=1&showinfo=0&autohide=1&feature=player_embedded&rel=0" allowfullscreen frameborder="0"></iframe>`
        }
      ],
      theme: 'dark',
      navbarTemplate: `
        <div class="transparent navbar ">
            <div class="navbar-inner">
                <div class="left sliding">
                    <a href="#" class="link close-popup photo-browser-close-link">
                        <span class="close-transparent">${words.close[LN]}</span>
                    </a>
                </div>
            </div>
        </div>`,
      toolbarTemplate: "<div></div>",
      onOpen: () => {
        $$(".statusbar-overlay").css({ background: "#000" });
        try {
          AdMob.hideBanner();
        } catch(e) {
          console.log(e);
        }
      },
      onClose: () => {
        $$(".statusbar-overlay").css({ background: "#f7f7f8" });
        try {
          AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
        } catch(e) {
          console.log(e);
        }
      }
    });
    browser.open();
  }

  _renderElements() {
    if(this.state.items.length === 0) {
      return (
          <div></div>
      );
    }
    return this.state.items.map((item, i) => {
      var bg = {
        backgroundImage: `""`
      };
      if(item.snippet.hasOwnProperty("thumbnails")) {
        bg = {
          backgroundImage: `url(${item.snippet.thumbnails.high.url})`
        };
      } else {
        return null;
      }
      var context = {
        videoId: item.snippet.resourceId.videoId
      };
      return (
        <li key={i} onClick={this.showVideo.bind(context)}>
          <div className="thumbnail" style={bg}></div>
          <div className="title">{item.snippet.title}</div>
        </li>
      );
    });
  }

  render() {
    return (
        <div className="video--tutorials">
          <div className="video--tutorials--num">{this.state.items.length} videos:</div>
          <ul className="video--tutorials--list">
            {this._renderElements()}
          </ul>
        </div>
    );
  }
}

module.exports = TutorialList;
