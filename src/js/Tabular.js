/** @jsx React.DOM */

var React = require('react');
var TabList = require('./TabList');
var SearchBox = require('./SearchBox');
var $ = require('./lib/build/jquery');

var bp = chrome.extension.getBackgroundPage();

module.exports = React.createClass({

  getInitialState: function() {
    
    bp.removeUnkownTabs();
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
      } else if (request.event === 'Update'){
        var state = { tabs: request.tabs };
        if (request.highlightedId){
          state.highlightedId = request.highlightedId;
        }
        _this.setState(state); 
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
    var nextId;
    var highlighted = $('.highlighted');

    if (event.keyCode === KeyCode.ENTER) {
      id = parseInt(highlighted.attr('id'), 10);
      chrome.tabs.get(id, function(tab) {
        if (!chrome.runtime.lastError && tab){
          chrome.tabs.update(tab.id, {
            'active': true,
            'highlighted': true
          }, function() {
            if (chrome.runtime.lastError) {
              for (var i = 0; i < bp.tabs.length; i++) {
                if (!bp.tabs[i] || id === bp.tabs[i].id) {
                  bp.tabs.splice(i, 1);
                  if (bp.tabs[i])
                    break;
                }
              }
            }
          });
          chrome.windows.update(tab.windowId, {
            'focused': true
          });
        }
        else{
          for (var i = 0; i < bp.tabs.length; i++) {
            if (!bp.tabs[i] || id === bp.tabs[i].id) {
              bp.tabs.splice(i, 1);
              if(bp.tabs[i])
                break;
            }
          }
        }
      });

      // move highlighted selection up
    } else if ((event.keyCode == KeyCode.UP)
              || (event.metaKey && event.keyCode == KeyCode.K)
              || (event.ctrlKey && event.keyCode == KeyCode.K)) {

      event.preventDefault();
      event.stopPropagation();

      if (!highlighted.is(':first-child')){
        nextId = parseInt(
          highlighted.prev().attr('id'), 10
        );
        
      } else {
        nextId = parseInt(
          highlighted.parent()
            .children(':last').attr('id'), 10
        );
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

      if (!highlighted.is(':last-child')){
        nextId = parseInt(
          highlighted.next().attr('id'), 10
        );
        
      } else {
        nextId = parseInt(
          highlighted.parent()
            .children(':first').attr('id') , 10
        );
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
      if (bp.popupWindowId !== null) {
        chrome.windows.remove(bp.popupWindowId, function() {
          bp.popupWindowId = null;
        });
      }
    }
  },

  render: function() {
    return (
      <div id='app'>
        <SearchBox onInput={this.handleInput} />
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
