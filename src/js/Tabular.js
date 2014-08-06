/** @jsx React.DOM */

var React = require('react');
var TabList = require('./TabList');
var SearchBox = require('./SearchBox');
var $ = require('./lib/build/jquery');

var bp = chrome.extension.getBackgroundPage();

module.exports = React.createClass({

  getInitialState: function() {
    bp.getTabs();
    var tabs = bp.tabs;
    return {
      tabs: tabs,
      highlightedId: tabs[1] ? tabs[1].id : tabs[0].id,
      matches: null
    };
  },

  handleInput: function(input) {
    this.setState(input);
  },

  handleMouseEnterListItem: function(newHighlightedId) {
    this.setState({ highlightedId: newHighlightedId });
  },

  handleCloseTab: function(oldHighlightedId, index) {
    var newMatches = null;
    if (this.state.matches != null) {
      newMatches = [];
      for (var i = 0; i < this.state.matches.length; i++) {
        if (i !== index) {
          newMatches.push(this.state.matches[i]);
        }
      }
    }

    var newTabs = [];
    if (this.state.tabs) {
      for (var j = 0; j < this.state.tabs.length; j++) {
        if (j !== index) {
          newTabs.push(this.state.tabs[j]);
        }
      }
    }

    var newIndex = index;
    if (newIndex >= newTabs.length) {
      --newIndex;
    }

    this.setState({
      tabs: newTabs,
      highlightedId: newTabs.length ? newTabs[newIndex].id : null,
      matches: newMatches
    });
  },

  componentDidMount: function() {
    document.addEventListener('keydown', this.handleKeyDown);
    var _this = this;
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      var newTabs = [];
      if (request.event === 'tabUpdated') {
        newTabs = _this.state.tabs.map(function(tab, index, arr) {
          if (request.tab.id === tab.id) {
            return request.tab;
          } else {
            return tab;
          }
        });

        _this.setState({ tabs: newTabs });
      } else if (request.event === 'tabRemoved') {
        if (!bp.tabs.length) {
          window.close();
        }
      }

    });
  },

  componentWillUnmount: function() {
    document.removeEventListener('keydown', this.handleKeyDown);
  },

  handleKeyDown: function(event) {
    var KeyCode = {
      ENTER: 13,
      DOWN: 40,
      UP: 38,
      J: 74,
      K: 75,
      D: 68,
      DELETE: 46,
      ESC: 27
    };

    var i;

    if (event.keyCode === KeyCode.ENTER) {
      id = parseInt($('.highlighted').attr('id'), 10);
      chrome.tabs.get(id, function(tab) {
        chrome.tabs.update(tab.id, {
          'active': true,
          'highlighted': true
        }, function() {
          if (chrome.runtime.lastError) {
            for (var i = 0; i < bp.tabs.length; i++) {
              if (id === bp.tabs[i].length) {
                bp.tabs.splice(i, 1);
                break;
              }
            }
          }
        });
        chrome.windows.update(tab.windowId, {
          'focused': true
        });
      });

      // move highlighted selection up
    } else if ((event.keyCode == KeyCode.UP)
      || (event.metaKey && event.keyCode == KeyCode.K)
    || (event.ctrlKey && event.keyCode == KeyCode.K)) {

      event.preventDefault();
      event.stopPropagation();

      var nextId;
      for (i = 0; i < this.state.tabs.length; i++) {
        if (this.state.highlightedId === this.state.tabs[i].id) {
          if (i - 1 >= 0) {
            nextId = this.state.tabs[i - 1].id;
          } else {
            nextId = this.state.tabs[this.state.tabs.length - 1].id;
          }
          break;
        }
      }
      this.setState({
        highlightedId: nextId
      });

      // move highlighted selection down
    } else if ((event.keyCode == KeyCode.DOWN)
      || (event.metaKey && event.keyCode == KeyCode.J)
    || (event.ctrlKey && event.keyCode == KeyCode.J)) {

      event.preventDefault();
      event.stopPropagation();

      var nextId;
      for (i = 0; i < this.state.tabs.length; i++) {
        if (this.state.highlightedId === this.state.tabs[i].id) {
          if (i + 1 < this.state.tabs.length) {
            nextId = this.state.tabs[i + 1].id;
          } else {
            nextId = this.state.tabs[0].id;
          }
          break;
        }
      }
      this.setState({
        highlightedId: nextId
      });

      // remove tab
    } else if ((event.metaKey && (event.keyCode == KeyCode.D))
      || (event.ctrlKey && event.keyCode == KeyCode.D)
    || (event.keyCode == KeyCode.DELETE)) {

      event.preventDefault();
      event.stopPropagation();
      document.querySelector('.highlighted .close-btn').click();

      // close popup
    } else if (event.keyCode === KeyCode.ESC) {
      if (bp.popupWindowId != null) {
        chrome.windows.remove(bp.popupWindowId, function() {
          bp.popupWindowId = null;
        });
      }
    }

  },

  render: function() {
    return (
      <div id='app'>
        <SearchBox onInput={this.handleInput}/>
        <TabList
          app={this}
          data={this.state.tabs}
          highlightedId={this.state.highlightedId}
          matches={this.state.matches}
          onCloseTab={this.handleCloseTab}
          onMouseEnterListItem={this.handleMouseEnterListItem} />
      </div>
    );
  }

});
