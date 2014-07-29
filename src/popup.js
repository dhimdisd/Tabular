/** @jsx React.DOM */
(function(w, $) {
  $(function() {
    function fetchTabs() { w.tabs = bp.tabs; }

    var bp = chrome.extension.getBackgroundPage();

    var Tab = React.createClass({
      handleClick: function(event) {
        chrome.tabs.update(this.props.data.id, {
          'active': true,
          'highlighted': true
        });

        chrome.windows.update(this.props.data.windowId, { 'focused': true });
      },
      handleMouseOver: function(event) {
        $(this.getDOMNode())
          .addClass('highlighted')
          .siblings()
          .removeClass('highlighted');
      },
      render: function() {
        var tab = (
          <li
            id={this.props.data.id}
            onClick={this.handleClick}
            onMouseOver={this.handleMouseOver}>

            <div className="favIconContainer"><img src={this.props.data.favIconUrl}/></div>
            <section className="tabDetails">
              <h2 className="title">{this.props.data.title}</h2>
              <p className="url">{this.props.data.url}</p>
            </section>
          </li>
        );

        return tab;
      }
    });

    var TabList = React.createClass({
      render: function() {
        var tabs = this.props.data.map(function(tab) {
          return <Tab data={tab} />;
        });

        return <ul id="tabsList">{tabs}</ul>;
      }
    });

    var tabListContainer = document.getElementById('tabListContainer');

    // initialize tab list view
    fetchTabs();
    React.renderComponent(<TabList data={w.tabs} />, tabListContainer);

    var $tabList = $('#tabsList');
    if ($tabList.find('li:nth(1)').length > 1) {
      $tabList.find('li:nth(1)').addClass('highlighted');
    } else {
      $tabList.find('li:nth(0)').addClass('highlighted');
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      switch (request.event) {
        case 'tabCreated':
        case 'tabRemoved':
        case 'tabUpdated':
        case 'tabActivated':
          fetchTabs();
          React.renderComponent(<TabList data={w.tabs} />, tabListContainer);
        default:
          break;
      }
    });
  });
})(window, jQuery);
