/**
 * Created by developercomputer on 27.10.15.
 */
var React = require("react"),
    TutorialList = require("./../../components/video/tutorials/tutorial");

class TutorialsPage extends React.Component {
  render() {
    return (
        <div className="page-content white">
          <form
              className="searchbar searchbar-init"
              data-search-list=".video--tutorials--list"
              data-search-in=".title"
              data-found=".video--tutorials--list"
              data-not-found=".searchbar-not-found"
              >
            <div className="searchbar-input">
              <input type="search" placeholder="Search"/>
                <a href="#" className="searchbar-clear"></a>
              </div>
              <a href="#" className="searchbar-cancel">Cancel</a>
            </form>

            <div className="searchbar-overlay"></div>
          <TutorialList/>
        </div>
    );
  }
}

module.exports = TutorialsPage;