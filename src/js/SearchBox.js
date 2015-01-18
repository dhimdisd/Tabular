/** @jsx React.DOM */

var React = require('react');

var bp = chrome.extension.getBackgroundPage();

String.prototype.matchAll = function(r) {
  var matches = [];
  var str = '';
  var match = null;
  for (var i = 0; i < this.length; i++) {
    str = this.slice(i);
    match = r.exec(str);
    if (match) {
      i = str.indexOf(match[0]) + i;
      matches.push(match[0]);
    }
  }
  return matches;
};

module.exports = React.createClass({
  searchTimeout: undefined,

  handleChange: function(event) {
    function matchedIndices(search, found, text) {
      var indices = {};
      var fi = 0;
      var si = 0;
      var foundIndex = text.indexOf(found);

      for (; fi < found.length && si < search.length; fi++) {
        if (found[fi].toUpperCase() === search[si].toUpperCase()) {
          indices[fi + foundIndex] = true;
          si++;
        }
      }

      return indices;
    }

    var _this = this;
    if (_this.searchTimeout !== undefined) clearTimeout(_this.searchTimeout);
    _this.searchTimeout = setTimeout(function() {
      var searchVal = _this.refs.input.getDOMNode().value;
      var searchRgx = new RegExp(
        searchVal
          .split('')
          .map(function(c) { return '.' === c ? '\\.' : c; })
          .join('.*?'),
        'i');

      var matchedTabs = [];

      bp.getFilteredTabs().forEach(function(tab, idx, arr) {
        function shortestLength(prev, curr, idx, arr) {
          return prev.length < curr.length ? prev : curr;
        }

        var bestTitleMatch = '';
        var bestUrlMatch = '';
        var tabMatches = [
          tab.title.matchAll(searchRgx),
          tab.url.matchAll(searchRgx)
        ];

        if (tabMatches[0].length || tabMatches[1].length) {
          tabMatches = tabMatches.map(function(matches) {
            return matches.length ? matches.reduce(shortestLength, matches[0])
              : '';
          });

          matchedTabs.push({
            titleMatch: tabMatches[0],
            urlMatch: tabMatches[1],
            tab: tab
          });
        }
      });

      matchedTabs.sort(function(a, b) {
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

      var indices = matchedTabs.map(function(tabInfo, idx, arr) {
        var tab = tabInfo.tab;
        var titleMatch = tabInfo.titleMatch;
        var urlMatch = tabInfo.urlMatch;

        return {
          matchedTitleIndices: matchedIndices(searchVal, titleMatch, tab.title),
          matchedUrlIndices: matchedIndices(searchVal, urlMatch, tab.url)
        };
      });

      var tabs = matchedTabs.map(function(tabInfo) { return tabInfo.tab; });
      _this.props.onInput({
        tabs: tabs,
        highlightedId: tabs[0] ? tabs[0].id : null,
        matches: indices
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
