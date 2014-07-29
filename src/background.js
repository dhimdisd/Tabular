(function(w) {
  function isInternalTab(tab) {
    return /^chrome-(devtools|extension)/.test(tab.url);
  }

  function complement(f) {
    return function() {
      return !f.apply(null, arguments);
    };
  }

  chrome.tabs.query({}, function(tabs) {
    w.tabs =
      tabs
        .filter(complement(isInternalTab))
        .sort(function(a, b) {
          return b.index - a.index;
        });
  });

  chrome.tabs.onCreated.addListener(function(tab) {
    if (!isInternalTab(tab)) {
      w.tabs.unshift(tab);
      chrome.runtime.sendMessage({ event: 'tabCreated' }, function(res) {});
    }
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    w.tabs = w.tabs.filter(function(tab, idx, arr) {
      return tabId !== tab.id;
    });

    chrome.runtime.sendMessage({
      event: 'tabRemoved',
      tabId: tabId
    }, function(res) {});
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var i = 0;
    while (tabId !== w.tabs[i].id) {
      ++i;
    }

    w.tabs[i] = tab;

    chrome.runtime.sendMessage({
      event: 'tabUpdated',
      tab: tab
    }, function(res) {});
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      var i = 0;

      while (tab.id !== w.tabs[i].id) {
        ++i;
      }
      w.tabs.splice(i, 1)[0];
      w.tabs.unshift(tab);

      chrome.runtime.sendMessage({
        event: 'tabActivated',
        tabId: tab.id
      })
    });
  });

  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request === 'openKeyPressed') {
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        focused: true,
        width: 300,
        height: 500,
        left: (screen.width / 2) - 150,
        top: (screen.height / 2) - 250
      }, function(popupWindow) {
        w.popupWindowId = popupWindow.id;
      });
    } else {
      sendResponse({});
    }
  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId !== w.popupWindowId && typeof w.popupWindowId === 'number') {
      chrome.windows.remove(w.popupWindowId, function() {
        w.popupWindowId = null;
      });
    }
  });
})(window);
