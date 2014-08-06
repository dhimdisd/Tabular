/** @jsx React.DOM */

var React = require('react');
var Tab = require('./Tab');

module.exports = React.createClass({
  render: function() {
    var props = this.props;
    var tabs = props.data.map(function(tab, index) {
      var matches = props.matches ? props.matches[index] : null;
      return (
        <Tab
          app={props.app}
          data={tab}
          highlightedId={props.highlightedId}
          matches={matches}
          onCloseTab={props.onCloseTab}
          onMouseEnterListItem={props.onMouseEnterListItem} />
      );
    });

    return <ul id='tabsList'>{tabs}</ul>;
  }
});
