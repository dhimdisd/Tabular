/** @jsx React.DOM */

var React = require('react');

var bp = chrome.extension.getBackgroundPage();

module.exports = React.createClass({
  searchTimeout: undefined,

  handleChange: function(event) {
    function matchedIndices(search, found, text) {
      var indices = [];
      var foundIndex = text.indexOf(found);
      var i = 0;
      var j = 0;
      for (i; i < text.length; i++) {
        if (search[j] && search[j].toUpperCase() === text[i].toUpperCase()) {
          if (i >= foundIndex && i < foundIndex + found.length) {
            indices[i] = true;
            j++;
          } else {
            indices[i] = false;
          }
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
      var searchRgx = new RegExp(searchVal.replace(/(.)/g, '$1' + '.*?'), 'gi');

      var filtered = [];
      bp.tabs.forEach(function(tab, idx, arr) {
        var titleMatches = tab.title.match(searchRgx);
        var urlMatches = tab.url.match(searchRgx);
        if (!titleMatches) {
          titleMatches = [];
        }
        if (!urlMatches) {
          urlMatches = [];
        }
        var smallestTitleMatch = '';
        var smallestUrlMatch = '';
        if (titleMatches.length || urlMatches.length) {
          titleMatches.forEach(function(match, idx, arr) {
            if (0 === idx || match.length < smallestTitleMatch.length) {
              smallestTitleMatch = match;
            }
          });

          urlMatches.forEach(function(match, idx, arr) {
            if (0 === idx || match.length < smallestUrlMatch.length) {
              smallestUrlMatch = match;
            }
          });

          filtered.push({
            titleMatch: smallestTitleMatch,
            urlMatch: smallestUrlMatch,
            tab: tab
          });
        }
      });

      filtered.sort(function(a, b) {
        function lenOrMaxVal(s) {
          return s.length ? s.length : Number.MAX_VALUE;
        }

        var aMinDiff = Math.min(
          lenOrMaxVal(a.titleMatch),
          lenOrMaxVal(a.urlMatch));

        var bMinDiff = Math.min(
          lenOrMaxVal(b.titleMatch),
          lenOrMaxVal(b.urlMatch));

        return aMinDiff - bMinDiff;
      });

      var filteredTabs = [];
      var matches = [];
      filtered.forEach(function(item, idx, arr) {
        var tab = item.tab;
        filteredTabs.push(tab);

        var matchedTitleIndices =
          item.titleMatch.length
            ? matchedIndices(searchVal, item.titleMatch, tab.title)
            : tab.title.split('').map(function(c) { return false; });

        var matchedUrlIndices =
          item.urlMatch.length
            ? matchedIndices(searchVal, item.urlMatch, tab.url)
            : tab.url.split('').map(function(c) { return false; });

        matches.push({
          matchedTitleIndices: matchedTitleIndices,
          matchedUrlIndices: matchedUrlIndices
        })
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

