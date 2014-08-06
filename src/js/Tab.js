/** @jsx React.DOM */

var React = require('react');
var $ = require('./lib/build/jquery');

module.exports = React.createClass({

  componentDidUpdate: function() {
    var $node = $(this.getDOMNode());
    var props = this.props;
    if (props.data.id === props.highlightedId && !$node.isOnScreen()) {
      $node.goTo();
    }
  },

  handleClick: function(event) {
    chrome.windows.update(this.props.data.windowId, { 'focused': true });

    chrome.tabs.update(this.props.data.id, {
      'active': true,
      'highlighted': true
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
    chrome.tabs.remove(id);
  },

  render: function() {
    var data = this.props.data;
    var matches = this.props.matches;

    var title = data.title.split('').map(function(c, i) {
      if (matches && matches.matchedTitleIndices[i]) {
        return React.DOM.strong({ style: { color: 'red' } }, c);
      } else {
        return c;
      }
    });

    var url = data.url.split('').map(function(c, i) {
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

