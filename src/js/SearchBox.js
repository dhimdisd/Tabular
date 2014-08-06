/** @jsx React.DOM */

var React = require('react');

var bp = chrome.extension.getBackgroundPage();

module.exports = React.createClass({
  searchTimeout: undefined,
  handleChange: function(event) {
    function matchedIndices(search, text) {
      var indices = [];
      var i = 0;
      var j = 0;
      for (i; i < text.length; i++) {
        if (search[j] && search[j].toUpperCase() === text[i].toUpperCase()) {
          indices[i] = true;
          j++;
        } else {
          indices[i] = false;
        }
      }
      return indices;
    }

    var _this = this;
    if (_this.searchTimeout !== undefined) clearTimeout(_this.searchTimeout);
    _this.searchTimeout = setTimeout(function() {
      var searchVal = _this.refs.input.getDOMNode().value;
      var searchRgx = new RegExp(searchVal.replace(/(.)/g, '$1' + '.*'), 'i');
      var filteredTabs = bp.tabs.filter(function(tab) {
        return searchRgx.test(tab.title) || searchRgx.test(tab.url);
      });
      var matches = filteredTabs.map(function(tab) {
        var matchedTitleIndices =
        searchRgx.test(tab.title)
        ? matchedIndices(searchVal, tab.title)
        : tab.title.split('').map(function(c) { return false; });
        var matchedUrlIndices =
        searchRgx.test(tab.url)
        ? matchedIndices(searchVal, tab.url)
        : tab.url.split('').map(function(c) { return false; });

        return {
          matchedTitleIndices: matchedTitleIndices,
          matchedUrlIndices: matchedUrlIndices
        };
      });

      _this.props.onInput({
        tabs: filteredTabs,
        highlightedId: filteredTabs[0] ? filteredTabs[0].id : null,
        matches: matches
      });
    }, 500);
  },
  render: function() {
    return (
      <form>
        <input
        type='text'
        placeholder='Search page titles and URLs...'
        autoFocus='true'
        ref='input'
        onChange={this.handleChange} />
      </form>
    );
  }
});

