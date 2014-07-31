/** @jsx React.DOM */
(function(w, $) {
  $(function() {
    function fetchTabs() { w.tabs = bp.tabs; }

    var bp = chrome.extension.getBackgroundPage();

    var Tab = React.createClass({displayName: 'Tab',
      handleClick: function(event) {
        chrome.windows.update(this.props.data.windowId, { 'focused': true });

        chrome.tabs.update(this.props.data.id, {
          'active': true,
          'highlighted': true
        });
      },
      handleMouseOver: function(event) {
        $(this.getDOMNode())
          .addClass('highlighted')
          .siblings()
          .removeClass('highlighted');
      },
      closeTab: function(event) {
        event.stopPropagation();
        chrome.tabs.remove(this.props.data.id, function() {
          //move highleted down and delete previous tab
          moveDown();
          $(this.getDOMNode()).remove();
        });
      },
      render: function() {
        var tab = (
          React.DOM.li({
            id: this.props.data.id, 
            onClick: this.handleClick, 
            onMouseOver: this.handleMouseOver}, 

            React.DOM.div({className: "favIconContainer"}, React.DOM.img({src: this.props.data.favIconUrl})), 
            React.DOM.section({className: "tabDetails"}, 
              React.DOM.h3({className: "title"}, this.props.data.title), 
              React.DOM.p({className: "url"}, this.props.data.url)
            ), 
            React.DOM.div({className: "close-btn", onClick: this.closeTab})
          )
        );

        return tab;
      }
    });

    var TabList = React.createClass({displayName: 'TabList',
      render: function() {
        var tabs = this.props.data.map(function(tab) {
          return Tab({data: tab});
        });

        return React.DOM.ul({id: "tabsList"}, tabs);
      }
    });

    var tabListContainer = document.getElementById('tabListContainer');

    // initialize tab list view
    fetchTabs();
    React.renderComponent(TabList({data: w.tabs}), tabListContainer);

    var $tabList = $('#tabsList');
    if ($tabList.find('li:nth(1)').length > 1) {
      $tabList.find('li:nth(1)').addClass('highlighted');
    } else {
      $tabList.find('li:nth(0)').addClass('highlighted');
    }

    w.addEventListener('keydown', function(e) {
      if (e.keyCode === 27) { // escape key
        chrome.windows.remove(bp.popupWindowId, function() {});
      }
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      switch (request.event) {
        case 'tabCreated':
        case 'tabRemoved':
        case 'tabUpdated':
        case 'tabActivated':
          fetchTabs();
          if (w.tabs.length) {
            React.renderComponent(TabList({data: w.tabs}), tabListContainer);
          } else {
            window.close();
          }
          break;
        default:
          break;
      }
    });
  });
})(window, jQuery);
