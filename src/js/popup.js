/** @jsx React.DOM */

window.onload = function() {
  var React = require('react');
  var App = require('./Tabular');

  React.renderComponent(<App />, document.body);
};
