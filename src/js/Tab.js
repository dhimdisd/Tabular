/** @jsx React.DOM */

var React = require('react');
var $ = require('./lib/build/jquery');

var bp = chrome.extension.getBackgroundPage();

module.exports = React.createClass({

  componentDidUpdate: function() {
    var $node = $(this.getDOMNode());
    var props = this.props;
    if (props.data.id === props.highlightedId && !$node.isOnScreen()) {
      $node.goTo();
    }
  },

  handleClick: function(event) {
    
    var tab = this.props.data;
    var id = this.props.data.id;
    chrome.tabs.update(this.props.data.id, {
      'active': true,
      'highlighted': true
    }, function() {
      if (chrome.runtime.lastError) {
        console.log("Im at the error");
        //remove unkown tab
        for (var i = 0; i < bp.tabs.length; i++) {
          if (id === bp.tabs[i].id) {
            bp.tabs.splice(i, 1);
            break;
          }
        }
        $('#' + id ).remove();
      }
      else {
        chrome.windows.update(tab.windowId, { 'focused': true });
      }
    });
  },

  handleMouseEnter: function(event) {
    this.props.onMouseEnterListItem(this.props.data.id);
  },

  handleCloseTab: function(event) {
    event.stopPropagation();
    var app = this.props.app;
    for (var i = 0; i < app.state.tabs.length; i++) {
      if (this.props.data.id === app.state.tabs[i].id) {
        break;
      }
    }
    var id = this.props.data.id;
    this.props.onCloseTab(id, i);
    chrome.tabs.remove(id, function() {
       for (var i = 0; i < bp.tabs.length; i++) {
        if (id === bp.tabs[i].id) {
          bp.tabs.splice(i, 1);
          break;
        }
       }
    });
  },

  render: function() {
    var data = this.props.data;
    var matches = this.props.matches;

    var title = data.title.length > 50 ? data.title.substring(0,50).concat('...') : data.title;
    title = title.split('').map(function(c, i) {
      if (matches && matches.matchedTitleIndices[i]) {
        return React.DOM.strong({ style: { color: 'red' } }, c);
      } else {
        return c;
      }
    });


    var url = data.url.length > 50 ? data.url.substring(0,50).concat('...') : data.url;
    url = url.split('').map(function(c, i) {
      if (matches && matches.matchedUrlIndices[i]) {
        return React.DOM.strong({ style: { color: 'red' } }, c);
      } else {
        return c;
      }
    });

    var tab = (
      <li
        id={data.id}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        className={this.props.highlightedId === data.id ? 'highlighted' : ''}>

        <div className='favIconContainer'>
          <img src={data.favIconUrl} />
        </div>
        <section className='tabDetails'>
          <h3 className='title'>{title}</h3>
          <p className='url'>{url}</p>
        </section>
        <div className='close-btn-container'>
          <div className='close-btn' onClick={this.handleCloseTab}></div>
        </div>
      </li>
    );

    return tab;
  }

});
